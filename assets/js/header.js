import { loadSection } from "./utils.js";
import { setLanguage, applyTranslations, enableAutoTranslate } from "./lang.js";
export async function initHeader() {
  console.log("Header initialized");
  enableAutoTranslate();

  const navLinksContainer = document.querySelector(".nav-links");
  const navLinks = navLinksContainer
    ? navLinksContainer.querySelectorAll("a")
    : [];

  // === CLICK MENU LINKS ===
  navLinks.forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      history.replaceState(null, "", location.pathname);
      const pageName = [...link.classList].find((c) => c !== "active");
      if (!pageName) return;

      const pageMap = {
        Home: { html: "./pages/home.html", js: "./home.js" },
        About: { html: "./pages/about.html", js: "./about.js" },
        Tours: { html: "./pages/tour.html", js: "./tour.js" },
        TourDetail: { html: "./pages/tourdetail.html", js: "./tourdetail.js" },
        Blog: { html: "./pages/blog.html", js: "./blog.js" },
        Contact: { html: "./pages/contact.html", js: "./contact.js" },
      };

      const selected = pageMap[pageName];
      if (!selected) return console.warn("Trang không tồn tại:", pageName);

      // 🧹 Nếu còn handler của Tour Detail, xoá NGAY trước khi chuyển trang
      if (window._tourPopHandler) {
        window.removeEventListener("popstate", window._tourPopHandler);
        delete window._tourPopHandler;
      }

      if (location.hash) {
        history.replaceState(null, "", location.pathname);
      }

      // 🧹 Xoá handler của Tour Detail trước khi chuyển trang
      if (window._tourPopHandler) {
        window.removeEventListener("popstate", window._tourPopHandler);
        delete window._tourPopHandler;
      }

      if (location.hash) {
        history.replaceState(null, "", location.pathname);
      }

      await loadSection("content", selected.html, selected.js, pageName);

      // 🧹 Khi chuyển sang trang khác, xóa handler của TourDetail nếu còn
      if (window._tourPopHandler) {
        window.removeEventListener("popstate", window._tourPopHandler);
        delete window._tourPopHandler;
      }

      // Đóng menu khi chọn link (mobile)
      if (navLinksContainer) navLinksContainer.classList.remove("show");

      // Đổi icon về hamburger
      const icon = document.querySelector(".hamburger-btn i");
      if (icon) icon.classList.replace("fa-xmark", "fa-bars");
    });
  });

  // === ICON MAIL ===
  const sendMailBtn = document.querySelector(".icon-mail");
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

  // === NÚT EXPLORE TRIP ===
  const btnExplore = document.querySelector(".btn-explore");
  if (btnExplore) {
    btnExplore.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadSection("content", "./pages/tour.html", "./tour.js", "Tours");

      // 🧹 Cleanup handler TourDetail (phòng lỗi khi click Explore từ trang detail)
      if (window._tourPopHandler) {
        window.removeEventListener("popstate", window._tourPopHandler);
        delete window._tourPopHandler;
      }
    });
  }

  // === CLICK LOGO => overlay + về HOME ===
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.addEventListener("click", async (e) => {
      e.preventDefault();

      const overlay = document.getElementById("logo-overlay");
      if (!overlay) {
        // fallback nếu chưa chèn overlay
        await loadSection("content", "./pages/home.html", "./home.js", "Home");
        return;
      }

      // Hiện overlay + chạy animation
      overlay.classList.add("show");

      const plane = overlay.querySelector(".overlay-plane");
      let done = false;

      const goHome = async () => {
        if (done) return;
        done = true;
        await loadSection("content", "./pages/home.html", "./home.js", "Home");
        overlay.classList.remove("show");
      };

      // Khi máy bay bay xong thì điều hướng về Home
      if (plane) {
        plane.addEventListener("animationend", goHome, { once: true });
      }

      // Fallback an toàn (phòng khi animation bị cancel)
      setTimeout(goHome, 1500);
    });
  }

  // === HIỆU ỨNG HEADER KHI SCROLL ===
  window.addEventListener("scroll", () => {
    const header = document.querySelector(".header");
    if (!header) return;
    if (window.scrollY > 50) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  });

  // === HAMBURGER MENU ===
  const hamburgerBtn = document.querySelector(".hamburger-btn");
  const icon = hamburgerBtn ? hamburgerBtn.querySelector("i") : null;

  if (hamburgerBtn && navLinksContainer) {
    hamburgerBtn.addEventListener("click", () => {
      const isOpen = navLinksContainer.classList.toggle("show");
      hamburgerBtn.classList.toggle("active", isOpen);

      if (icon) {
        if (isOpen) icon.classList.replace("fa-bars", "fa-xmark");
        else icon.classList.replace("fa-xmark", "fa-bars");
      }
    });
  } else {
    console.warn("Không tìm thấy .hamburger-btn hoặc .nav-links");
  }

  // === LANGUAGE DROPDOWN ===
  const langBtn = document.getElementById("langButton");
  const langDropdown = document.getElementById("langDropdown");
  const languageSelector = document.querySelector(".language-selector");

  if (langBtn && langDropdown && languageSelector) {
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      languageSelector.classList.toggle("show");
    });

    langDropdown.querySelectorAll("li").forEach((item) => {
      item.addEventListener("click", () => {
        const flagSrc = item.getAttribute("data-flag");
        const img = langBtn.querySelector("img");
        if (img) img.src = flagSrc;
        languageSelector.classList.remove("show");
      });
    });

    document.addEventListener("click", (e) => {
      if (!languageSelector.contains(e.target)) {
        languageSelector.classList.remove("show");
      }
    });
  } else {
    // Không có language selector trên 1 số layout -> bỏ qua
  }
  // ===== FETCH NGÔN NGỮ VÀ CẬP NHẬT TEXT =====
  // --- Khi chọn cờ ---
  langDropdown.querySelectorAll("li").forEach((item) => {
    item.addEventListener("click", async () => {
      const flagSrc = item.getAttribute("data-flag");
      const img = langBtn.querySelector("img");
      if (img) img.src = flagSrc;

      //  Lấy tên file thật (vd: eng.jpg -> eng)
      const filename = flagSrc.split("/").pop().split(".")[0];
      let lang = "en";
      if (filename === "vi") lang = "vi";
      else if (filename === "jp") lang = "jp";
      else if (filename === "cn") lang = "cn";

      await setLanguage(lang);
      localStorage.setItem("lang", lang); // Lưu lại để reload giữ ngôn ngữ
      languageSelector.classList.remove("show");
    });
  });

  // --- Tự động load ngôn ngữ đã lưu ---
  const savedLang = localStorage.getItem("lang") || "en";
  await setLanguage(savedLang);

  //  Cập nhật lại hình cờ đúng theo ngôn ngữ đã lưu
  const img = langBtn.querySelector("img");
  if (img) {
    switch (savedLang) {
      case "vi":
        img.src = "../assets/images/header/vi.jpg";
        break;
      case "jp":
        img.src = "../assets/images/header/jp.jpg";
        break;
      case "cn":
        img.src = "../assets/images/header/cn.jpg";
        break;
      default:
        img.src = "../assets/images/header/eng.jpg";
    }
  }
}
