const express = require('express');
const puppeteer = require('puppeteer-extra');
const Stealth = require('puppeteer-extra-plugin-stealth');

// Включаем stealth-плагин
puppeteer.use(Stealth());

const app  = express();
const PORT = process.env.PORT || 10000;

app.get('/scrape', async (req, res) => {
  const target = req.query.url;
  if (!target) {
    return res.status(400).send('Missing ?url');
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
        '--no-zygote'
      ]
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    
    // Блокируем загрузку картинок и стилей, чтобы ускорить
    await page.setRequestInterception(true);
    page.on('request', r => {
      if (['image','stylesheet','font'].includes(r.resourceType())) r.abort();
      else r.continue();
    });

    // Заходим и ждём полной загрузки + завершения JS-редиректов
    await page.goto(target, { waitUntil: 'networkidle0', timeout: 60000 });
    // Дополнительная проверка: ждём, пока в DOM появится заголовок товара
    await page.waitForFunction(
      () => !!document.querySelector('h1[data-widget="webProductHeading"]'),
      { timeout: 60000 }
    );

    const html = await page.content();
    res
      .set('Access-Control-Allow-Origin','*')
      .type('text/html')
      .send(html);

  } catch (e) {
    console.error(e);
    res.status(500).send('Error: ' + e.message);
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
