const request = require("request");
const ImageAnalyser = require('../util/imageAnalyser');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

/**
 * 
 * Handler Message
 * 
 */
async function handleMessage(sender_psid, received_message) {
  let response;

  // Checks if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    response = {
      "text": `You sent the message: "${received_message.text}". Now send me an attachment!`
    }
  } else if (received_message.attachments) {
    // Get the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;

    console.log("payload url");
    console.log(JSON.stringify(received_message.attachments[0].payload));
    console.log("attachment_url: " + attachment_url);
    let imageLabels = await ImageAnalyser.getImageLabels(attachment_url);
    let labels = ImageAnalyser.getImageLabelArray(imageLabels);

    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "What best describes your image?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [{
                "type": "postback",
                "title": labels[0],
                "payload": labels[0],
              },
              {
                "type": "postback",
                "title": labels[1],
                "payload": labels[1],
              }
            ],
          }]
        }
      }
    }
  }

  // Send the response message
  callSendAPI(sender_psid, response);
}

/**
 * 
 * Handler Postback
 * 
 */
async function handlePostback(sender_psid, received_postback) {
  console.log('ok')
  let response;
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = {
      "text": "Thanks!"
    }
  } else if (payload === 'no') {
    response = {
      "text": "Oops, try sending another image."
    }
  } else {
    response = {
      "text": "Cool! I love " + payload + "'s"
    }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

/**
 * 
 * Messenger Send API
 * 
 */
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": {
      "access_token": PAGE_ACCESS_TOKEN
    },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

module.exports = {
  handleMessage: handleMessage,
  handlePostback: handlePostback
}