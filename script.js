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

    try {
      responseEl.innerText = "Generating your report...";

      const query = await fetch("https://stackzero-report.onrender.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!query.ok) {
        responseEl.innerText = "Something went wrong. Please try again.";
        return;
      }

      const blob = await query.blob();
      const pdfUrl = URL.createObjectURL(blob);

      window.open(pdfUrl, "_blank");

      responseEl.innerText = "Your report is ready.";
      form.reset();
    } catch (error) {
      console.error("Submission failed", error);
      responseEl.innerText = "Unexpected error. Please try again later.";
    }
  });
});
