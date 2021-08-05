import { AwsClient } from 'aws4fetch';

const aws = new AwsClient({ accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY });
const SES_ENDPOINT = 'https://email.us-east-1.amazonaws.com/';

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  // See tsmith512/tsmithcreative:_js/contact.js
  const messagePayload = await request.json();

  // Reformulate the payload for SES
  const messageRaw =
    `From: ${FROM_ADDRESS}
    To: ${FROM_ADDRESS}
    Reply-To: ${messagePayload.replyto}
    Subject: Website Referral Form from ${messagePayload.from}

    ${messagePayload.message}
  `.replace(/\n[ ]+/g, '\n');

  const sesPayload = `Action=SendRawEmail&Destinations.member.1=${encodeURIComponent(FROM_ADDRESS)}&RawMessage.Data=${encodeURIComponent(btoa(messageRaw))}`

  // Sign it
  const signedRequest = await aws.sign(SES_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: sesPayload,
  });

  console.log(JSON.stringify(signedRequest));

  // Send it
  const sesResponse = await fetch(signedRequest);

  const responseInfo = await sesResponse.text()
  console.log(responseInfo);

  // Return a 200 or an error (@TODO: And make the frontend handle an error...)

  return new Response(responseInfo, {
    headers: { 'content-type': 'text/plain' },
  });
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
})
