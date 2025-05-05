const express = require('express');
const gplay = require('google-play-scraper');
const app = express();

app.get('/reviews', async (req, res) => {
  const appId = req.query.appId;
  const lang = req.query.lang || 'en';
  const country = req.query.country || 'us';
  const page = parseInt(req.query.page) || 0;

  if (!appId) {
    return res.status(400).json({ error: 'Missing appId query parameter' });
  }

  try {
    const reviews = await gplay.reviews({
      appId,
      lang,
      country,
      sort: gplay.sort.NEWEST,
      num: 40,
      paginate: true,
      nextPaginationToken: page
    });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Google Play Reviews API listening on port ${port}`);
});
