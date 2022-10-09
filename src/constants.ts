export const PAGINATION_ATTR = 'data-pagenum';
export const SELLER_ID_ATTR = 'data-id_seller';

// List page selectors
export const PAGINATION_SELECTOR = `.num[${PAGINATION_ATTR}]`;
export const SELLER_ID_SELECTOR = `[${SELLER_ID_ATTR}]`;

// Detail page selectors
export const IMAGES_SELECTOR = '.productimg:not(.loaded)';
export const IMPORTANT_INFO_SELECTOR = '.seller_unit-important_message .text';
export const STYLED_DESCRIPTION_SELECTOR = '.product_unit-description';
export const CATEGORIES_SELECTOR = '.product_unit-personal_cat a';
export const FLER_CATEGORIES_SELECTOR = '.product_unit-fler_sections a';
export const KEYWORDS_SELECTOR = '.product_unit-keywords a';
export const ATTRIBUTE_SECTION_SELECTOR = '.product_unit-attributes .section';
export const ATTRIBUTE_NAME_SELECTOR = '.section-label';
export const ATTRIBUTE_VALUES_SELECTOR = '.list-wrap ul li a';

export const RESULTS_PER_PAGE = 36;

// Arbitrary 13-digit number
export const DUMMY_PAYLOAD_PARAM = '1659623079243';

export const BESKYDO_SELLER_ID = '5335';

export const DOMAIN = 'www.fler.cz';

export const API_REQUEST_HEADERS = {
    Host: DOMAIN,
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
};

export const LABELS = {
    API_LIST: 'API_LIST',
    DETAIL: 'DETAIL',
};
