const appInsights = require('applicationinsights');
appInsights.setup('08858e7c-2582-4d16-8c7b-8797c3515042').start();

const express = require('express');
const bodyParser = require('body-parser');
const { CosmosClient } = require('@azure/cosmos');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Use body-parser middleware to parse JSON
app.use(bodyParser.json());

// Replace these values with your Cosmos DB connection details
const cosmosEndpoint = 'https://doodledatabase.documents.azure.com:443/';
const cosmosKey = '8nWPvD9Ry8DeUPk1JCfxvm6AZ4Q4fWH6Hcw5yITVC3YFn6AYXFF00xIXTwde9sOzNvJHT65YaAE5ACDbXt8cCg==';
const databaseId = 'TheoDoodleDatabase';
const containerId = 'Container1';

// Initialize Cosmos DB client
const cosmosClient = new CosmosClient({ endpoint: cosmosEndpoint, key: cosmosKey });
const database = cosmosClient.database(databaseId);
const container = database.container(containerId);

// Serve HTML file and static assets
app.use(express.static(__dirname)); // Serve static files from the same directory as index.js

// Handle form submission
app.post('/submit', async (req, res) => {
  const email = req.body.email;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Create a new item in the container
    const newItem = {
      email: email,
      // Add other properties as needed
    };

    const { resource: createdItem } = await container.items.create(newItem);

    res.json({ message: 'Sign-up successful!', createdItem });
  } catch (error) {
    console.error('Error creating item in Cosmos DB:', error);
    res.status(500).json({ error: 'Internal Server Error. Please try again later.' });
  }
});

// Serve HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


