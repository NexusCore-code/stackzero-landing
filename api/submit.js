import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Form Data'; // обновлено!

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = ['https://www.stackzero.ai', 'https://stackzero.vercel.app'];
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { name, email, subscriptions } = req.body;

    try {
      const auth = new google.auth.JWT(
        process.env.GOOGLE_CLIENT_EMAIL,
        null,
        process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        SCOPES
      );

      const sheets = google.sheets({ version: 'v4', auth });
      const timestamp = new Date().toISOString();

      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A:D`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[timestamp, name, email, subscriptions]],
        },
      });

      return res.status(200).json({ success: true });

    } catch (error) {
      console.error('Google Sheets Error:', error.message || error);
      return res.status(500).json({ success: false, error: 'Sheet write failed' });
    }
  }

  res.setHeader('Allow', ['POST', 'OPTIONS']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
