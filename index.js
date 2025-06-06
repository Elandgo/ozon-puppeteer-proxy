const express   = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const app       = express();
const PORT      = process.env.PORT || 10000;

app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing ?url');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8'
    });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    const html = await page.content();
    res.set('Access-Control-Allow-Origin','*').send(html);
  } catch(e) {
    res.status(500).send('Error: ' + e.message);
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
