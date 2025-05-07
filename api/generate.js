const path = require('path');
const { generatePdfReport } = require('../report/generate_report');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { name, email, subscriptions } = req.body;

  if (!name || !email || !subscriptions) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const filename = await generatePdfReport({ name, email, subscriptions });
    const fileUrl = `/api/files/${filename}`; // Can be updated based on file-serving logic

    res.status(200).json({ message: 'Report generated', file: fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};