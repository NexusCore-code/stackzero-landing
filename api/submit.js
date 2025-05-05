document.querySelector("form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.querySelector('input[name="name"]').value;
  const email = document.querySelector('input[name="email"]').value;
  const subscriptions = document.querySelector('textarea[name="subscriptions"]').value;

  try {
    const res = await fetch("https://stackzero.vercel.app/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, subscriptions }),
    });

    if (res.ok) {
      alert("Form submitted successfully!");
    } else {
      alert("Error submitting form.");
    }
  } catch (err) {
    alert("Network error.");
    console.error(err);
  }
});
