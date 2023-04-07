import { SPARKPOST_SENDER_ADDRESS } from '../env';
import client from './client';

interface EmailParams {
  address: string;
  text: string;
  html: string;
  subject: string;
}

const sendEmail = async ({ address, text, html, subject }: EmailParams) => {
  const from = SPARKPOST_SENDER_ADDRESS;

  await client.transmissions.send({
    content: { from, html, subject, text },
    recipients: [{ address }],
  });
};

export default sendEmail;
