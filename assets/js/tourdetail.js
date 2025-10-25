import { loadSection } from "./utils.js";
document.addEventListener("DOMContentLoaded", function () {
  const openBtn = document.getElementById("openVideo");
  const popup = document.getElementById("videoPopup");
  const closeBtn = document.getElementById("closePopup");
  const iframe = document.getElementById("videoFrame");

  // Khi ấn nút Video
  openBtn.addEventListener("click", () => {
    iframe.src =
      "https://www.youtube.com/embed/Au6LqK1UH8g?si=AST096CW8htbvzTI"; // link video tour
    popup.style.display = "flex";
  });

  // Khi bấm dấu X hoặc nền đen thì tắt
  closeBtn.addEventListener("click", closeVideo);
  popup.addEventListener("click", (e) => {
    if (e.target === popup) closeVideo();
  });

  function closeVideo() {
    popup.style.display = "none";
    iframe.src = ""; // reset để dừng video
  }
});

// Cuộn mượt khi nhấn menu
document.querySelectorAll(".tour-nav a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    window.scrollTo({
      top: target.offsetTop - 60, // trừ khoảng header
      behavior: "smooth",
    });
  });
});

const btns = document.querySelectorAll(".accordion-btn");
btns.forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("active");
    const content = btn.parentElement.nextElementSibling;
    content.classList.toggle("open");
  });
});

const tabs = document.querySelectorAll(".mini-tab");
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const parent = tab.closest(".day-right");
    const allTabs = parent.querySelectorAll(".mini-tab");
    const allContents = parent.querySelectorAll(".tab-content");
    allTabs.forEach((t) => t.classList.remove("active"));
    allContents.forEach((c) => c.classList.remove("active"));
    tab.classList.add("active");
    parent.querySelector(`#${tab.dataset.tab}`).classList.add("active");
  });
});

// carousel prev/next scrolling
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".tour-grid");
  const btnPrev = document.querySelector(".tour-btn.prev");
  const btnNext = document.querySelector(".tour-btn.next");

  if (!grid || !btnPrev || !btnNext) return;

  // scroll amount = card width + gap (approx)
  function getScrollAmount() {
    const card = grid.querySelector(".tour-card");
    if (!card) return 300;
    const style = getComputedStyle(grid);
    const gap = parseInt(style.gap || 20);
    return Math.round(card.offsetWidth + gap);
  }

  btnNext.addEventListener("click", () => {
    grid.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
  });

  btnPrev.addEventListener("click", () => {
    grid.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
  });

  // optional: hide prev/next when cannot scroll further
  function updateButtons() {
    btnPrev.disabled = grid.scrollLeft <= 5;
    btnNext.disabled =
      grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 5;
    btnPrev.style.opacity = btnPrev.disabled ? "0.4" : "1";
    btnNext.style.opacity = btnNext.disabled ? "0.4" : "1";
  }
  grid.addEventListener("scroll", updateButtons);
  window.addEventListener("resize", updateButtons);
  updateButtons();
});

const otherTours = document.querySelectorAll(".others-list a");
otherTours.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    loadSection(
      "content",
      "./pages/tourdetail.html",
      "./tourdetail.js",
      "Tour Detail"
    );
  });
});
