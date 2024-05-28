const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const ShortUrl = require('./models/shortUrl');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/urlShortener')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Connection error', err);
  });

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'yourSecretKey', // replace 'yourSecretKey' with a real secret
  resave: false,
  saveUninitialized: true
}));

// Render the main page
app.get('/', (req, res) => {
  const shortUrl = req.session.shortUrl;
  req.session.shortUrl = null; // Clear the session data after displaying it
  res.render('index', { shortUrl: shortUrl });
});

// Handle form submission to create a short URL
app.post('/shortUrls', async (req, res) => {
  try {
    const newShortUrl = await ShortUrl.create({ full: req.body.fullUrl });
    req.session.shortUrl = newShortUrl; // Store the short URL in the session
    res.redirect('/');
  } catch (err) {
    console.error('Error creating short URL', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
  if (shortUrl == null) return res.sendStatus(404);
  res.redirect(shortUrl.full);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
