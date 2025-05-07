import { OpenAI } from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    // Development fallback when OpenAI key is missing
    return res.status(200).json({
      report: "Example report: You can cancel subscriptions like Zoom and Dropbox — they haven't been used for over 2 months.",
      warning: "OPENAI_API_KEY is not set. Returning a test version of the report."
    });
  }

  try {
    const openai = new OpenAI({ apiKey: openaiKey });

    const { subscriptions } = req.body;

    const prompt = `Analyze these subscriptions and suggest which ones could be canceled or replaced: ${subscriptions.join(', ')}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const report = completion.choices[0]?.message?.content || "Report generation failed.";

    res.status(200).json({ report });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "Failed to generate report." });
  }
}
