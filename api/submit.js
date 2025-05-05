export default function handler(req, res) {
  // Обработка preflight (CORS)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.stackzero.ai');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Обработка POST-запроса с формы
  if (req.method === 'POST') {
    const { name, email, subscriptions } = req.body;

    console.log({ name, email, subscriptions });

    res.setHeader('Access-Control-Allow-Origin', 'https://www.stackzero.ai');
    return res.status(200).json({ success: true });
  }

  // Обработка неподдерживаемых методов
  res.setHeader('Allow', ['POST', 'OPTIONS']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
