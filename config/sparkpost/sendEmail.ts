import client from './client';

interface EmailParams {
  address: string;
  text: string;
  html: string;
  subject: string;
}

const { SPARKPOST_SENDER_ADDRESS } = process.env;

if (!SPARKPOST_SENDER_ADDRESS) {
  throw new Error('SPARKPOST_SENDER_ADDRESS env variable is not set.');
}

const sendEmail = async ({ address, text, html, subject }: EmailParams) => {
  const from = SPARKPOST_SENDER_ADDRESS;

  await client.transmissions.send({
    content: { from, html, subject, text },
    recipients: [{ address }],
  });
};

export default sendEmail;
