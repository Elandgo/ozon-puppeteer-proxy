const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  const target = req.query.url;
  if (!target || !/^https:\/\/www\.ozon\.ru/.test(target)) {
    return res.status(400).send('Invalid or missing ?url=https://www.ozon.ru/...');
  }
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox','--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    await page.goto(target, { waitUntil: 'networkidle2', timeout: 30000 });
    const html = await page.content();
    await browser.close();
    res.set('Access-Control-Allow-Origin', '*');
    res.type('text/html').send(html);
  } catch (e) {
    res.status(500).send('Puppeteer error: ' + e.message);
  }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
