import { loadSection } from "./utils.js";

export async function initHeader() {
  console.log("Header initialized");

  const navLinksContainer = document.querySelector(".nav-links");
  const navLinks = navLinksContainer
    ? navLinksContainer.querySelectorAll("a")
    : [];

  // === CLICK MENU LINKS ===
  navLinks.forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();

      // Lấy class đại diện cho trang (bỏ qua "active")
      const pageName = [...link.classList].find((c) => c !== "active");
      if (!pageName) return;

      console.log("Loading page:", pageName);

      // Bản đồ trang
      const pageMap = {
        Home: { html: "./pages/home.html", js: "./home.js" },
        About: { html: "./pages/about.html", js: "./about.js" },
        Tours: { html: "./pages/tour.html", js: "./tour.js" },
        Blog: { html: "./pages/blog.html", js: "./blog.js" },
        Contact: { html: "./pages/contact.html", js: "./contact.js" },
      };

      const selected = pageMap[pageName];
      if (!selected) return console.warn("Trang không tồn tại:", pageName);

      //  Gọi loadSection mới (đã xử lý active + title + load JS)
      await loadSection("content", selected.html, selected.js, pageName);

      // Đóng menu khi chọn link (mobile)
      navLinksContainer.classList.remove("show");

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
    });
  }

  // === CLICK LOGO => HOME ===
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadSection("content", "./pages/home.html", "./home.js", "Home");
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
        if (isOpen) {
          icon.classList.replace("fa-bars", "fa-xmark");
        } else {
          icon.classList.replace("fa-xmark", "fa-bars");
        }
      }
    });
  } else {
    console.warn("Không tìm thấy .hamburger-btn hoặc .nav-links");
  }
}
