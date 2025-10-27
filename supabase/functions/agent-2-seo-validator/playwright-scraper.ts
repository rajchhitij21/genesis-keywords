// Playwright backup scraper for Agent 2 V3
// Used when all Serper keys are exhausted

import { chromium } from 'playwright';

export interface PlaywrightSerpData {
  organic: Array<{
    position: number;
    title: string;
    link: string;
    snippet: string;
    date?: string;
  }>;
  ads: Array<{
    title: string;
    link: string;
  }>;
  peopleAlsoAsk: Array<{
    question: string;
  }>;
  relatedSearches: Array<{
    query: string;
  }>;
  videos?: Array<{
    title: string;
    link: string;
  }>;
  news?: Array<{
    title: string;
    link: string;
    date?: string;
  }>;
}

export async function scrapeSerpWithPlaywright(keyword: string): Promise<PlaywrightSerpData> {
  console.log(`🎭 Playwright backup scraping: "${keyword}"`);
  
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process'
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    // Navigate to Google search
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=10&hl=en`;
    await page.goto(searchUrl, { waitUntil: 'networkidle' });

    // Wait for results to load
    await page.waitForTimeout(2000);

    // Extract organic results
    const organic = await page.$$eval('.g', (elements) => {
      return elements.map((el, index) => {
        const titleEl = el.querySelector('h3');
        const linkEl = el.querySelector('a');
        const snippetEl = el.querySelector('.VwiC3b, .s3v9rd, .st');
        const dateEl = el.querySelector('.f, .s');

        return {
          position: index + 1,
          title: titleEl?.textContent?.trim() || '',
          link: linkEl?.href || '',
          snippet: snippetEl?.textContent?.trim() || '',
          date: dateEl?.textContent?.trim() || undefined
        };
      }).filter(result => result.title && result.link);
    }).catch(() => []);

    // Extract ads
    const ads = await page.$$eval('.uEierd, .v0nnCb', (elements) => {
      return elements.map(el => {
        const titleEl = el.querySelector('.v0nnCb, .CCgQ5');
        const linkEl = el.querySelector('a');

        return {
          title: titleEl?.textContent?.trim() || '',
          link: linkEl?.href || ''
        };
      }).filter(ad => ad.title);
    }).catch(() => []);

    // Extract People Also Ask
    const peopleAlsoAsk = await page.$$eval('[jsname="Cpkphb"], .related-question-pair', (elements) => {
      return elements.map(el => {
        const questionEl = el.querySelector('.CSkcDe, span');
        return {
          question: questionEl?.textContent?.trim() || ''
        };
      }).filter(paa => paa.question);
    }).catch(() => []);

    // Extract Related Searches
    const relatedSearches = await page.$$eval('.k8XOCe, .s75CSd', (elements) => {
      return elements.map(el => ({
        query: el.textContent?.trim() || ''
      })).filter(related => related.query);
    }).catch(() => []);

    // Extract Videos (if present)
    const videos = await page.$$eval('.RzdJxc', (elements) => {
      return elements.map(el => {
        const titleEl = el.querySelector('.fc9yUc');
        const linkEl = el.querySelector('a');
        
        return {
          title: titleEl?.textContent?.trim() || '',
          link: linkEl?.href || ''
        };
      }).filter(video => video.title);
    }).catch(() => []);

    // Extract News (if present)
    const news = await page.$$eval('.SoaBEf', (elements) => {
      return elements.map(el => {
        const titleEl = el.querySelector('.n0jPhd');
        const linkEl = el.querySelector('a');
        const dateEl = el.querySelector('.OSrXXb');
        
        return {
          title: titleEl?.textContent?.trim() || '',
          link: linkEl?.href || '',
          date: dateEl?.textContent?.trim() || undefined
        };
      }).filter(newsItem => newsItem.title);
    }).catch(() => []);

    console.log(`✅ Playwright extracted: ${organic.length} organic, ${ads.length} ads, ${peopleAlsoAsk.length} PAA`);

    return {
      organic,
      ads,
      peopleAlsoAsk,
      relatedSearches,
      videos: videos.length > 0 ? videos : undefined,
      news: news.length > 0 ? news : undefined
    };

  } finally {
    await context.close();
    await browser.close();
  }
}