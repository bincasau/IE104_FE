// ===============================
// tourdetail.js (full SPA + Back + Other Tours click)
// ===============================
export async function initPage() {
  console.log("✅ Tour Detail JS initialized");

  // Push state to history
  if (!window.location.hash.includes("#tour-detail")) {
    history.pushState({ page: "tour-detail" }, "", "#tour-detail");
  }

  window.onpopstate = () => {
    if (typeof window.loadSection === "function") {
      window.loadSection("content", "./pages/tour.html", "./Tour.js", "Tour");
    } else {
      window.location.href = "./tour.html";
    }
  };

  // ===============================
  // 🔙 Back Button
  // ===============================
  let backBtn = document.querySelector(".back-btn");
  if (!backBtn) {
    const header = document.querySelector(".blog-frame");
    backBtn = document.createElement("button");
    backBtn.className = "back-btn";
    backBtn.innerHTML = `<i class="fa-solid fa-arrow-left"></i> Back`;
    Object.assign(backBtn.style, {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 20px",
      border: "2px solid #4A90E2",
      borderRadius: "10px",
      color: "#4A90E2",
      background: "#fff",
      fontWeight: "600",
      fontSize: "15px",
      cursor: "pointer",
      marginTop: "10px",
      marginLeft: "20px",
    });
    if (header) header.insertAdjacentElement("afterend", backBtn);
  }

  backBtn.addEventListener("click", () => {
    if (typeof window.loadSection === "function") {
      window.loadSection("content", "./pages/tour.html", "./Tour.js", "Tour");
    } else {
      window.location.href = "./tour.html";
    }
  });

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
  // SMOOTH SCROLL NAVIGATION FIX
  // ===============================
  document.querySelectorAll(".tour-nav a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault(); // 🛑 chặn reload trang

      const targetId = link.getAttribute("href").replace("#", "");
      const targetSection = document.getElementById(targetId);

      // Bỏ active cũ
      document
        .querySelectorAll(".tour-nav a")
        .forEach((a) => a.classList.remove("active"));
      link.classList.add("active");

      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 100, // trừ chiều cao header
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
  errorMsg.style.color = "red";
  errorMsg.style.fontSize = "14px";
  errorMsg.style.textAlign = "center";
  errorMsg.style.marginTop = "8px";
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
  Object.assign(closeIcon.style, {
    position: "absolute",
    top: "10px",
    right: "15px",
    fontSize: "24px",
    color: "#888",
    cursor: "pointer",
  });

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
      window.loadSection("content", "./pages/tour.html", "./Tour.js", "Tour");
    } else {
      window.location.href = "./tour.html";
    }
  });

  // ===============================
  // 🧳 Handle Book button
  // ===============================
  bookBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const name = document.getElementById("name")?.value.trim();
    const startDate = document.getElementById("start-date")?.value;
    const adults = parseInt(adultInput.value || "0");
    const facility = document.getElementById("facilities")?.value;

    if (
      !name ||
      !startDate ||
      adults <= 0 ||
      !facility ||
      facility === "Choose..."
    ) {
      errorMsg.textContent = "⚠️ Please fill in all required fields!";
      return;
    }

    errorMsg.textContent = "";
    popupSuccess.style.display = "flex";
  });

  // ===============================
  // 🧭 Other Tours click handler
  // ===============================
  document.querySelectorAll(".others-list a").forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const tourId = link.dataset.id || link.getAttribute("data-id");
      if (!tourId) return;

      // Lưu ID tour được chọn vào sessionStorage
      sessionStorage.setItem("selectedTourId", tourId);

      // Gọi lại chính trang tour detail
      if (typeof window.loadSection === "function") {
        await window.loadSection(
          "content",
          "./pages/tourdetail.html",
          "./tourdetail.js",
          "Tour Detail"
        );
      } else {
        window.location.href = `./tourdetail.html`;
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Tour Detail JS Loaded");

  // ===== Video Popup =====
  const openBtn = document.getElementById("openVideo");
  const popup = document.getElementById("videoPopup");
  const closeBtn = document.getElementById("closePopup");
  const iframe = document.getElementById("videoFrame");

  if (openBtn && popup && closeBtn && iframe) {
    openBtn.addEventListener("click", () => {
      iframe.src = "https://www.youtube.com/embed/Au6LqK1UH8g";
      popup.style.display = "flex";
    });

    closeBtn.addEventListener("click", closeVideo);
    popup.addEventListener("click", (e) => {
      if (e.target === popup) closeVideo();
    });

    function closeVideo() {
      popup.style.display = "none";
      iframe.src = "";
    }
  }

  // ===== Accordion =====
  document.querySelectorAll(".accordion-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
      const content = btn.parentElement.nextElementSibling;
      content.classList.toggle("open");
    });
  });

  // ===== Tabs =====
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

  // ===== Book Button Popup =====
  const bookBtn = document.querySelector(".book-btn");
  if (bookBtn) {
    bookBtn.addEventListener("click", () => {
      alert("✅ Booking successful! Thank you for joining this tour!");
    });
  }

  // ===== Back Button =====
  const backBtn = document.querySelector(".back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof window.loadSection === "function") {
        window.loadSection("content", "./pages/tour.html", "./Tour.js", "Tour");
      } else {
        window.location.href = "./tour.html";
      }
    });
  }

  // ===== Others Tours Click =====
  document.querySelectorAll(".others-list a").forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const tourId = link.dataset.id;
      if (!tourId) return;
      sessionStorage.setItem("selectedTourId", tourId);

      if (typeof window.loadSection === "function") {
        await window.loadSection(
          "content",
          "./pages/tourdetail.html",
          "./tourdetail.js",
          "Tour Detail"
        );
      } else {
        window.location.href = "./tourdetail.html";
      }
    });
  });
});
