import { OpenAI } from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return res.status(200).json({
      report: "Example report: You can cancel subscriptions like Zoom and Dropbox — they haven't been used for over 2 months.",
      warning: "OPENAI_API_KEY is not set. Returning a test version of the report."
    });
  }

  try {
    const openai = new OpenAI({ apiKey: openaiKey });

    // FIX: извлекаем subscriptions корректно
    let { subscriptions } = req.body;

    // Поддержка строки и массива
    const subscriptionArray = Array.isArray(subscriptions)
      ? subscriptions
      : String(subscriptions).split(",").map(s => s.trim());

    const prompt = `Analyze the following subscriptions and suggest which ones can be canceled or replaced to optimize costs: ${subscriptionArray.join(", ")}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const report = completion.choices[0]?.message?.content || "Failed to generate report.";

    res.status(200).json({ report });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "Failed to generate report." });
  }
}
