import { loadSection } from "./utils.js";
import { setLanguage, enableAutoTranslate } from "./lang.js";

export async function initHeader() {
  console.log("Header initialized");
  enableAutoTranslate();

  const navLinksContainer = document.querySelector(".nav-links");
  const navLinks = navLinksContainer
    ? Array.from(document.querySelectorAll(".nav-links a"))
    : [];
  const hamburgerIcon = document.querySelector(".hamburger-btn i");
  const loginBtn = document.querySelector("#headerLoginBtn");
  const logoutBtn = document.querySelector("#headerLogoutBtn");
  const avatarWrapper = document.querySelector("#headerUserAvatar");
  const avatarImg = avatarWrapper?.querySelector("img");
  const userMenu = document.querySelector("#headerUserMenu");
  const userDropdown = document.querySelector("#headerUserDropdown");
  const authModal = document.querySelector("#auth-modal");
  const authBackdrop = document.querySelector(".auth-modal__backdrop");
  const authCloseBtn = document.querySelector(".auth-modal__close");
  const authIframe = document.querySelector("#auth-iframe");

  const bootAuthIframe = () => {
    const doc = authIframe?.contentDocument;
    if (!doc) return;

    // Bảo đảm CSS có mặt
    const links = Array.from(doc.querySelectorAll("link[rel='stylesheet']"));
    const hasAuth = links.some((l) => (l.href || "").includes("auth.css"));
    const hasGlobal = links.some((l) => (l.href || "").includes("global.css"));

    const appendLink = (href) => {
      const link = doc.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      doc.head.appendChild(link);
    };

    if (!hasGlobal) appendLink("../assets/css/global.css");
    if (!hasAuth) appendLink("../assets/css/auth.css");

    // Loại bỏ nền trắng bên trong iframe và overlay phụ
    // const style = doc.createElement("style");
    // style.textContent = `
    //   html, body { background: transparent !important; }
    //   .auth-modal { background: transparent !important; }
    //   .auth-modal-overlay { display: none !important; }
    // `;
    // doc.head.appendChild(style);

    // Hiển thị form (trong auth.html đang bị class hidden)
    doc.getElementById("auth-popup")?.classList.remove("hidden");
    doc.getElementById("login-section")?.classList.remove("hidden");
    doc.getElementById("register-section")?.classList.add("hidden");

    // Nạp script auth.js nếu chưa có
    const hasScript = doc.querySelector("script[data-auth-bootstrap='true']");
    const initAuth = () => doc.defaultView?.initAuthPopup?.();

    if (!hasScript) {
      const script = doc.createElement("script");
      script.src = "../assets/js/auth.js";
      script.dataset.authBootstrap = "true";
      script.onload = initAuth;
      doc.body.appendChild(script);
    } else {
      initAuth();
    }

    // Reset về tab login
    doc.defaultView?.postMessage({ type: "auth-reset" }, "*");
  };

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("currentUser"));
    } catch (e) {
      console.warn("Không đọc được currentUser:", e);
      return null;
    }
  };

  const resolveAvatarSrc = (user) => {
    const avatarName = (user && user.avatar) || "avatarDefault.webp";
    const safeAvatar = avatarName.replace(/\.wepb$/, ".webp");

    if (
      safeAvatar.startsWith("http") ||
      safeAvatar.startsWith("data:") ||
      safeAvatar.startsWith("./assets/") ||
      safeAvatar.startsWith("/assets/")
    ) {
      return safeAvatar;
    }

    return `./assets/images/users/${safeAvatar}`;
  };

  const closeAuthModal = () => {
    if (!authModal) return;
    authModal.classList.remove("show");
    authModal.setAttribute("aria-hidden", "true");
  };

  const openAuthModal = () => {
    if (!authModal) return;
    authModal.classList.add("show");
    authModal.setAttribute("aria-hidden", "false");
    if (authIframe) {
      authIframe.src = `./pages/auth.html?v=${Date.now()}`; // luôn reset form
      authIframe.onload = () => {
        bootAuthIframe();
      };
    }
  };

  const updateAuthUI = () => {
    const user = getStoredUser();
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const showAvatar = Boolean(isLoggedIn && user);

    if (loginBtn) {
      loginBtn.classList.toggle("is-hidden", showAvatar);
    }

    if (userMenu) {
      userMenu.classList.toggle("show", showAvatar);
      userMenu.style.display = showAvatar ? "flex" : "none";
    }

    if (userDropdown) {
      userDropdown.classList.remove("show");
    }

    if (avatarWrapper) {
      avatarWrapper.setAttribute(
        "title",
        showAvatar ? user.fullName || user.username || "Tài khoản" : "Đăng nhập"
      );

      if (avatarImg) {
        avatarImg.src = resolveAvatarSrc(user);
        avatarImg.onerror = () => {
          avatarImg.src = "./assets/images/users/avatarDefault.webp";
        };
      }
    }

    if (showAvatar) {
      closeAuthModal();
    }
  };

  // Định nghĩa mapping các trang
  const pageMap = {
    Home: { html: "./pages/home.html", js: "./home.js" },
    About: { html: "./pages/about.html", js: "./about.js" },
    Tours: { html: "./pages/tour.html", js: "./tour.js" },
    // TourDetail được sử dụng cho liên kết tour trong các trang khác, nhưng không cần trong nav
    TourDetail: { html: "./pages/tourdetail.html", js: "./tourdetail.js" },
    Blog: { html: "./pages/blog.html", js: "./blog.js" },
    Contact: { html: "./pages/contact.html", js: "./contact.js" },
    Bookings: { html: "./pages/bookings.html", js: "./bookings.js" },
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

    await loadSection("main", selected.html, selected.js, pageName);

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
  const btnExplore = document.querySelector(".btn-explore");
  if (btnExplore) {
    btnExplore.addEventListener("click", async (e) => {
      e.preventDefault();
      await navigateToPage("Tours");
      // Cập nhật lại trạng thái active của nav link
      document.querySelectorAll(".nav-links a").forEach((link) => {
        link.classList.toggle("active", link.classList.contains("Tours"));
      });
    });
  }

  // === CLICK LOGO => overlay + về HOME ===
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.addEventListener("click", async (e) => {
      e.preventDefault();

      const overlay = document.querySelector("#logo-overlay");
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

  // === HIỆU ỨNG HEADER KHI SCROLL ===
  window.addEventListener("scroll", () => {
    const header = document.querySelector(".header");
    if (!header) return;
    if (window.scrollY > 50) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  });

  // === HAMBURGER MENU ===
  const hamburgerBtn = document.querySelector(".hamburger-btn");

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
     AUTH BUTTON & MODAL
  ============================================== */
  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openAuthModal();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentUser");
      updateAuthUI();
      closeAuthModal();
    });
  }

  if (avatarWrapper && userDropdown) {
    avatarWrapper.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!userMenu?.classList.contains("show")) return;
      const isOpen = userDropdown.classList.toggle("show");
      if (isOpen) {
        document.addEventListener(
          "click",
          function handleOutside(event) {
            const withinMenu =
              userMenu?.contains(event.target) ||
              userDropdown.contains(event.target);
            if (!withinMenu) {
              userDropdown.classList.remove("show");
              document.removeEventListener("click", handleOutside);
            }
          },
          { once: true }
        );
      }
    });
  }

  authCloseBtn?.addEventListener("click", closeAuthModal);

  if (authModal && authBackdrop) {
    authModal.addEventListener("click", (e) => {
      const isBackdropClick =
        e.target === authModal || e.target === authBackdrop;
      if (isBackdropClick) closeAuthModal();
    });
  }

  document.addEventListener("keyup", (e) => {
    if (e.key === "Escape") closeAuthModal();
  });

  window.addEventListener("storage", (event) => {
    if (["isLoggedIn", "currentUser"].includes(event.key)) {
      updateAuthUI();
    }
  });

  window.addEventListener("message", (event) => {
    if (!event.data || typeof event.data !== "object") return;
    if (event.data.type === "auth-login-success") {
      updateAuthUI();
      closeAuthModal();
    }
  });

  updateAuthUI();

  /* =============================================
     USER MENU
  ============================================== */
  const btnProfile = document.querySelector("#headerProfileBtn");
  const btnHistory = document.querySelector("#headerHistoryBtn");
  if (btnProfile) {
    btnProfile.addEventListener("click", async (e) => {
      e.preventDefault();
      loadSection("main", "./pages/profile.html", "./profile.js", "Profile");
      // Đóng dropdown sau khi chọn
      if (userDropdown) userDropdown.classList.remove("show");
      // Cập nhật lại trạng thái active của nav link
      document.querySelectorAll(".nav-links a").forEach((link) => {
        link.classList.remove("active");
      });
    });
  }
  if (btnHistory) {
    btnHistory.addEventListener("click", async (e) => {
      e.preventDefault();
      loadSection("main", "./pages/bookings.html", "./bookings.js", "Bookings");
      // Đóng dropdown sau khi chọn
      if (userDropdown) userDropdown.classList.remove("show");
      // Cập nhật lại trạng thái active của nav link
      document.querySelectorAll(".nav-links a").forEach((link) => {
        link.classList.remove("active");
      });
    });
  }
  /* =============================================
     LANGUAGE SWITCHER
  ============================================== */

  const langBtn = document.querySelector("#langButton");
  const langDropdown = document.querySelector("#langDropdown");
  const languageSelector = document.querySelector(".language-selector");

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

        // Lấy mã ngôn ngữ từ tên file
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
