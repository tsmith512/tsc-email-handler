import { AwsClient } from 'aws4fetch';

const aws = new AwsClient({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY
});

const SES_ENDPOINT = 'https://email.us-east-2.amazonaws.com/v2/email/outbound-emails';

const corsHeaders = new Headers({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
});

async function handleRequest(request) {
  // See tsmith512/tsmithcreative:_js/contact.js
  const { from = "", replyto = FROM_ADDRESS, message = "" } = await request.json();

  // @TODO: [Insert some validations here one day...]

  const messagePayload = {
    "Destination": {
      "ToAddresses": [ FROM_ADDRESS ],
    },
    "FromEmailAddress": FROM_ADDRESS,
    "Source": FROM_ADDRESS,
    "ReplyToAddresses": [ replyto ],

    "Content": {
      "Simple": {
        "Subject": {
          "Charset": "UTF-8",
          "Data": `Website Referral Form from ${from}`,
        },
        "Body": {
          "Text": {
            "Charset": "UTF-8",
            "Data": message,
          },
        },
      },
    },
  };

  // Build signed request with aws4fetch
  const signedRequest = await aws.sign(SES_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(messagePayload),
  });

  // Send the SES request
  const sesResponse = await fetch(signedRequest);

  // Return a simplified response to frontend
  const { ok, status } = await sesResponse;

  if (ok) {
    return new Response(`SES responded okay ${status}`, {
      status: 200,
      headers: corsHeaders,
    });
  }
  else {
    return new Response(`SES responded with error ${status}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
}

async function handleOptions(request) {
  return new Response(null, {status: 200, headers: corsHeaders});
}

async function handleBadReq(request) {
  return new Response('Bad Request', {status: 400, headers: corsHeaders});
}

addEventListener('fetch', event => {
  switch (event.request.method) {
    case 'POST':
      event.respondWith(handleRequest(event.request));
      break;
    case 'OPTIONS':
      event.respondWith(handleOptions(event.request));
      break;
    default:
      event.respondWith(handleBadReq(event.request));
      break;
  }
})
