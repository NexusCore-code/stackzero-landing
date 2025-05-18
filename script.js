document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("stackzero-form");

  if (!form) {
    console.error("Form not found");
    return;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subscriptions: form.subscriptions.value.trim()
    };

    const responseEl = document.getElementById("response");
    responseEl.innerText = "Generating your report...";

    try {
      // 1. Отправка на PDF API (Render)
      const pdfResponse = await fetch("https://stackzero-report.onrender.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!pdfResponse.ok) {
        responseEl.innerText = "PDF generation failed. Try again.";
        return;
      }

      const blob = await pdfResponse.blob();
      const pdfUrl = URL.createObjectURL(blob);

      // 2. Отправка на Google Таблицу (Apps Script)
      await fetch("https://script.google.com/macros/s/AKfycbzttzxQBEpoaYc5ad6PuNxdC_asSFbwx5dZAoq6FA-cLLXkDGkZdJqbM7zggIWpwDi5pg/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, subscriptions: data.subscriptions })
      });

      window.open(pdfUrl, "_blank");
      responseEl.innerText = "Your report is ready.";
      form.reset();

    } catch (error) {
      console.error("Submission failed", error);
      responseEl.innerText = "Unexpected error. Please try again later.";
    }
  });
});
