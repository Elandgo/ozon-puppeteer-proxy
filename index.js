const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Используем stealth-плагин для обхода антибот-защиты
puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 10000;

// Эндпоинт прокси: ?url=https://www.ozon.ru/product/…
app.get('/scrape', async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send('Missing ?url');

  let browser;
  try {
    // Запускаем headless-браузер с системным Chromium
    browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
        '--no-zygote',
        '--disable-blink-features=AutomationControlled'
      ],
      dumpIO: true,
      pipe: true
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    // Открываем страницу и ждём пока сеть успокоится
    await page.goto(target, { waitUntil: 'networkidle2', timeout: 60000 });
    // Фиксированная пауза 5 секунд для завершения JS-челленджа
    await new Promise(resolve => setTimeout(resolve, 5000));

    const html = await page.content();
    res
      .set('Access-Control-Allow-Origin', '*')
      .type('text/html')
      .send(html);

  } catch (e) {
    console.error('Puppeteer error:', e);
    res.status(500).send('Error: ' + e.message);
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
