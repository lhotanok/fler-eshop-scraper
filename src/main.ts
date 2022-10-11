import { Actor } from 'apify';
import { CheerioCrawler } from 'crawlee';
import { router } from './routes.js';
import { InputSchema, PagesState } from './types.js';

await Actor.init();

const {
    sellerUrls,
    maxItems,
    proxyConfiguration: proxyConfigurationInput,
} = await Actor.getInput<InputSchema>() ?? {};

const proxyConfiguration = await Actor.createProxyConfiguration(proxyConfigurationInput);

const crawler = new CheerioCrawler({
    proxyConfiguration,
    maxConcurrency: 50,
    navigationTimeoutSecs: 60,
    requestHandler: router,
    additionalMimeTypes: ['application/json'],
});

await crawler.useState<PagesState>({ remainingPages: maxItems || Number.MAX_SAFE_INTEGER });

await crawler.run(sellerUrls);

await Actor.exit();
