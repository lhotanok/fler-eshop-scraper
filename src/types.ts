export type InputSchema = {
    sellerUrls: string[];
    maxItems?: number;
    proxyConfiguration: ProxyConfigurationInput;
};

export interface ProxyConfigurationInput {
    useApifyProxy?: boolean;
    apifyProxyGroups?: string[]
    apifyProxyCountry?: string
    proxyUrls?: string[]
};

export type SellerInfo = {
    id: string;
    name: string;
    url: string;
    avatar: string;
    totalItems: number;
    soldItems: number;
};

export interface PagesState {
    remainingPages: number;
};

export type ProductSimpleInfo = {
    url: string;
    title: string;
    description: string;
    thumbnail: string;
    priceCzk: number;
    priceEur: number;
    flagcorners: string[];
};

export type Category = {
    name: string;
    url: string;
};

export type Attribute = {
    name: string;
    values: Category[];
};

export interface ProductInfo extends ProductSimpleInfo {
    images: string[];
    importantInfo: string;
    styledDescription: string;
    categories: Category[];
    flerCategories: Category[];
    sizes: string[];
    keywords: Category[];
    attributes: Attribute[];
};

export type ResponseSellerInfo = {
    seller_id: string;
    seller_name: string;
    seller_url: string;
    seller_avatar: string;
    seller_num_items: number;
    seller_num_sold: number;
};

export type ResponseProductSimpleInfo = {
    id: string;
    url: string;
    title: string;
    description: string;
    thumb: string;
    price_czk: string;
    price_eur: string;
    flagcorners: string[];
};

