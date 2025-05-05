const allowedOrigins = [
  'https://www.stackzero.ai',
  'https://stackzero.vercel.app'
];

export default function handler(req, res) {
  const origin = req.headers.origin;

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

    console.log('New submission:', { name, email, subscriptions });

    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }

    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['POST', 'OPTIONS']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
