if (req.method === 'POST') {
  const { name, email, subscriptions } = req.body;

  try {
    console.log("Received POST:", { name, email, subscriptions });

    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
      throw new Error("Missing Google API credentials");
    }

    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      SCOPES
    );

    const sheets = google.sheets({ version: 'v4', auth });
    const timestamp = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${SHEET_NAME}!A:D`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[timestamp, name, email, subscriptions]],
      },
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Google Sheets Error:", error.message || error);
    return res.status(500).json({ success: false, error: error.message || "Internal error" });
  }
}
