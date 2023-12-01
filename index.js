const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Use body-parser middleware to parse JSON
app.use(bodyParser.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Handle form submission
app.post('/submit', (req, res) => {
  const email = req.body.email;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Handle the email as needed, for example, store it in a database

  res.json({ message: 'Sign-up successful!' });
});

// Handle requests to the root path
app.get('/', (req, res) => {
  // Read the contents of index.html and send it as the response
  const indexPath = path.join(__dirname, 'index.html');
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading index.html: ${err.message}`);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(data);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
