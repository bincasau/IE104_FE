// ===============================
// tourdetail.js (FINAL FIX - no blog redirect)
// ===============================
export async function initPage() {
  console.log("✅ Tour Detail JS initialized");

  // --- Gắn hash để dễ nhận diện ---
  if (!window.location.hash.includes("#tour-detail")) {
    history.replaceState({ page: "tour-detail" }, "", "#tour-detail");
  }

  // --- Gắn event popstate có thể gỡ được (chống stack) ---
  if (window._tourPopHandler) {
    // Gỡ handler cũ nếu có, phòng trường hợp mở TourDetail nhiều lần (Others Tour)
    window.removeEventListener("popstate", window._tourPopHandler);
  }

  window._tourPopHandler = (e) => {
    // Chỉ xử lý khi rời khỏi trạng thái tour-detail thực sự
    if (e?.state?.page === "tour-detail") return;

    if (typeof window.loadSection === "function") {
      window.loadSection("content", "./pages/tour.html", "./tour.js", "Tours");
    } else {
      window.location.href = "./tour.html";
    }
  };

  window.addEventListener("popstate", window._tourPopHandler);

  // --- Nút Back ---
  const backBtn = document.querySelector(".back-btn-tour");
  if (backBtn) {
    backBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (typeof window.loadSection === "function") {
        await window.loadSection(
          "content",
          "./pages/tour.html",
          "./tour.js",
          "Tours"
        );
      } else {
        window.location.href = "./tour.html";
      }
    });
  }

  // --- Dọn dẹp event khi rời trang (mọi trường hợp) ---
  const removeTourHandlers = () => {
    if (window._tourPopHandler) {
      window.removeEventListener("popstate", window._tourPopHandler);
      delete window._tourPopHandler;
      console.log("🧹 Tour Detail handler removed");
    }
  };

  // Dọn dẹp khi click link trong header (menu / logo / explore)
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a, button");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    if (
      href.includes("blog") ||
      href.includes("home") ||
      href.includes("about") ||
      href.includes("contact") ||
      link.classList.contains("btn-explore") ||
      link.classList.contains("logo")
    ) {
      removeTourHandlers();
    }
  });

  // Dọn khi unload (rời trang)
  window.addEventListener("beforeunload", removeTourHandlers);

  // ===============================
  // 🎥 Video Popup
  // ===============================
  const openBtn = document.getElementById("openVideo");
  const popup = document.getElementById("videoPopup");
  const closeBtn = document.getElementById("closePopup");
  const iframe = document.getElementById("videoFrame");

  if (openBtn && popup && closeBtn && iframe) {
    openBtn.addEventListener("click", () => {
      iframe.src = "https://www.youtube.com/embed/Au6LqK1UH8g";
      popup.style.display = "flex";
    });
    const closeVideo = () => {
      popup.style.display = "none";
      iframe.src = "";
    };
    closeBtn.addEventListener("click", closeVideo);
    popup.addEventListener("click", (e) => {
      if (e.target === popup) closeVideo();
    });
  }

  // ===============================
  // 🧭 Smooth Scroll Navigation
  // ===============================
  document.querySelectorAll(".tour-nav a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").replace("#", "");
      const targetSection = document.getElementById(targetId);
      document
        .querySelectorAll(".tour-nav a")
        .forEach((a) => a.classList.remove("active"));
      link.classList.add("active");
      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 100,
          behavior: "smooth",
        });
      }
    });
  });

  // ===============================
  // 📂 Accordion
  // ===============================
  document.querySelectorAll(".accordion-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
      const content = btn.parentElement.nextElementSibling;
      content.classList.toggle("open");
    });
  });

  // ===============================
  // 🧭 Tabs
  // ===============================
  document.querySelectorAll(".mini-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const parent = tab.closest(".day-right");
      parent
        .querySelectorAll(".mini-tab")
        .forEach((t) => t.classList.remove("active"));
      parent
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));
      tab.classList.add("active");
      parent.querySelector(`#${tab.dataset.tab}`).classList.add("active");
    });
  });

  // ===============================
  // 💰 Booking Form
  // ===============================
  const pricePerAdult = 299;
  const adultInput = document.querySelector(
    ".guest-inputs input[placeholder='Adults']"
  );
  const kidInput = document.querySelector(
    ".guest-inputs input[placeholder='Kids']"
  );
  const totalEl = document.querySelector(".form-bottom .price span");
  const bookBtn = document.querySelector(".book-btn");
  const form = document.querySelector(".join-form");

  const errorMsg = document.createElement("p");
  Object.assign(errorMsg.style, {
    color: "red",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "8px",
  });
  form.appendChild(errorMsg);

  function updateTotal() {
    const adults = parseInt(adultInput.value || "1");
    const kids = parseInt(kidInput.value || "0");
    const total = adults * pricePerAdult + kids * pricePerAdult * 0.5;
    totalEl.textContent = `$${total.toFixed(2)}`;
  }

  adultInput.addEventListener("input", updateTotal);
  kidInput.addEventListener("input", updateTotal);
  updateTotal();

  // ===============================
  // ✅ Success Popup
  // ===============================
  const popupSuccess = document.createElement("div");
  popupSuccess.className = "popup-success";
  popupSuccess.innerHTML = `
    <div class="popup-content">
      <span class="popup-close">&times;</span>
      <h3>Booking Successful!</h3>
      <p>Thank you for choosing our tour 🎉</p>
      <button id="okBtn">OK</button>
    </div>
  `;
  document.body.appendChild(popupSuccess);

  Object.assign(popupSuccess.style, {
    display: "none",
    position: "fixed",
    inset: "0",
    background: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "1000",
  });

  const popupBox = popupSuccess.querySelector(".popup-content");
  Object.assign(popupBox.style, {
    background: "#fff",
    padding: "40px 60px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 5px 18px rgba(0,0,0,0.2)",
    position: "relative",
    width: "450px",
    maxWidth: "90%",
  });

  const closeIcon = popupSuccess.querySelector(".popup-close");
  closeIcon.style.cssText = `
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 24px;
    color: #888;
    cursor: pointer;
  `;

  const okBtn = popupSuccess.querySelector("#okBtn");
  okBtn.style.cssText = `
    background: #4A90E2;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    cursor: pointer;
    font-weight: 600;
    margin-top: 20px;
  `;

  const closePopup = () => (popupSuccess.style.display = "none");
  closeIcon.addEventListener("click", closePopup);
  okBtn.addEventListener("click", () => {
    popupSuccess.style.display = "none";
    if (typeof window.loadSection === "function") {
      removeTourHandlers();
      window.loadSection("content", "./pages/tour.html", "./tour.js", "Tours");
    } else {
      window.location.href = "./tour.html";
    }
  });

  // ===============================
  // 🧭 Other Tours click handler
  // ===============================
  document.querySelectorAll(".others-list a").forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const tourId = link.dataset.id || link.getAttribute("data-id");
      if (!tourId) return;
      sessionStorage.setItem("selectedTourId", tourId);
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (typeof window.loadSection === "function") {
        await window.loadSection(
          "content",
          "./pages/tourdetail.html",
          "./tourdetail.js",
          "Tours"
        );
      } else {
        window.location.href = `./tourdetail.html`;
      }
    });
  });

  // ===============================
  // ✨ Lazy Loading
  // ===============================
  const lazyEls = {
    gallery: document.querySelector(".tour-gallery"),
    title: document.querySelector(".title-frame"),
    nav: document.querySelector(".tour-nav"),
    overviewText: document.querySelector("#overview p"),
    overviewGrid: document.querySelector("#overview .overview-grid"),
    include: document.querySelector(".include-wrapper"),
    map: document.querySelector(".map-section"),
    itinerary: document.querySelector(".itinerary-section"),
    others: document.querySelector(".others-tour"),
    form: document.querySelector(".info-right"),
  };

  Object.values(lazyEls).forEach((el) => el?.classList.add("lazy-hide"));
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("lazy-show");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.2 }
  );
  setTimeout(() => lazyEls.gallery?.classList.add("lazy-show"), 150);
  setTimeout(() => {
    lazyEls.title?.classList.add("lazy-show");
    lazyEls.nav?.classList.add("lazy-show");
  }, 500);
  setTimeout(() => lazyEls.overviewText?.classList.add("lazy-show"), 800);
  setTimeout(() => lazyEls.overviewGrid?.classList.add("lazy-show"), 1200);
  [
    lazyEls.include,
    lazyEls.map,
    lazyEls.itinerary,
    lazyEls.others,
    lazyEls.form,
  ].forEach((sec) => sec && observer.observe(sec));
}
