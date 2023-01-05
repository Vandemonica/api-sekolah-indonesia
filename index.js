require('dotenv').config()

const puppeteer = require('puppeteer');
const express = require('express');

const app = express();

async function main(querySearch, queryPage) {
  const browser = await puppeteer.launch({});
  const page = await browser.newPage();

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

  browser.close();

  return results;
}


app.get('/', async function(req, res) {
  if (typeof req.query.search === 'undefined') {
    res.send('Tolong sertakan GET query params `search`')
  }

  res.json(await main(req.query.search, req.query.page ?? 1));
});

app.listen(process.env.APP_PORT, function() {
  console.log(`Running on http://localhost:${process.env.APP_PORT}`);
});
