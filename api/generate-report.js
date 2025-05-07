
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { name, email, subscriptions } = req.body;

  if (!name || !email || !subscriptions) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const prompt = `
You are an expert in SaaS cost optimization.

Analyze the following list of software subscriptions and provide:
1. A short overview of spending behavior
2. Specific savings opportunities
3. Downsizing or switching options
4. Optimization tips

Subscriptions:
${subscriptions}

Keep it under 300 words. Clear and professional tone.
    `;

    const chatResponse = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const aiText = chatResponse.data.choices[0].message.content;

    const templatePath = path.resolve('./report_template.html');
    const template = fs.readFileSync(templatePath, 'utf8');

    const subsTable = subscriptions.split(',').map((s) => {
      const [service, price] = s.trim().split(' ($');
      return `<tr><td>${service}</td><td>$${price?.replace('/mo)', '')}</td><td>Monthly</td><td></td></tr>`;
    }).join('\n');

    const recList = aiText.split('\n').slice(-4).map(line => `<li>${line}</li>`).join('\n');

    const htmlContent = template
      .replace('{{user_name}}', name)
      .replace('{{report_date}}', new Date().toLocaleDateString())
      .replace('{{subscription_count}}', subscriptions.split(',').length)
      .replace('{{subscriptions_table}}', subsTable)
      .replace('{{ai_analysis}}', aiText)
      .replace('{{recommendations_list}}', recList);

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=StackZero_Report.pdf');
    res.send(pdfBuffer);

  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
}
