// ===============================
// tourdetail.js (SPA FIXED + Stable + Booking Popup + Login Popup)
// ===============================
import { I18N, applyTranslations } from "./lang.js";

export async function initPage() {
  console.log("✅ Tour Detail JS initialized");

  // Gắn hash khi vào trang (không ảnh hưởng SPA)
  history.replaceState({ page: "tour-detail" }, "", "#tour-detail");

  // ===============================
  // POPSTATE (Back browser)
  // ===============================
  if (window._tourPopHandler) {
    window.removeEventListener("popstate", window._tourPopHandler);
  }

  window._tourPopHandler = (e) => {
    if (e?.state?.page === "tour-detail") return;

    history.replaceState(null, "", location.pathname);

    if (typeof window.loadSection === "function") {
      window.loadSection("main", "./pages/tour.html", "./tour.js", "Tours");
    } else {
      window.location.href = "./tour.html";
    }
  };

  window.addEventListener("popstate", window._tourPopHandler);

  // ===============================
  // NÚT BACK
  // ===============================
  const backBtn = document.querySelector(".back-btn-tour");
  if (backBtn) {
    backBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      history.replaceState(null, "", location.pathname);

      await window.loadSection(
        "main",
        "./pages/tour.html",
        "./tour.js",
        "Tours"
      );
    });
  }

  // ===============================
  // REMOVE HANDLERS KHI RỜI TRANG
  // ===============================
  const removeTourHandlers = () => {
    history.replaceState(null, "", location.pathname);

    if (window._tourPopHandler) {
      window.removeEventListener("popstate", window._tourPopHandler);
      delete window._tourPopHandler;
      console.log("🧹 Tour Detail handler removed");
    }
  };

  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a,button");
    if (!link) return;

    const href = link.getAttribute("href") || "";

    if (
      href.includes("blog") ||
      href.includes("home") ||
      href.includes("about") ||
      href.includes("contact") ||
      href.includes("tour.html") ||
      link.classList.contains("btn-explore") ||
      link.classList.contains("logo")
    ) {
      removeTourHandlers();
    }
  });

  window.addEventListener("beforeunload", removeTourHandlers);

  // ===============================
  // Video Popup
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
  // Smooth Scroll Navigation
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
  // Accordion
  // ===============================
  document.querySelectorAll(".accordion-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
      const content = btn.parentElement.nextElementSibling;
      content.classList.toggle("open");
    });
  });

  // ===============================
  // Tabs
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
  // Booking Form
  // ===============================

  const pricePerAdult = 299;
  const guestInputs = document.querySelectorAll(".guest-inputs input");
  const adultInput = guestInputs[0];
  const kidInput = guestInputs[1];
  const totalEl = document.querySelector(".form-bottom .price span:last-child");
  const bookBtn = document.querySelector(".book-btn");
  const form = document.querySelector(".join-form");

  if (!adultInput || !kidInput || !form || !bookBtn) {
    console.warn("⚠️ Booking form elements not found.");
    return;
  }

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
  // SAVE BOOKING
  // ===============================
  if (bookBtn) {
    bookBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      // ⭐ CHECK LOGIN → SHOW POPUP ⭐
      const currentUserStr = localStorage.getItem("currentUser");
      if (!currentUserStr) {
        if (typeof window.openLoginPopup === "function") {
          window.openLoginPopup();
        } else {
          console.warn("⚠️ openLoginPopup() NOT FOUND");
        }
        return;
      }

      const currentUser = JSON.parse(currentUserStr);

      const name = document.getElementById("name")?.value.trim();
      const startDate = document.getElementById("start-date")?.value;
      const adults = parseInt(adultInput.value || "0");
      const kids = parseInt(kidInput.value || "0");
      const facility = document.getElementById("facilities")?.value;

      const tourTitle =
        document.querySelector(".tour-title")?.innerText || "Unknown Tour";
      const tourImageSrc =
        document.querySelector(".gallery-left img")?.src ||
        "./assets/images/tour/tour_1.webp";

      const totalText = totalEl.textContent.replace("$", "");

      if (!name || !startDate || adults <= 0 || !facility) {
        errorMsg.textContent = "Please fill all booking information!";
        return;
      }

      const newBooking = {
        id: Date.now(),
        userId: currentUser.username,
        tourName: tourTitle,
        image: tourImageSrc,
        customerName: name,
        date: startDate,
        guests: { adults, kids },
        facility,
        totalPrice: parseFloat(totalText),
        status: "Pending",
        bookingDate: new Date().toLocaleDateString("vi-VN"),
      };

      const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
      bookings.push(newBooking);
      localStorage.setItem("bookings", JSON.stringify(bookings));

      console.log("✅ Booking saved:", newBooking);

      const popup = document.createElement("div");
      popup.className = "booking-popup";
      popup.innerHTML = `
        <div class="popup-overlay"></div>
        <div class="popup-box">
          <span class="popup-close">&times;</span>
          <div class="popup-content">
            <div class="popup-icon">✅</div>
            <h2>Booking successful!</h2>
            <p>Thank you <strong>${name}</strong> for booking <strong>${tourTitle}</strong>.</p>
            <button class="popup-ok">OK</button>
          </div>
        </div>
      `;
      document.body.appendChild(popup);

      form.reset();
      adultInput.value = "";
      kidInput.value = "";
      updateTotal();

      const closePopup = () => popup.remove();
      popup.querySelector(".popup-close").addEventListener("click", closePopup);
      popup.querySelector(".popup-overlay").addEventListener("click", closePopup);
      popup.querySelector(".popup-ok").addEventListener("click", closePopup);
    });
  }

  // ===============================
  // Other Tours click handler
  // ===============================
  document.querySelectorAll(".others-list a").forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();

      const tourId = link.dataset.id || link.getAttribute("data-id");
      if (!tourId) return;

      sessionStorage.setItem("selectedTourId", tourId);
      window.scrollTo({ top: 0, behavior: "smooth" });

      history.replaceState(null, "", location.pathname);

      if (typeof window.loadSection === "function") {
        await window.loadSection(
          "main",
          "./pages/tourdetail.html",
          "./tourdetail.js",
          "Tours"
        );
      } else {
        window.location.href = "./tourdetail.html";
      }
    });
  });

  // ===============================
  // Lazy Loading
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
