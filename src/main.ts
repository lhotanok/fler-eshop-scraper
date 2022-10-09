import { Actor } from 'apify';
import { CheerioCrawler, log } from 'crawlee';
import { router } from './routes.js';
import { InputSchema } from './types.js';

await Actor.init();

const {
    sellerUrls = [],
    proxyConfiguration: proxyConfigurationInput,
} = await Actor.getInput<InputSchema>() ?? {};

const proxyConfiguration = await Actor.createProxyConfiguration(proxyConfigurationInput);

const crawler = new CheerioCrawler({
    proxyConfiguration,
    maxConcurrency: 50,
    requestHandler: router,
    additionalMimeTypes: ['application/json'],
});

await crawler.run(sellerUrls);

await Actor.exit();
