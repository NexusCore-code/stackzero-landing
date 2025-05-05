export default function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { name, email, subscriptions } = req.body;

    console.log({ name, email, subscriptions });

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['POST', 'OPTIONS']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
