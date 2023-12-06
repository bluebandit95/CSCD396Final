const express = require('express');
const bodyParser = require('body-parser');
const { CosmosClient } = require('@azure/cosmos');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
//const fetch = require('node-fetch');
const path = require('path');

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  // Use body-parser middleware to parse JSON
  app.use(bodyParser.json());

  // Initialize Cosmos DB client
  const databaseId = 'TheoDoodleDatabase';
  const containerId = 'Container1';
  const cosmosEndpoint = 'https://doodledatabase.documents.azure.com:443/';

  async function getKeyVaultSecret(secretName) {
    const keyVaultUrl = 'https://doodlevault.vault.azure.net/';
    const credential = new DefaultAzureCredential();
    const secretClient = new SecretClient(keyVaultUrl, credential);
    return secretClient.getSecret(secretName);
  }

  // Fetch Cosmos DB secrets from Key Vault
  const cosmosSecret = await getKeyVaultSecret('cosmosKey');
  const cosmosClient = new CosmosClient({ endpoint: cosmosEndpoint, key: cosmosSecret.value });
  const database = cosmosClient.database(databaseId);
  const container = database.container(containerId);


  // Fetch Application Insights instrumentation key from Key Vault
  const appInsightsSecret = await getKeyVaultSecret('insightKey');
  const appInsightsKey = appInsightsSecret.value;

  // Set up Application Insights with the retrieved key
  const appInsights = require('applicationinsights');
  appInsights.setup(appInsightsKey).start();

  /*const appInsights = require('applicationinsights');
  appInsights.setup('08858e7c-2582-4d16-8c7b-8797c3515042').start();
  */

// Serve HTML file and static assets
  app.use(express.static(__dirname));

  // Handle form submission
  app.post('/submit-to-cosmos', async (req, res) => {
    const email = req.body.email;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      // Create a new item in the container
      const newItem = {
        email: email,
      };

      const { resource: createdItem } = await container.items.create(newItem);
     
      res.json({ message: 'Sign-up successful for Cosmos DB!', createdItem: newItem });
  

      // Logic App email
      const logicAppEndpoint = 'https://prod-01.eastus.logic.azure.com:443/workflows/dd7e8c80bb664f2d8cb79171dc3602ee/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=GVpJPGDCpEpzqHxvxTNgJWzeCLCzvAFHVc7T2y2IYlo';

      const logicAppRequestBody = {
        email: email,
      };

      await fetch(logicAppEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logicAppRequestBody),
      });
    } catch (error) {
      console.error('Error creating item in Cosmos DB:', error);
      res.status(500).json({ error: 'Internal Server Error. Please try again later for Cosmos DB.' });
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
}

// Call the async function
startServer();

