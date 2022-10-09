import { createCheerioRouter } from 'crawlee';
import { Cheerio, AnyNode } from 'cheerio';
import { Actor } from 'apify';
import { CheerioRoot, log, RequestQueue } from 'crawlee';
import { decode } from 'html-entities';

import {
    API_REQUEST_HEADERS,
    ATTRIBUTE_NAME_SELECTOR,
    ATTRIBUTE_SECTION_SELECTOR,
    ATTRIBUTE_VALUES_SELECTOR,
    BESKYDO_SELLER_ID,
    CATEGORIES_SELECTOR,
    DOMAIN,
    DUMMY_PAYLOAD_PARAM,
    FLER_CATEGORIES_SELECTOR,
    IMAGES_SELECTOR,
    IMPORTANT_INFO_SELECTOR,
    KEYWORDS_SELECTOR,
    LABELS,
    PAGINATION_ATTR,
    PAGINATION_SELECTOR,
    RESULTS_PER_PAGE,
    SELLER_ID_ATTR,
    SELLER_ID_SELECTOR,
    STYLED_DESCRIPTION_SELECTOR
} from './constants.js';

import {
    Attribute,
    Category,
    ProductInfo,
    ProductSimpleInfo,
    ResponseProductSimpleInfo,
    ResponseSellerInfo,
    SellerInfo
} from './types.js';

import {
    buildUrl,
    convertSizeToReadableFormat,
    parseNumber,
    shuffleChars
} from './utils.js';

export const router = createCheerioRouter();

router.addDefaultHandler(async ({ $, request: { url }, crawler }) => {
    log.info(`Extracting total number of pages`, { url });

    const paginationElements = $(PAGINATION_SELECTOR);

    const lastPageText = $(paginationElements[paginationElements.length - 1]).attr(PAGINATION_ATTR);
    const lastPage = lastPageText ? Number(lastPageText) : 1;

    log.info(`Found ${lastPage} pages with products`);

    const sellerId = $(SELLER_ID_SELECTOR).attr(SELLER_ID_ATTR) || BESKYDO_SELLER_ID;

    const requestQueue = crawler.requestQueue ? crawler.requestQueue : await Actor.openRequestQueue();

    await enqueueApiListRequests(lastPage, sellerId, requestQueue);
});

router.addHandler(LABELS.API_LIST, async ({ json, crawler, request: { userData: { page } } }) => {
    log.info(`Extracting simple products info from page ${page}`);

    const productList = json.response.data.data_list.product_list;
    log.info(`Found ${productList.length} products on page ${page}`);

    const requestQueue = crawler.requestQueue ? crawler.requestQueue : await Actor.openRequestQueue();

    for (const product of productList) {
        const sellerInfo = buildSellerInfo(product);
        const productInfo = buildProductInfo(product);

        await requestQueue.addRequest({
            url: productInfo.url,
            userData: {
                simpleInfo: { sellerInfo, ...productInfo },
                label: LABELS.DETAIL,
            },
        });
    }
});

router.addHandler(LABELS.DETAIL, async ({ $, request: { url, userData: { simpleInfo } } }) => {
    log.info(`Extracting product info`, { url });

    const attributes = parseAttributes($);

    const productInfo : ProductInfo = {
        ...simpleInfo,
        images: parseImages($),
        importantInfo: $(IMPORTANT_INFO_SELECTOR).text().trim(),
        styledDescription: parseStyledDescription($),
        categories: parseCategories($, $(CATEGORIES_SELECTOR)),
        flerCategories: parseCategories($, $(FLER_CATEGORIES_SELECTOR)),
        keywords: parseCategories($, $(KEYWORDS_SELECTOR)),
        attributes,
    };

    await Actor.pushData(productInfo);
});

const enqueueApiListRequests = async (lastPage: number, sellerId: string, requestQueue: RequestQueue) => {
    for (let offset = 0; offset < lastPage * RESULTS_PER_PAGE; offset += RESULTS_PER_PAGE) {
        const payload = `seller_shop=${sellerId}&offset=${offset}&conf=&_dummy=${shuffleChars(DUMMY_PAYLOAD_PARAM)}`;

        const url = 'https://www.fler.cz/component/default/product_listing/load_shop';
        const page = (offset / RESULTS_PER_PAGE) + 1;

        log.info(`Enqueuing request with offset ${offset} (page ${page})`);

        await requestQueue.addRequest({
            url,
            uniqueKey: `${url}-${offset}`,
            method: 'post',
            payload,
            headers: API_REQUEST_HEADERS,
            userData: {
                page,
                label: LABELS.API_LIST,
            },
        });
    }
};

const buildSellerInfo = (response: ResponseSellerInfo) : SellerInfo => {
    const {
        seller_id: id,
        seller_name: name,
        seller_url: relUrl,
        seller_avatar: avatar,
        seller_num_items: totalItems,
        seller_num_sold: soldItems,
    } = response;

    return {
        id,
        name: decode(name),
        url: buildUrl(relUrl),
        avatar,
        totalItems,
        soldItems,
    };
};

const buildProductInfo = (response: ResponseProductSimpleInfo) : ProductSimpleInfo => {
    const {
        url: relUrl,
        title,
        description,
        thumb: thumbnail,
        price_czk: priceCzk,
        price_eur: priceEur,
        flagcorners,
    } = response;

    return {
        url: buildUrl(relUrl),
        title: decode(title),
        description: decode(description),
        thumbnail,
        priceCzk: parseNumber(priceCzk),
        priceEur: parseNumber(priceEur),
        flagcorners,
    };
};

const parseImages = ($: CheerioRoot) : string[] => {
    return Array.from(
        new Set(
            $(IMAGES_SELECTOR).map((_i, el) => $(el).attr('data-src')).toArray()
        )
    );
};

const parseStyledDescription = ($: CheerioRoot) : string => {
    const html = $(STYLED_DESCRIPTION_SELECTOR).html();

    return html
        ? decode(html.trim())
            .replace(/[\r\n]/g, '')
            .replace(/\u00a0/gi, ' ')
            .replace(/<a href="\//gi, `<a href="${DOMAIN}/`)
        : '';
};

const parseCategories = ($: CheerioRoot, categoryElements: Cheerio<AnyNode>) : Category[] => {
    return categoryElements.map((_i, el) => ({
        name: $(el).text().trim(),
        url: buildUrl($(el).attr('href') || '')
    })).toArray();
};

const parseAttributes = ($: CheerioRoot) : Attribute[] => {
    const attributeSections = $(ATTRIBUTE_SECTION_SELECTOR);

    const attributes : Attribute[] = attributeSections.map((_i, el) => {
        const name = $(el).find(ATTRIBUTE_NAME_SELECTOR).text().trim();
        const categories = parseCategories($, $(el).find(ATTRIBUTE_VALUES_SELECTOR));

        const values = name.toLowerCase() !== 'velikost'
            ? categories
            : categories.map(({ name, url }) => ({ name: convertSizeToReadableFormat(name), url }));

        return { name, values };
    }).toArray();

    return attributes;
};
