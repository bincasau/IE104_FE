import { loadSection } from "./utils.js";
import { setLanguage, enableAutoTranslate } from "./lang.js";

export async function initHeader() {
  console.log("Header initialized");
  enableAutoTranslate();

  // Helpers
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const navLinksContainer = $(".nav-links");
  const navLinks = navLinksContainer ? $$(".nav-links a") : [];
  const hamburgerIcon = $(".hamburger-btn i");

  // Định nghĩa mapping các trang
  const pageMap = {
    Home: { html: "./pages/home.html", js: "./home.js" },
    About: { html: "./pages/about.html", js: "./about.js" },
    Tours: { html: "./pages/tour.html", js: "./tour.js" },
    // TourDetail được sử dụng cho liên kết tour trong các trang khác, nhưng không cần trong nav
    TourDetail: { html: "./pages/tourdetail.html", js: "./tourdetail.js" },
    Blog: { html: "./pages/blog.html", js: "./blog.js" },
    Contact: { html: "./pages/contact.html", js: "./contact.js" },
  };

  /**
   * Đảm bảo xóa handler popstate của trang TourDetail để tránh lỗi khi chuyển trang khác.
   */
  const cleanupTourPopstate = () => {
    if (window._tourPopHandler) {
      window.removeEventListener("popstate", window._tourPopHandler);
      delete window._tourPopHandler;
    }
  };

  /**
   * Xử lý chuyển trang và làm sạch URL.
   * @param {string} pageName - Tên trang (ví dụ: "Home", "Tours").
   */
  const navigateToPage = async (pageName) => {
    const selected = pageMap[pageName];
    if (!selected) return console.warn("Trang không tồn tại:", pageName);

    // Dọn dẹp URL và handler trước khi load trang mới
    cleanupTourPopstate();
    if (location.hash) {
      history.replaceState(null, "", location.pathname);
    }

    await loadSection("content", selected.html, selected.js, pageName);

    // Đóng menu và đổi icon (cho mobile)
    navLinksContainer?.classList.remove("show");
    if (hamburgerIcon) hamburgerIcon.classList.replace("fa-xmark", "fa-bars");
  };

  /* =============================================
     NAV LINKS & ROUTING
  ============================================== */

  navLinks.forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const activeClass = "active";

      // Lấy tên trang (là class KHÔNG phải là 'active')
      const pageName = [...link.classList].find((c) => c !== activeClass);

      // Đảm bảo chỉ có một link active
      navLinks.forEach((l) => l.classList.remove(activeClass));
      link.classList.add(activeClass);

      if (pageName) {
        await navigateToPage(pageName);
      }
    });
  });

  // === NÚT EXPLORE TRIP (Chuyển đến Tours) ===
  const btnExplore = $(".btn-explore");
  if (btnExplore) {
    btnExplore.addEventListener("click", async (e) => {
      e.preventDefault();
      await navigateToPage("Tours");
      // Cập nhật lại trạng thái active của nav link
      $$(".nav-links a").forEach((link) => {
        link.classList.toggle("active", link.classList.contains("Tours"));
      });
    });
  }

  // === CLICK LOGO => overlay + về HOME ===
  const logo = $(".logo");
  if (logo) {
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
        await navigateToPage("Home");
        overlay.classList.remove("show");
      };

      // Xử lý chuyển trang sau animation hoặc timeout
      if (plane) {
        plane.addEventListener("animationend", goHome, { once: true });
      }
      setTimeout(goHome, 1500); // Fallback an toàn
    });
  }

  /* =============================================
     CHỨC NĂNG PHỤ
  ============================================== */

  // === ICON MAIL ===
  const sendMailBtn = $(".icon-mail");
  if (sendMailBtn) {
    sendMailBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const email = "infor@company.com";
      const subject = "Tư vấn chuyến đi cùng Travel VN";
      const body = "Xin chào Travel VN, tôi muốn được tư vấn về tour...";
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
    });
  }

  // === HIỆU ỨNG HEADER KHI SCROLL ===
  window.addEventListener("scroll", () => {
    const header = $(".header");
    if (!header) return;
    if (window.scrollY > 50) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  });

  // === HAMBURGER MENU ===
  const hamburgerBtn = $(".hamburger-btn");

  if (hamburgerBtn && navLinksContainer) {
    hamburgerBtn.addEventListener("click", () => {
      const isOpen = navLinksContainer.classList.toggle("show");
      hamburgerBtn.classList.toggle("active", isOpen);

      if (hamburgerIcon) {
        if (isOpen) hamburgerIcon.classList.replace("fa-bars", "fa-xmark");
        else hamburgerIcon.classList.replace("fa-xmark", "fa-bars");
      }
    });
  }

  /* =============================================
     LANGUAGE SWITCHER
  ============================================== */

  const langBtn = $("#langButton");
  const langDropdown = $("#langDropdown");
  const languageSelector = $(".language-selector");

  if (langBtn && langDropdown && languageSelector) {
    // 1. Mở/Đóng Dropdown
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      languageSelector.classList.toggle("show");
    });

    // Đóng dropdown khi click ra ngoài
    document.addEventListener("click", (e) => {
      if (!languageSelector.contains(e.target)) {
        languageSelector.classList.remove("show");
      }
    });

    // 2. Xử lý khi chọn cờ (đổi ngôn ngữ)
    langDropdown.querySelectorAll("li").forEach((item) => {
      item.addEventListener("click", async (e) => {
        e.preventDefault();

        const flagSrc = item.getAttribute("data-flag");
        const img = langBtn.querySelector("img");
        if (img) img.src = flagSrc;

        // Lấy mã ngôn ngữ từ tên file (vd: vi.webp -> vi)
        const filename = flagSrc.split("/").pop().split(".")[0];
        let lang = "en";
        const validLangs = ["vi", "jp", "cn"];
        if (validLangs.includes(filename)) {
          lang = filename;
        }

        await setLanguage(lang);
        localStorage.setItem("lang", lang); // Lưu lại ngôn ngữ đã chọn
        languageSelector.classList.remove("show");
      });
    });

    // 3. Tự động load ngôn ngữ đã lưu khi init
    const savedLang = localStorage.getItem("lang") || "en";
    await setLanguage(savedLang);

    // Cập nhật lại hình cờ đúng theo ngôn ngữ đã lưu
    const img = langBtn.querySelector("img");
    if (img) {
      const flagMap = {
        vi: "./assets/images/header/vi.webp",
        jp: "./assets/images/header/jp.webp",
        cn: "./assets/images/header/cn.webp",
        en: "./assets/images/header/eng.webp",
      };
      img.src = flagMap[savedLang] || flagMap.en;
    }
  }
}
