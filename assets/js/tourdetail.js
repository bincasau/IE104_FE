// ===============================
// tourdetail.js (FINAL FIX - Stable + Booking Popup đẹp)
// ===============================
export async function initPage() {
  console.log("✅ Tour Detail JS initialized");

  // --- Gắn hash để dễ nhận diện ---
  if (!window.location.hash.includes("#tour-detail")) {
    history.replaceState({ page: "tour-detail" }, "", "#tour-detail");
  }

  // --- Gắn event popstate có thể gỡ được (chống stack) ---
  if (window._tourPopHandler) {
    window.removeEventListener("popstate", window._tourPopHandler);
  }

  window._tourPopHandler = (e) => {
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

  // --- Dọn dẹp event khi rời trang ---
  const removeTourHandlers = () => {
    if (window._tourPopHandler) {
      window.removeEventListener("popstate", window._tourPopHandler);
      delete window._tourPopHandler;
      console.log("🧹 Tour Detail handler removed");
    }
  };

  // Dọn dẹp khi click menu, logo, explore
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
  // 🩵 Booking Popup đẹp
  // ===============================
  if (bookBtn) {
    bookBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const name = document.getElementById("name")?.value.trim();
      const startDate = document.getElementById("start-date")?.value;
      const adults = parseInt(adultInput.value || "0");
      const facility = document.getElementById("facilities")?.value;

      if (!name || !startDate || adults <= 0 || !facility || facility === "Choose...") {
        errorMsg.textContent = "⚠️ Please fill in all required fields!";
        return;
      }
      errorMsg.textContent = "";

      const popup = document.createElement("div");
      popup.className = "booking-popup";
      popup.innerHTML = `
        <div class="popup-overlay"></div>
        <div class="popup-box">
          <span class="popup-close">&times;</span>
          <div class="popup-content">
            <div class="popup-icon">✅</div>
            <h2>Booking Confirmed!</h2>
            <p>
              Thank you, <strong>${name}</strong>!<br>
              Your booking for <strong>Ha Long Bay Luxury Cruise Tour</strong> has been received.<br>
              We'll contact you soon to confirm the details.
            </p>
            <button class="popup-ok">OK</button>
          </div>
        </div>
      `;
      document.body.appendChild(popup);

      // === CSS inline (giao diện đẹp)
      const style = document.createElement("style");
      style.textContent = `
        .booking-popup {
          position: fixed;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          font-family: 'Poppins', sans-serif;
        }
        .popup-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.55);
          animation: fadeIn 0.3s ease;
        }
        .popup-box {
          position: relative;
          background: #fff;
          border-radius: 18px;
          padding: 40px 50px;
          max-width: 480px;
          width: 90%;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.25);
          animation: scaleIn 0.3s ease;
        }
        .popup-close {
          position: absolute;
          top: 10px;
          right: 15px;
          font-size: 24px;
          color: #999;
          cursor: pointer;
          transition: 0.2s;
        }
        .popup-close:hover { color: #333; }
        .popup-icon {
          font-size: 42px;
          margin-bottom: 12px;
          animation: pop 0.4s ease;
        }
        .popup-content h2 {
          color: #2b6cb0;
          margin-bottom: 10px;
        }
        .popup-content p {
          color: #444;
          font-size: 15px;
          line-height: 1.6;
        }
        .popup-ok {
          margin-top: 20px;
          background: linear-gradient(135deg, #4A90E2, #357ABD);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: background 0.3s;
        }
        .popup-ok:hover {
          background: linear-gradient(135deg, #357ABD, #2b6cb0);
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);

      // === Đóng popup ===
      const closePopup = () => popup.remove();
      popup.querySelector(".popup-close").addEventListener("click", closePopup);
      popup.querySelector(".popup-overlay").addEventListener("click", closePopup);
      popup.querySelector(".popup-ok").addEventListener("click", closePopup);
    });
  }

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
