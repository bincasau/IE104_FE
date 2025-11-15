

// 1. Import hàm loadSection
import { loadSection } from "./utils.js";

// 2. Helpers (Cần cho logo và links)
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

// 3. Định nghĩa các trang (Giống header.js)
const pageMap = {
  Home: { html: "./pages/home.html", js: "./home.js" },
  About: { html: "./pages/about.html", js: "./about.js" },
  Tours: { html: "./pages/tour.html", js: "./tour.js" },
  Blog: { html: "./pages/blog.html", js: "./blog.js" },
  Contact: { html: "./pages/contact.html", js: "./contact.js" },
};

// 4. Hàm dọn dẹp popstate
const cleanupTourPopstate = () => {
  if (window._tourPopHandler) {
    window.removeEventListener("popstate", window._tourPopHandler);
    delete window._tourPopHandler;
  }
};

/**
 * 5. Hàm Navigate (TÁCH RA để dùng chung)
 * Hàm này sẽ xử lý việc điều hướng SPA
 */
async function navigateToPage(pageName) {
  const selected = pageMap[pageName];
  if (!selected) return;

  // Dọn dẹp URL và history
  cleanupTourPopstate();
  if (location.hash) {
    history.replaceState(null, "", location.pathname);
  }

  // Load trang mới
  await loadSection("content", selected.html, selected.js, pageName);

  // Cập nhật lại class 'active' trên HEADER
  $$(".nav-links a").forEach(headerLink => {
    headerLink.classList.toggle("active", headerLink.classList.contains(pageName));
  });
}

// 6. Hàm khởi tạo footer
export function initFooter() {
  
  // --- A. XỬ LÝ CÁC LINK ĐIỀU HƯỚNG (như cũ) ---
  const footerLinks = $$("#footer .footer-links a");

  footerLinks.forEach(link => {
    const pageName = [...link.classList].find(c => pageMap[c]);
    if (!pageName) return; // Bỏ qua link PDF (Terms, Privacy)

    link.addEventListener("click", async (e) => {
      e.preventDefault(); 
      await navigateToPage(pageName);
    });
  });

  // --- B. XỬ LÝ LOGO CLICK (PHẦN MỚI BẠN MUỐN) ---
  // (Quan trọng: Phải chọn logo BÊN TRONG footer)
  const logo = $("#footer .footer-about .logo"); 

  if (logo) {
    // Gán sự kiện click y hệt như header.js
    logo.addEventListener("click", async (e) => {
      e.preventDefault();

      const overlay = $("#logo-overlay");
      if (!overlay) {
        // Fallback an toàn nếu không có overlay
        await navigateToPage("Home");
        return;
      }

      // Hiện overlay + chạy animation
      overlay.classList.add("show");
      const plane = overlay.querySelector(".overlay-plane");
      let done = false;

      const goHome = async () => {
        if (done) return;
        done = true;
        await navigateToPage("Home"); // Dùng hàm navigate đã tách
        overlay.classList.remove("show");
      };

      // Xử lý chuyển trang sau animation hoặc timeout
      if (plane) {
        plane.addEventListener("animationend", goHome, { once: true });
      }
      setTimeout(goHome, 1500); // Fallback an toàn
    });
  }

  console.log("Footer links VÀ logo đã được khởi tạo cho SPA routing");
}