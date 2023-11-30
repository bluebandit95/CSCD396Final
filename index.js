const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Use body-parser middleware to parse JSON
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Handle form submission
app.post('/submit', (req, res) => {
  const email = req.body.email;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Handle the email as needed, for example, store it in a database

  res.json({ message: 'Sign-up successful!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
