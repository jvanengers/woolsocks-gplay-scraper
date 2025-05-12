const express = require('express');
const gplay = require('google-play-scraper');
const app = express();

app.get('/reviews', async (req, res) => {
  const appId = req.query.appId;
  const lang = req.query.lang || 'en';
  const country = req.query.country || 'us';
  const maxReviews = parseInt(req.query.max) || 200;
  const daysAgo = parseInt(req.query.daysAgo) || 30;

  if (!appId) {
    return res.status(400).json({ error: 'Missing appId query parameter' });
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

  try {
    let allReviews = [];
    let nextToken = undefined;

    while (true) {
      const { data, nextPaginationToken } = await gplay.reviews({
        appId,
        lang,
        country,
        sort: gplay.sort.NEWEST,
        paginate: true,
        nextPaginationToken: nextToken
      });

      const recentReviews = data.filter(review => new Date(review.date) >= cutoffDate);
      allReviews.push(...recentReviews);

      if (!nextPaginationToken || recentReviews.length === 0 || allReviews.length >= maxReviews) break;

      nextToken = nextPaginationToken;

      // Introduce a delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay
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
