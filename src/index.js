import { AwsClient } from 'aws4fetch';

const aws = new AwsClient({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY
});

const SES_ENDPOINT = 'https://email.us-east-1.amazonaws.com/';

async function handleRequest(request) {
  // See tsmith512/tsmithcreative:_js/contact.js
  const { from = "", replyto = FROM_ADDRESS, message = "" } = await request.json();

  // @TODO: [Insert some validations here one day...]

  // Build the email "object" (str) for SES.
  const messageRaw =
    `From: ${FROM_ADDRESS}
    To: ${FROM_ADDRESS}
    Reply-To: ${replyto}
    Subject: Website Referral Form from ${from}

    ${message}
  `.replace(/\n[ ]+/g, '\n');

  const sesPayload = `Action=SendRawEmail&Destinations.member.1=${encodeURIComponent(FROM_ADDRESS)}&RawMessage.Data=${encodeURIComponent(btoa(messageRaw))}`

  // Build signed request with aws4fetch
  const signedRequest = await aws.sign(SES_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: sesPayload,
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
