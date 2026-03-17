import { ProxyConfiguration } from 'crawlee';

import { importCrawlee, importPlaywright } from '../playwright';
import { createLogger } from '../logger';

export interface CrawlOptions {
  startUrl: string;
  proxyUrl: string;
  progressCallback?: (state: { visited: number; pending: number }) => void;
}

const logger = createLogger('crawler');

export async function crawlWebsite(opts: CrawlOptions): Promise<void> {
  const { PlaywrightCrawler, RequestQueue } = importCrawlee();
  const { chromium } = importPlaywright();

  const requestQueue = await RequestQueue.open(`crawl-${opts.startUrl}`);

  requestQueue.addRequest({ url: opts.startUrl });

  // pick up from stored state file?
  const visited: string[] = [];
  const crawler = new PlaywrightCrawler({
    requestQueue,
    headless: false,
    launchContext: {
      launcher: chromium,
    },
    proxyConfiguration: new ProxyConfiguration({
      proxyUrls: [opts.proxyUrl],
    }),
    maxRequestsPerCrawl: Number.MAX_SAFE_INTEGER,
    async requestHandler(context) {
      const { request, enqueueLinks } = context;
      await requestQueue.addRequests([
        {
          url: request.url,
        },
      ]);

      visited.push(request.url);
      await enqueueLinks({
        strategy: 'same-origin',
        transformRequestFunction: (req) => {
          if (visited.includes(req.url)) return null;
          return req;
        },
      });

      // Notify caller about current progress.
      // if (opts.progressCallback) {
      //   opts.progressCallback({
      //     visited: state.visited.size,
      //     pending: state.pending.length,
      //   });
      // }
    },

    failedRequestHandler({ request }) {
      logger.error(`Failed to fetch ${request.url}`);
    },
  });

  // -------------------------------------------------
  // Process the queue – keep pulling from `state.pending` until it empties.
  // -------------------------------------------------
  // while (state.pending.length > 0) {
  //   const batch = state.pending.splice(0, Math.min(state.pending.length, 10));
  //   const requests = batch
  //     .filter((url) => !state.visited.has(url))
  //     .map((url) => new Request(url));
  //   if (requests.length > 0) {
  //     await (requests);
  //   }
  //   // Safety‑net persistence in case the process is terminated between batches.
  //   await saveProgress();
  // }

  await crawler.run();

  // Final persist – ensures the file reflects a fully completed crawl.
  // await saveProgress();
}
