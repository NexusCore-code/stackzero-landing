document.getElementById("stackForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.querySelector('input[name="name"]').value;
  const email = document.querySelector('input[name="email"]').value;
  const subscriptions = document.querySelector('textarea[name="subscriptions"]').value;

  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, subscriptions }),
    });

    if (res.ok) {
      document.getElementById("responseMessage").textContent = "Спасибо! Мы свяжемся с вами.";
    } else {
      document.getElementById("responseMessage").textContent = "Ошибка при отправке. Попробуйте снова.";
    }
  } catch (err) {
    document.getElementById("responseMessage").textContent = "Сетевая ошибка.";
    console.error(err);
  }
});
