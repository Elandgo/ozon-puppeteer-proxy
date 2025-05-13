const express = require('express');
const puppeteer = require('puppeteer-extra');
const Stealth = require('puppeteer-extra-plugin-stealth');
puppeteer.use(Stealth());

const app  = express();
const PORT = process.env.PORT || 10000;

app.get('/scrape', async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send('Missing ?url');
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox','--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    await page.goto(target, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(3000);
    const html = await page.content();
    await browser.close();
    res.set('Access-Control-Allow-Origin','*').type('text/html').send(html);
  } catch (e) {
    res.status(500).send('Error: '+ e.message);
  }
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
