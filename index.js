const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Подключаем плагин stealth для обхода антибот-защиты
puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 10000;

// Эндпоинт для скрейпа страницы товара Ozon
app.get('/scrape', async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send('Missing ?url');

  try {
    // Запускаем browser с явным указанием бинаря Chromium
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
        '--no-zygote'
      ],
      dumpIO: true,
      pipe: true
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    await page.goto(target, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForTimeout(3000);

    const html = await page.content();
    await browser.close();

    res
      .set('Access-Control-Allow-Origin', '*')
      .type('text/html')
      .send(html);
  } catch (e) {
    console.error('Puppeteer error:', e);
    res.status(500).send('Error: ' + e.message);
  }
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
