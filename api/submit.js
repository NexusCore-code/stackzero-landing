import { google } from 'googleapis';
import path from 'path';
import fs from 'fs/promises';
import ejs from 'ejs';
import OpenAI from 'openai';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { sendStackZeroEmail } from '../lib/send-email.js'; // ✅ Email handler

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Form Data';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, email, subscriptions } = req.body;
  const reportType = 'free'; // or 'paid'

  try {
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !SHEET_ID) {
      throw new Error('Missing Google credentials');
    }

    // Save submission to Google Sheets
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

    // Generate content using GPT
    const subs = subscriptions.split(',').map(s => s.trim());
    const prompt = `Generate a short SaaS optimization summary for the following tools: ${subs.join(', ')}.`;

    const gpt = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });
    const recommendations = gpt.choices[0].message.content;

    // Render HTML report from EJS template
    const templatePath = path.join(process.cwd(), 'report_template.html');
    const template = await fs.readFile(templatePath, 'utf8');

    const html = ejs.render(template, {
      name,
      email,
      subscriptions: subs,
      reportType,
      recommendations,
      potentialSavings: '$792/year',
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
    });

    // Generate PDF
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // Send PDF in response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=stackzero_report.pdf');
    res.send(pdfBuffer);

    // Send email with attached report (non-blocking)
    sendStackZeroEmail({ name, email, reportType, pdfBuffer });

  } catch (error) {
    console.error('[SUBMIT ERROR]', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
