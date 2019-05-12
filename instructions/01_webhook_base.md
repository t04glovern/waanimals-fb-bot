# Setup Basic Webhook

Based heavily on [Setting Up Your Webhook](https://developers.facebook.com/docs/messenger-platform/getting-started/webhook-setup)

## Create NodeJS project

```bash
mkdir messenger-bot   ## Creates a project directory
cd messenger-bot      ## Navigates to the new directory
touch app.js          ## Creates empty app.js file
npm init              ## Creates package.json. Accept default for all questions.

## Install Dependencies
npm install express body-parser dotenv aws-sdk image-to-base64 request --save
```

Update the package.json file to have the following contents in the script block

```json
...
  "scripts": {
    "start": "node app.js"
  },
...
```

## Create HTTP server

Within the `messenger-bot/app.js` file add the following code to get the basic up and running

```javascript
'use strict';

require('dotenv').config();

const apiController = require('./controllers/apiController');

/**
 * Express Sections
 * Imports dependencies and set up http server
 */
const
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()); // creates express http server

// Webhook BOT routes
app.get('/webhook', apiController.handleVerifyServer);
app.post('/webhook', apiController.handleWebhookEvent);
app.get('/healthy', apiController.handleHealthEndpoint);

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

module.exports = app;
```

### ENV file

Create a file within `messenger-bot/` called `.env` and add the following.

```bash
VERIFY_TOKEN='<YOUR_VERIFY_TOKEN>' # Random String
PAGE_ACCESS_TOKEN='<YOUR_PAGE_ACCESS_TOKEN>'
AWS_REGION='us-east-1'
```

Note your random string should be different obviously.

### Create POST endpoint

```javascript
// Creates the endpoint for our webhook
app.post('/webhook', (req, res) => {  

  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});
```

### Create GET verification

The verification process looks like this:

* You create a verify token. This is a random string of your choosing, hardcoded into your webhook.
* You provide your verify token to the Messenger Platform when you subscribe your webhook to receive webhook events for an app.
* The Messenger Platform sends a GET request to your webhook with the token in the hub.verify parameter of the query string.
* You verify the token sent matches your verify token, and respond with hub.challenge parameter from the request.
* The Messenger Platform subscribes your webhook to the app.

```javascript
// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {
  // Parse the query params*
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});
```

## Test Basic Webhook

### Test Verification

```bash
npm run start
curl -X GET "localhost:1337/webhook?hub.verify_token=<YOUR_VERIFY_TOKEN>&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe"
```

### Test POST

```bash
curl -H "Content-Type: application/json" -X POST "localhost:1337/webhook" -d '{"object": "page", "entry": [{"messaging": [{"message": "TEST_MESSAGE"}]}]}'
```