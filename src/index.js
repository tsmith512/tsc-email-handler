import { AwsClient } from 'aws4fetch';

const aws = new AwsClient({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY
});

const SES_ENDPOINT = 'https://email.us-east-1.amazonaws.com/v2/email/outbound-emails';

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
      headers: { 'content-type': 'text/plain' },
    });
  }
  else {
    return new Response(`SES responded with error ${status}`, {
      status: 500,
    });
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
})
