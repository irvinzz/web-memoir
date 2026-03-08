import { importCrawlee, importPlaywright } from '../playwright';

export interface CrawlOptions {
  startUrl: string;
  progressFile: string;
  proxyUrl?: string;
  chromiumExecutablePath?: string;
  progressCallback?: (state: { visited: number; pending: number }) => void;
}

export async function crawlWebsite(opts: CrawlOptions): Promise<void> {
  const { PlaywrightCrawler, RequestQueue } = importCrawlee();
  const { chromium } = importPlaywright();

  const requestQueue = await RequestQueue.open();

  requestQueue.addRequest({ url: opts.startUrl });

  const crawler = new PlaywrightCrawler({
    requestQueue,
    headless: false,
    launchContext: {
      launcher: chromium,
      proxyUrl: opts.proxyUrl,
      launchOptions: opts.chromiumExecutablePath
        ? { executablePath: opts.chromiumExecutablePath }
        : undefined,
    },
    // Allow the crawler to keep running until the queue is empty.
    maxRequestsPerCrawl: Number.MAX_SAFE_INTEGER,

    async requestHandler({ request, enqueueLinks }) {
      await requestQueue.addRequests([
        {
          url: request.url,
        },
      ]);

      await enqueueLinks();

      // const url = request.url;
      // log.info(`Crawling ${url}`);
      // state.visited.add(url);

      // Enqueue only same‑origin links that have not been seen yet.
      // await enqueueLinks({
      //   strategy: 'same-origin',
      //   transformRequestFunction: (req) => {
      //     if (state.visited.has(req.url) || state.pending.includes(req.url)) {
      //       return null;
      //     }
      //     return req;
      //   },
      // });

      // Persist progress after handling this page.
      // await saveProgress();

      // Notify caller about current progress.
      // if (opts.progressCallback) {
      //   opts.progressCallback({
      //     visited: state.visited.size,
      //     pending: state.pending.length,
      //   });
      // }
    },

    failedRequestHandler({ request, log }) {
      log.error(`Failed to fetch ${request.url}`);
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
