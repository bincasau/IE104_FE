const form = document.querySelector(".contact-form");
const messageBox = document.getElementById("formMessage");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const subject = form.subject.value.trim();
  const message = form.message.value.trim();

  // Kiểm tra validation
  if (!name || !email || !subject || !message) {
    messageBox.textContent = "Please fill in all required fields!";
    messageBox.className = "form-msg error";
    return;
  }

  // Báo thành công (giả lập)
  messageBox.textContent = "Your message has been sent successfully!";
  messageBox.className = "form-msg success";

  form.reset();
});
