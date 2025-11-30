import { loadSection, setFavicon } from "./utils.js";

// Đặt logo trên tab (favicon)
setFavicon("./assets/images/logo_ie104.webp");

// Load các phần chính
await loadSection("header", "./components/header.html");
await loadSection("footer", "./components/footer.html");
await loadSection("main", "./pages/home.html", "./home.js", "Home");

// Sau khi header load xong thì khởi tạo JS cho header
const { initHeader } = await import("./header.js");
initHeader();

// Sau khi footer load xong, khởi tạo JS cho footer
try {
  const { initFooter } = await import("./footer.js");
  initFooter();
} catch (e) {
  console.error("Failed to init footer scripts:", e);
}

// ============================
// GLOBAL LOGIN POPUP CONTROLLER
// ============================

// 👉 Gọi lại đúng logic mở modal trong header.js
window.openLoginPopup = function () {
  const loginBtn = document.getElementById("headerLoginBtn");
  if (!loginBtn) {
    console.warn("❌ headerLoginBtn NOT FOUND – header chưa load xong?");
    return;
  }
  loginBtn.click(); // dùng chính handler của header
};

// Tuỳ, nếu muốn đóng popup từ nơi khác
window.closeLoginPopup = function () {
  // nếu header.js có sẵn hàm đóng modal thì có thể gọi ở đây
  const modal = document.getElementById("auth-modal");
  if (!modal) return;
  modal.setAttribute("aria-hidden", "true");
  modal.classList.remove("show");
};

// Nếu bạn KHÔNG chắc header.js có lắng nghe message này,
// có thể giữ lại; nếu thấy reload 2 lần thì xoá block dưới.
window.addEventListener("message", (event) => {
  if (event.data?.type === "auth-login-success") {
    // Sau khi login thành công, có thể đóng modal ở đây nếu cần
    window.closeLoginPopup();
    location.reload(); // Cập nhật header
  }
});
