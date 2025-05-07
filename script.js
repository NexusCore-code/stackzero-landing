document.addEventListener("DOMContentLoaded", function () {
  console.log("StackZero script loaded");

  const form = document.getElementById("stackzero-form");

  if (!form) {
    console.error("Form not found");
    return;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      name: form.name.value,
      email: form.email.value,
      subscriptions: form.subscriptions.value
    };

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        // Мы полностью игнорируем ответ сервера и показываем свой текст
        document.getElementById("response").innerText =
          "Thank you! Your data was received successfully. You will get your AI-powered report by email shortly.";

        // Запускаем генерацию AI-отчёта (в фоне)
        await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        form.reset();
      } else {
        document.getElementById("response").innerText =
          "Something went wrong. Please try again.";
      }
    } catch (error) {
      console.error("Submission failed:", error);
      document.getElementById("response").innerText =
        "An unexpected error occurred. Please try again later.";
    }
  });
});
