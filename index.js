const express = require('express');
const bodyParser = require('body-parser');
const { CosmosClient } = require('@azure/cosmos');
const validator = require('validator');

const app = express();
const port = process.env.PORT || 3000;

// Use body-parser middleware to parse JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Replace these values with your Cosmos DB connection details
const cosmosEndpoint = 'https://doodledatabase.documents.azure.com:443/';
const cosmosKey = '8nWPvD9Ry8DeUPk1JCfxvm6AZ4Q4fWH6Hcw5yITVC3YFn6AYXFF00xIXTwde9sOzNvJHT65YaAE5ACDbXt8cCg==';
const databaseId = 'TheoDoodleDatabase';
const containerId = 'Container1';

// Initialize Cosmos DB client
const cosmosClient = new CosmosClient({ endpoint: cosmosEndpoint, key: cosmosKey });

// Use a constant for the Cosmos DB container
const container = cosmosClient.database(databaseId).container(containerId);

app.post('/submit', async (req, res) => {
  const email = req.body.email;

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Create a new item in the container
    const newItem = {
      email, // Simplified for brevity; you can add other properties as needed
    };

    const { resource: createdItem } = await container.items.create(newItem);

    return res.json({ message: 'Sign-up successful!' });
  } catch (error) {
    console.error('Error creating item in Cosmos DB:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', async (req, res) => {
  try {
    // Retrieve and display existing data from Cosmos DB
    const { resources: items } = await container.items.readAll().fetchAll();

    // Include existing data in your HTML template
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <!-- your head content here -->
          <style>
            /* Add this style to hide messages initially */
            #messages, #errorMessages {
              display: none;
            }
          </style>
        </head>
        <body>
          <!-- your existing HTML content here -->

          <div>
            <!-- No flash messages needed -->
          </div>

          <div>
            ${items.map(item => `<div class="data-item">${item.email}</div>`).join('')}
          </div>

          <!-- your existing HTML content here -->

          <script>
            // your script content here
            function submitForm() {
              const email = document.getElementById('email').value;
              const messages = document.getElementById('messages');
              const errorMessages = document.getElementById('errorMessages');

              if (!email) {
                alert('Email is required');
                return;
              }

              fetch('/submit', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
              })
              .then(response => response.json())
              .then(data => {
                console.log(data);
                messages.innerText = data.message;
                messages.style.display = 'block';
                // Hide error messages when there's a success message
                errorMessages.style.display = 'none';
              })
              .catch(error => {
                console.error(error);
                errorMessages.innerText = 'Sign-up failed. Please try again.';
                errorMessages.style.display = 'block';
                // Hide success messages when there's an error message
                messages.style.display = 'none';
              });
            }
          </script>
        </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    console.error('Error reading items from Cosmos DB:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
