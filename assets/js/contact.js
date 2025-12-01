const form = document.querySelector(".contact-form");
const messageBox = document.getElementById("formMessage");
let translations = {}; // Object chứa các chuỗi dịch thuật

/* =============================================
   CHỨC NĂNG DỊCH THUẬT VÀ TẢI NGÔN NGỮ
============================================== */

/**
 * Tải file dịch thuật (JSON) tương ứng với mã ngôn ngữ.
 * @param {string} lang - Mã ngôn ngữ ("en", "vi", v.v.).
 */
async function loadTranslations(lang) {
  try {
    const res = await fetch(`././lang/${lang}.json`);
    if (!res.ok) throw new Error(`Không tìm thấy file ngôn ngữ: ${lang}.json`);
    translations = await res.json();
  } catch (err) {
    console.error("Lỗi tải ngôn ngữ:", err);
    // Nếu lỗi, translations sẽ giữ nguyên hoặc là {}
  }
}

// Tải ngôn ngữ khi trang vừa load
const currentLang = localStorage.getItem("lang") || "en";
loadTranslations(currentLang);

// Lắng nghe sự kiện khi ngôn ngữ được thay đổi bởi lang.js
window.addEventListener("languageChanged", (e) => {
  loadTranslations(e.detail); // e.detail là mã ngôn ngữ mới
});

/* =============================================
   XỬ LÝ FORM SUBMIT
============================================== */

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const subject = form.subject.value.trim();
  const message = form.message.value.trim();

  // Kiểm tra tính hợp lệ cơ bản
  if (!name || !email || !subject || !message) {
    messageBox.textContent =
      translations.contact_form_error || "Please fill in all required fields!";
    messageBox.className = "form-msg error";
    return;
  }

  // Giả lập gửi thành công (Logic xử lý thực tế sẽ được thêm vào đây)
  messageBox.textContent =
    translations.contact_form_success ||
    "Your message has been sent successfully!";
  messageBox.className = "form-msg success";

  form.reset();
});
