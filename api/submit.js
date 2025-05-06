// /api/submit.js (размещается на Vercel)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { name, email, subscriptions } = req.body;

    // Отправка в Google Apps Script Webhook
    const webhookUrl = "https://script.google.com/macros/s/AKfycbwFsiF4cDmRsdDO91bHrLg2Xp30waLPyX28WhlJUZxsShnjPB7-B-BLV9BlD5h1nxxlcw/exec";

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, subscriptions })
    });

    if (!response.ok) {
      throw new Error("Failed to send to Google Sheet");
    }

    return res.status(200).json({ message: "Success" });

  } catch (error) {
    console.error("Submit error:", error);
    return res.status(500).json({ error: "Server Error" });
  }
}
