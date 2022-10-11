import { DOMAIN } from './constants.js';

export const buildUrl = (relUrl: string) => `https://${DOMAIN}${relUrl}`;

export const shuffleChars = (text: string): string => {
    return text.split('').sort(() => 0.5 - Math.random()).join('');
};

export const parseNumber = (text: string): number => {
    return Number(text.replace(/[^\d,.]+/g, '').replace(/,/g, '.'));
};

