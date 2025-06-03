// routes/reverseGeocode.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  const { lat, lon } = req.query;

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon,
        format: 'json'
      },
      headers: {
        'User-Agent': 'CollegeCoders/1.0 (surya@example.com)' // Required by Nominatim
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Reverse geocoding failed' });
  }
});

router.get('/forward-geocode', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error('Forward geocoding error:', error);
    res.status(500).json({ message: 'Error processing geocoding request' });
  }
});

module.exports = router;
