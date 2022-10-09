import { DOMAIN } from './constants.js';

export const buildUrl = (relUrl: string) => `https://${DOMAIN}${relUrl}`;

export const shuffleChars = (text: string): string => {
    return text.split('').sort(() => 0.5 - Math.random()).join('');
};

export const parseNumber = (text: string): number => {
    return Number(text.replace(/[^\d,.]+/g, '').replace(/,/g, '.'));
};

export const convertSizeToReadableFormat = (size: string) : string => {
    const lowercaseSize = size.toLowerCase();
    if (!lowercaseSize.includes('x')) {
        return size;
    }

    let xCount = 0;

    for (let index = 0; index < lowercaseSize.length; index++) {
        const char = lowercaseSize[index];
        if (char === 'x') {
            xCount++;
        }
    }

    return xCount <= 1 ? size : `${xCount}XL`;
};
