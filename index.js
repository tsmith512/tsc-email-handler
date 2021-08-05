import { AwsClient } from 'aws4fetch';

const aws = new AwsClient({ accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY });
const SES_ENDPOINT = 'https://email.us-west-2.amazonaws.com/';

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  // See tsmith512/tsmithcreative:_js/contact.js
  const messagePayload = await readRequestBody(request);

  // Reformulate the payload for SES
  const messageRaw =
    `From: ${FROM_ADDRESS}
    Reply-To: ${messagePayload.replyto}
    Subject: Website Referral Form from ${messagePayload.from}

    ${messagePayload.message}
  `.replace(/\n[ ]+/g, '\n');

  const sesPayload = `Action=SendRawEmail&Destinations.member.1=${encodeURIComponent(FROM_ADDRESS)}&RawMessage.Data=${btoa(messageRaw)}`

  // Sign it
  const signedRequest = awair aws.sign(SES_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: sesPayload,
  });

  console.log(signedRequest);

  // Send it
  const sesResponse = await fetch(signedRequest);

  const responseInfo = await sesResponse.json()
  console.log(responseInfo);

  // Return a 200 or an error (@TODO: And make the frontend handle an error...)

  return new Response(JSON.stringify(responseInfo), {
    headers: { 'content-type': 'text/plain' },
  });
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
})
