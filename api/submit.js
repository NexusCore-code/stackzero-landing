const fs = require('fs');
const path = require('path');
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const OpenAI = require('openai'); // заменено!

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // заменено!

function generateSubscriptionsTable(subsText) {
  const lines = subsText.split(',').map(s => s.trim());
  return lines.map(item => {
    const [service, price] = item.split(' ($');
    return `<tr><td>${service}</td><td>$${price?.replace('/mo)', '')}</td><td>Monthly</td><td></td></tr>`;
  }).join('\n');
}

function generateHtmlReport({ name, email, subscriptions }, aiText) {
  const templatePath = path.join(process.cwd(), 'report_template.html');
  const template = fs.readFileSync(templatePath, 'utf8');

  return template
    .replace('{{user_name}}', name)
    .replace('{{report_date}}', new Date().toLocaleDateString())
    .replace('{{subscription_count}}', subscriptions.split(',').length)
    .replace('{{subscriptions_table}}', generateSubscriptionsTable(subscriptions))
    .replace('{{ai_analysis}}', aiText)
    .replace('{{recommendations_list}}', aiText.split('\n').slice(-4).map(l => `<li>${l}</li>`).join('\n'));
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

Keep it under 300 words. Clear and professional tone.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
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
