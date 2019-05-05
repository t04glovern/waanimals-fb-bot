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