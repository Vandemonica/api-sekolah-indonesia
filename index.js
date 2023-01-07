require('dotenv').config()

const puppeteer = require('puppeteer');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const ignoredDOM = ['stylesheet', 'font', 'image'];

async function main(querySearch, queryPage) {
  const browser = await puppeteer.launch({
    headless: true,
    devtools: false,
    args: [
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-breakpad',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-dev-shm-usage',
      '--disable-domain-reliability',
      '--disable-extensions',
      '--disable-features=AudioServiceOutOfProcess',
      '--disable-hang-monitor',
      '--disable-ipc-flooding-protection',
      '--disable-notifications',
      '--disable-offer-store-unmasked-wallet-cards',
      '--disable-popup-blocking',
      '--disable-print-preview',
      '--disable-prompt-on-repost',
      '--disable-renderer-backgrounding',
      '--disable-setuid-sandbox',
      '--disable-speech-api',
      '--disable-sync',
      '--hide-scrollbars',
      '--ignore-gpu-blacklist',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-first-run',
      '--no-pings',
      '--no-sandbox',
      '--no-zygote',
      '--password-store=basic',
      '--use-gl=swiftshader',
      '--use-mock-keychain'
    ]
  });

  const page = await browser.newPage();

  await page.setViewport({ width: 375, height: 667 });
  await page.setRequestInterception(true);

  page.on('request', (req) => {
    if(ignoredDOM.includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto(`https://referensi.data.kemdikbud.go.id/pendidikan/cari/${querySearch}`);
  await page.waitForSelector('#table1_wrapper');
  await page.select('select[name="table1_length"]', '100');

  if (queryPage > 0) {
    for (let i = 0; i < (queryPage - 1); i++){
      await page.click('#table1_wrapper #table1_next');
    }
  }


  const results = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#table1_wrapper tbody tr')];

    return rows.map(row => {
      return [...row.querySelectorAll('td')].map(column => column.innerText);
    });
  });

  console.log('Data fetched!');
  browser.close();

  return results;
}


app.get('/', async function(req, res) {
  if (typeof req.query.search === 'undefined') {
    res.send('Tolong sertakan GET query params `search`')
  }

  res.json(await main(req.query.search, req.query.page ?? 1));
});

app.listen(PORT, function() {
  console.log(`Running on http://localhost:${PORT}`);
});
