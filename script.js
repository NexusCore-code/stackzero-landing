
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
      // 1. Submit form data to /api/submit
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        responseEl.innerText = "Something went wrong. Please try again.";
        return;
      }

      responseEl.innerText = "Thank you! Your submission has been received.";

      // 2. Show modal and generate report
      const modal = document.getElementById("report-modal");
      const progressBar = document.getElementById("progress-bar");
      const preview = document.getElementById("report-preview");
      const pdfFrame = document.getElementById("pdf-frame");
      const downloadLink = document.getElementById("download-link");

      modal.style.display = "flex";
      preview.style.display = "none";
      progressBar.style.width = "0%";

      let progress = 0;
      const interval = setInterval(() => {
        if (progress < 95) {
          progress += Math.random() * 5;
          progressBar.style.width = `${Math.min(progress, 95)}%`;
        }
      }, 300);

      // 3. Simulate report generation and show pre-made PDF
      await new Promise(resolve => setTimeout(resolve, 1200)); // simulate wait

      clearInterval(interval);
      progressBar.style.width = "100%";

      setTimeout(() => {
        preview.style.display = "block";
        const pdfUrl = "/report/stackzero_free_report.pdf";
        pdfFrame.src = pdfUrl;
        downloadLink.href = pdfUrl;
      }, 800);

      form.reset();
    } catch (error) {
      console.error("Submission failed", error);
      responseEl.innerText = "An unexpected error occurred. Please try again later.";
    }
  });
});
