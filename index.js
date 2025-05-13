const express     = require('express');
const cloudscraper = require('cloudscraper');

const app  = express();
const PORT = process.env.PORT || 10000;

app.get('/scrape', async (req, res) => {
  const target = req.query.url;
  if (!target || !/^https:\/\/www\.ozon\.ru/.test(target)) {
    return res.status(400).send('Invalid or missing ?url=https://www.ozon.ru/…');
  }

  try {
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
  } catch (err) {
    console.error('Cloudscraper error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
