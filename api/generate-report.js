import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import ejs from 'ejs';
import path from 'path';
import fs from 'fs/promises';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { name, email, subscriptions, reportType } = req.body;

  // Safety fallback
  const userName = name || 'User';
  const userEmail = email || '';
  const subList = subscriptions
    ? subscriptions.split(',').map((s) => s.trim())
    : ['Figma'];

  try {
    // 1. Generate recommendation text from GPT
    const prompt = `You are an AI that analyzes SaaS subscriptions. Generate a 2–3 sentence summary for the user using the following subscriptions: ${subList.join(
      ', '
    )}. Mention possible savings or duplicate tools if any.`;

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    const recommendations = gptResponse.choices[0].message.content;

    // 2. Load report template
    const templatePath = path.join(process.cwd(), 'report_template.html');
    const templateHtml = await fs.readFile(templatePath, 'utf8');

    // 3. Insert data into template
    const html = ejs.render(templateHtml, {
      name: userName,
      email: userEmail,
      subscriptions: subList,
      reportType,
      recommendations,
      alternatives: [
        {
          tool: 'Sketch',
          plan: 'Personal',
          price: '$9.99/mo',
          goodFor: 'UX/UI design',
          limitations: 'No real-time collaboration',
        },
        {
          tool: 'Affinity Designer',
          plan: 'Individual',
          price: '$99/year',
          goodFor: 'Layouts',
          limitations: 'Mac only',
        },
        {
          tool: 'Lunacy',
          plan: 'Business',
          price: '$9/user/mo',
          goodFor: 'Teams',
          limitations: 'No web, Mac only',
        },
        {
          tool: 'Vectornator',
          plan: 'One-time',
          price: '$54.99',
          goodFor: 'Vector graphics',
          limitations: 'No collaboration',
        },
      ],
      comparison: [
        {
          figmaPlan: 'Professional',
          figmaPrice: '$36',
          altTool: 'Vectornator',
          altPrice: '$4.58/mo',
          savings: '$31.42/mo',
        },
        {
          figmaPlan: 'Professional',
          figmaPrice: '$36',
          altTool: 'Lunacy',
          altPrice: '$0',
          savings: '$36/mo',
        },
        {
          figmaPlan: 'Organization',
          figmaPrice: '$75',
          altTool: 'Affinity',
          altPrice: '$9/user',
          savings: '$66/mo',
        },
      ],
      potentialSavings: '$792/year',
    });

    // 4. Launch Puppeteer (with @sparticuz/chromium for Vercel)
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // 5. Send back the PDF to the user
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=stackzero_report.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).send('Error generating report');
  }
}
