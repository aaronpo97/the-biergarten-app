import { SPARKPOST_API_KEY, SPARKPOST_SENDER_ADDRESS } from '../env';

interface EmailParams {
  address: string;
  text: string;
  html: string;
  subject: string;
}

const sendEmail = async ({ address, text, html, subject }: EmailParams) => {
  const from = SPARKPOST_SENDER_ADDRESS;

  const data = {
    recipients: [{ address }],
    content: { from, subject, text, html },
  };

  const transmissionsEndpoint = 'https://api.sparkpost.com/api/v1/transmissions';

  const response = await fetch(transmissionsEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: SPARKPOST_API_KEY,
    },
    body: JSON.stringify(data),
  });

  if (response.status !== 200) {
    throw new Error(`Sparkpost API returned status code ${response.status}`);
  }
};

export default sendEmail;
