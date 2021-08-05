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

  // Sign it

  // Send it

  // Return a 200 or an error (@TODO: And make the frontend handle an error...)

  return new Response('Hello worker!', {
    headers: { 'content-type': 'text/plain' },
  });
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
})
