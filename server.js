const express = require('express');
const gplay = require('google-play-scraper');
const app = express();

app.get('/reviews', async (req, res) => {
  const appId = req.query.appId;
  const lang = req.query.lang || 'en';
  const country = req.query.country || 'us';
  const maxReviews = parseInt(req.query.max) || 200;

  if (!appId) {
    return res.status(400).json({ error: 'Missing appId query parameter' });
  }

  try {
    let allReviews = [];
    let nextToken = undefined;

    while (allReviews.length < maxReviews) {
      const { data, nextPaginationToken } = await gplay.reviews({
        appId,
        lang,
        country,
        sort: gplay.sort.NEWEST,
        num: 40,
        paginate: true,
        nextPaginationToken: nextToken
      });

      allReviews.push(...data);
      if (!nextPaginationToken || data.length === 0) break;

      nextToken = nextPaginationToken;
    }

    res.json(allReviews.slice(0, maxReviews));
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Google Play Reviews API listening on port ${port}`);
});
