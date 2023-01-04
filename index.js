const puppeteer = require('puppeteer');
const express = require('express');

const app = express();

async function main(querySearch, queryPage) {
  const browser = await puppeteer.launch({});
  const page = await browser.newPage();

  await page.goto(`https://referensi.data.kemdikbud.go.id/pendidikan/cari/${querySearch}`);
  await page.waitForSelector('#table1_wrapper');
  await page.select('select[name="table1_length"]', '100');

  const results = await page.evaluate(() => {
    const rows = document.querySelectorAll('#table1_wrapper tbody tr');

    return Array.from(rows, row => {
      return Array.from(row.querySelectorAll('td'), column => column.innerText);
    });
  });

  browser.close();

  return results;
}


app.get('/', async function(req, res) {
  if (typeof req.query.search === 'undefined') {
    res.send('Tolong berikan GET query param')
  }

  res.json(await main(req.query.search, req.query.page));
});

app.listen(3000, function() {
  console.log('Running on http://localhost:3000');
});
