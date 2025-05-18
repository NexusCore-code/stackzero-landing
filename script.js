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
    const modal = document.getElementById("report-modal");
    const progressBar = document.getElementById("progress-bar");
    const preview = document.getElementById("report-preview");
    const pdfFrame = document.getElementById("pdf-frame");
    const downloadLink = document.getElementById("download-link");

    try {
      // 1. Показ модалки и анимация загрузки
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

      // 2. Отправка запроса на /api/submit
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        clearInterval(interval);
        modal.style.display = "none";
        responseEl.innerText = "Something went wrong. Please try again.";
        return;
      }

      // 3. Обработка PDF-ответа
      const blob = await res.blob();
      const pdfUrl = URL.createObjectURL(blob);

      clearInterval(interval);
      progressBar.style.width = "100%";

      setTimeout(() => {
        preview.style.display = "block";
        pdfFrame.src = pdfUrl;
        downloadLink.href = pdfUrl;
      }, 800);

      responseEl.innerText = "Thank you! Your report is ready.";
      form.reset();
    } catch (error) {
      console.error("Submission failed", error);
      modal.style.display = "none";
      responseEl.innerText = "An unexpected error occurred. Please try again later.";
    }
  });
});
