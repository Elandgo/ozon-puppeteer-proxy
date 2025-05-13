const express     = require('express');
const cloudscraper = require('cloudscraper');

const app  = express();
const PORT = process.env.PORT || 10000;

// Эндпоинт proxy: ?url=https://www.ozon.ru/product/…
app.get('/scrape', async (req, res) => {
  const target = req.query.url;
  if (!target) {
    return res.status(400).send('Missing ?url');
  }

  try {
    // cloudscraper сам обрабатывает JS-challenge Cloudflare
    const html = await cloudscraper.get({
      uri: target,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                      'Chrome/115.0.0.0 Safari/537.36'
      },
      gzip: true
    });

    res
      .set('Access-Control-Allow-Origin', '*')
      .type('text/html')
      .send(html);
  } catch (e) {
    console.error('Cloudscraper error:', e);
    res.status(500).send('Error: ' + e.message);
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
