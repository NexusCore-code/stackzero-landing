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
      // 1. Отправка данных на /api/submit
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

      // 2. Показываем модалку и генерируем отчёт
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

      const reportRes = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!reportRes.ok) {
        clearInterval(interval);
        modal.innerHTML = "<p style='color:red;'>Failed to generate report. Please try again later.</p>";
        return;
      }

      const reportData = await reportRes.json();

 // Генерация PDF в браузере из AI-отчёта
const pdfText = reportData.report;

const pdfContent = document.getElementById("pdf-content");
const pdfTextDiv = document.getElementById("pdf-text");
pdfTextDiv.textContent = pdfText;
pdfContent.style.display = "block";

const opt = {
  margin: 0.5,
  filename: "stackzero-report.pdf",
  image: { type: "jpeg", quality: 0.98 },
  html2canvas: { scale: 2 },
  jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
};

html2pdf().set(opt).from(pdfContent).outputPdf("blob").then((pdfBlob) => {
  const pdfUrl = URL.createObjectURL(pdfBlob);

  clearInterval(interval);
  progressBar.style.width = "100%";

  setTimeout(() => {
    preview.style.display = "block";
    pdfFrame.src = pdfUrl;
    downloadLink.href = pdfUrl;
    pdfContent.style.display = "none";
  }, 800);
});

      clearInterval(interval);
      progressBar.style.width = "100%";

      setTimeout(() => {
        preview.style.display = "block";
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
