# StackZero AI Report Generator

This module allows automatic generation of personalized subscription optimization reports using OpenAI and Puppeteer.

---

## 📁 Files

- `report_template.html` — HTML template used to render the report
- `generate_report.js` — Script that:
  - Accepts user input (name, email, subscriptions)
  - Calls OpenAI API for analysis
  - Injects data into template
  - Converts final HTML to PDF
- `.gitkeep` — Placeholder to keep the folder versioned

---

## ⚙️ Requirements

- Node.js 18+
- NPM packages:
  - `puppeteer`
  - `openai`
  - `dotenv` (optional)

Install dependencies:

```bash
npm install puppeteer openai dotenv
```

---

## 🔐 Environment Variable

Create a `.env` file in the root of the project and add your OpenAI key:

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ▶️ How to Run

From the root of your project or inside `/report/`:

```bash
node report/generate_report.js
```

This will generate `StackZero_Report.pdf` in the same folder.

---

## 📌 To Integrate in Production

- Move the logic to an endpoint like `/api/generate`
- Call it after form submission or payment
- Send PDF via email or return download link

---

Made with precision for StackZero.