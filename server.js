const express = require('express');
const notionModule = require('./notionModule');
const notioncontentModule = require('./notioncontentModule');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Set up caching middleware for /notion-data
const dataCache = {}; // Simple in-memory cache for /notion-data

// Middleware function to cache responses with a 7-day expiration duration
const dataCacheMiddleware = (req, res, next) => {
  const key = req.url;
  const cacheEntry = dataCache[key];

  if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
    // Serve cached response if available and not expired
    res.json(cacheEntry.data);
  } else {
    // Continue to the route handler if not cached or expired
    next();
  }
};

// Set up caching middleware for /notion-content
const contentCache = {}; // Simple in-memory cache for /notion-content

// Middleware function to cache responses with a 7-day expiration duration
const contentCacheMiddleware = (req, res, next) => {
  const key = req.url;
  const cacheEntry = contentCache[key];

  if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
    // Serve cached response if available and not expired
    res.json(cacheEntry.data);
  } else {
    // Continue to the route handler if not cached or expired
    next();
  }
};

app.use(express.static(path.join(__dirname, 'public')));

// Apply the cache middleware to the /notion-data endpoint
app.get('/notion-data', dataCacheMiddleware, async (req, res) => {
  try {
    const pageData = await notionModule();
    // Cache the response with an expiration time (7 days from now)
    dataCache[req.url] = {
      data: pageData,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    };
    res.json(pageData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Apply the cache middleware to the /notion-content/:pageId endpoint
app.get('/notion-content/:pageId', contentCacheMiddleware, async (req, res) => {
  try {
    const { pageId } = req.params;
    const contentData = await notioncontentModule(pageId);
    // Cache the response with an expiration time (7 days from now)
    contentCache[req.url] = {
      data: contentData,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    };
    res.json(contentData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
