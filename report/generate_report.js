const fs = require('fs');
const puppeteer = require('puppeteer');
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

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

  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.data.choices[0].message.content;
}

function generateSubscriptionsTable(subsText) {
  const lines = subsText.split(',').map(s => s.trim());
  return lines.map(item => {
    const [service, price] = item.split(' ($');
    return `<tr><td>${service}</td><td>$${price?.replace('/mo)', '')}</td><td>Monthly</td><td></td></tr>`;
  }).join('\n');
}

function generateHtmlReport({ name, email, subscriptions }, aiText) {
  const template = fs.readFileSync('./report_template.txt', 'utf8');

  const filled = template
    .replace('{{user_name}}', name)
    .replace('{{report_date}}', new Date().toLocaleDateString())
    .replace('{{subscription_count}}', subscriptions.split(',').length)
    .replace('{{subscriptions_table}}', generateSubscriptionsTable(subscriptions))
    .replace('{{ai_analysis}}', aiText)
    .replace('{{recommendations_list}}', aiText.split('\n').slice(-4).map(l => `<li>${l}</li>`).join('\n'));

  return filled;
}

async function generatePdf(htmlContent, outputPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  await page.pdf({ path: outputPath, format: 'A4' });
  await browser.close();
}

(async () => {
  const userInput = {
    name: "Vladimir Makarov",
    email: "vladimir@example.com",
    subscriptions: "Notion ($10/mo), Zoom ($15/mo), Slack ($30/mo), Figma ($12/mo)"
  };

  const aiText = await getAiAnalysis(userInput.subscriptions);
  const html = generateHtmlReport(userInput, aiText);
  await generatePdf(html, './StackZero_Report.pdf');

  console.log('AI Report generated: StackZero_Report.pdf');
})();