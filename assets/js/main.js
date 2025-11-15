import { loadSection, setFavicon } from "./utils.js";

// Đặt logo trên tab (favicon)
setFavicon("./assets/images/logo_ie104.png");

// Load các phần chính
await loadSection("header", "./components/header.html");
await loadSection("footer", "./components/footer.html");
await loadSection("content", "./pages/home.html", "./home.js", "Home");

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