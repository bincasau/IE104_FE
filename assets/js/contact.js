const form = document.querySelector(".contact-form");
const messageBox = document.getElementById("formMessage");
let translations = {};

// === Hàm load ngôn ngữ hiện tại ===
async function loadTranslations(lang) {
  try {
    const res = await fetch(`../../lang/${lang}.json`);
    if (!res.ok) throw new Error("Không tìm thấy file ngôn ngữ");
    translations = await res.json();
  } catch (err) {
    console.error("Lỗi tải ngôn ngữ:", err);
  }
}

// === Lần đầu load trang ===
const currentLang = localStorage.getItem("lang") || "en";
loadTranslations(currentLang);

// === Khi đổi ngôn ngữ (lang.js phát event languageChanged) ===
window.addEventListener("languageChanged", (e) => {
  loadTranslations(e.detail); // e.detail chính là mã ngôn ngữ mới ("vi" hoặc "en")
});

// === Submit form ===
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const subject = form.subject.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !subject || !message) {
    messageBox.textContent =
      translations.contact_form_error || "Please fill in all required fields!";
    messageBox.className = "form-msg error";
    return;
  }

  messageBox.textContent =
    translations.contact_form_success ||
    "Your message has been sent successfully!";
  messageBox.className = "form-msg success";

  form.reset();
});
