// FINAL FIXED VERSION FOR VERCEL (No fs, HTML inline)

const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function generateSubscriptionsTable(subsText) {
  const lines = subsText.split(',').map(s => s.trim());
  return lines.map(item => {
    const [service, price] = item.split(' ($');
    return `<tr><td>${service}</td><td>$${price?.replace('/mo)', '')}</td><td>Monthly</td><td></td></tr>`;
  }).join('\n');
}

function generateHtmlReport({ name, email, subscriptions }, aiText) {
  const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>StackZero Report</title>
    <style>
      body { font-family: 'Arial', sans-serif; margin: 40px; }
      h1 { text-align: center; color: #007AFF; font-size: 22px; margin-bottom: 10px; }
      h2 { margin-top: 30px; font-size: 16px; }
      p, li { font-size: 13px; line-height: 1.5; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: left; vertical-align: top; }
      th { background: #f0f4ff; font-weight: 600; }
      .footer { text-align: center; margin-top: 40px; font-size: 13px; color: #007AFF; }
    </style>
  </head>
  <body>
    <h1>StackZero</h1>
    <p style="text-align: center; font-size: 14px;">Custom SaaS Report for <strong>${name}</strong></p>
    <p><strong>Email:</strong> ${email}</p>
    <h2>1. Your Subscriptions</h2>
    <table>
      <tr><th>Service</th><th>Price</th><th>Period</th><th>Note</th></tr>
      ${generateSubscriptionsTable(subscriptions)}
    </table>
    <h2>2. AI Analysis</h2>
    <p>${aiText.replace(/\n/g, '<br>')}</p>
    <h2>3. Recommendations</h2>
    <ul>
      ${aiText.split('\n').slice(-4).map(l => `<li>${l}</li>`).join('\n')}
    </ul>
    <div class="footer">
      Thank you for using StackZero<br />
      <a href="https://stackzero.ai/feedback">Leave feedback or suggestion →</a>
    </div>
  </body>
  </html>
  `;

  return htmlTemplate;
}

async function getAiAnalysis(subsText) {
  const prompt = `
You are an expert in SaaS cost optimization.

Analyze the following list of software subscriptions and provide:
1. A short overview of spending behavior
2. Specific savings opportunities
3. Downsizing or switching options
4. Optimization tips

Subscriptions:
${subsText}

Keep it under 300 words. Clear and professional tone.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { name, email, subscriptions } = req.body;

    const aiText = await getAiAnalysis(subscriptions);
    const html = generateHtmlReport({ name, email, subscriptions }, aiText);

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=report.pdf');
    res.send(pdfBuffer);
  } catch (err) {
    console.error('[SUBMIT ERROR]', err);
    res.status(500).send('Internal Server Error');
  }
};
