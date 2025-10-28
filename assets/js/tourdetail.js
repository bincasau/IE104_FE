export async function initPage() {
  // document.addEventListener("DOMContentLoaded", async function () {
  // ===== Popup video =====
  const openBtn = document.getElementById("openVideo");
  const popup = document.getElementById("videoPopup");
  const closeBtn = document.getElementById("closePopup");
  const iframe = document.getElementById("videoFrame");

  if (openBtn && popup && closeBtn && iframe) {
    openBtn.addEventListener("click", () => {
      if (window.__currentTour && window.__currentTour.videoUrl) {
        iframe.src = window.__currentTour.videoUrl;
      } else {
        iframe.src = "https://www.youtube.com/embed/Au6LqK1UH8g";
      }
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

  // ===== Nav smooth scroll =====
  document.querySelectorAll(".tour-nav a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      window.scrollTo({ top: target.offsetTop - 60, behavior: "smooth" });
    });
  });

  // ===== Get selected tour ID =====
  const params = new URLSearchParams(window.location.search);
  const queryId = parseInt(params.get("id") || "", 10);
  const storageId = parseInt(
    sessionStorage.getItem("selectedTourId") || "",
    10
  );
  const tourId =
    Number.isFinite(queryId) && queryId > 0
      ? queryId
      : Number.isFinite(storageId)
      ? storageId
      : null;

  try {
    // ===== Load JSON =====
    const res = await fetch("../data/tours.json");
    const data = await res.json();
    const tours = Array.isArray(data.tours) ? data.tours : [];
    const tour = tours.find((t) => t.id === tourId) || tours[0];
    window.__currentTour = tour;

    // ===== Header title & breadcrumb =====
    document.querySelector(".tour-title").textContent = tour.title;
    const breadcrumbCurr = document.querySelectorAll(".breadcrumb .current");
    if (breadcrumbCurr.length)
      breadcrumbCurr[breadcrumbCurr.length - 1].textContent = tour.title;

    // ===== Overview =====
    const overviewText = document.querySelector("#overview p");
    if (overviewText && tour.overview) overviewText.textContent = tour.overview;
    const overviewItems = document.querySelectorAll(
      ".overview-grid .overview-item"
    );
    if (overviewItems.length >= 2) {
      overviewItems[0].innerHTML = `<i class="fa-solid fa-location-dot"></i> ${tour.location}`;
      overviewItems[1].innerHTML = `<i class="fa-regular fa-clock"></i> ${tour.duration} Days`;
    }

    // ===== Gallery =====
    const mainImg = document.querySelector(".gallery-left img");
    const smallImgs = document.querySelectorAll(".gallery-right img");
    if (tour.gallery && tour.gallery.length) {
      if (mainImg) mainImg.src = tour.gallery[0];
      smallImgs.forEach((img, i) => {
        img.src = tour.gallery[i + 1] || tour.gallery[i] || img.src;
      });
    }

    // ===== Includes =====
    const includeList = document.querySelectorAll("#include .include-list")[0];
    const notIncludeList = document.querySelectorAll(
      "#include .include-list"
    )[1];
    if (includeList && tour.includes)
      includeList.innerHTML = tour.includes
        .map((i) => `<li><i class="fa-solid fa-check check"></i> ${i}</li>`)
        .join("");
    if (notIncludeList && tour.notIncludes)
      notIncludeList.innerHTML = tour.notIncludes
        .map((i) => `<li><i class="fa-solid fa-xmark cross"></i> ${i}</li>`)
        .join("");

    // ===== Map =====
    const mapIframe = document.querySelector(".map-container iframe");
    if (mapIframe && tour.mapEmbed) mapIframe.src = tour.mapEmbed;

    // ===== Itinerary =====
    const timeline = document.querySelector(".timeline");
    if (timeline && tour.itinerary) {
      timeline.innerHTML = "";
      tour.itinerary.forEach((d) => {
        const id = `day${d.day}`;
        timeline.insertAdjacentHTML(
          "beforeend",
          `
          <div class="timeline-day">
            <div class="timeline-header">
              <div class="day-label">Day ${d.day}</div>
              <button class="accordion-btn">
                ${d.title}
                <i class="fa-solid fa-chevron-down"></i>
              </button>
            </div>
            <div class="accordion-content">
              <div class="day-right">
                <div class="day-image">
                  <img src="${d.image || tour.image}" alt="Day ${d.day}" />
                </div>
                <div class="mini-nav">
                  <button class="mini-tab active" data-tab="${id}-overview">Overview</button>
                  <button class="mini-tab" data-tab="${id}-schedule">Schedule</button>
                  <button class="mini-tab" data-tab="${id}-meals">Meals</button>
                  <button class="mini-tab" data-tab="${id}-accommodation">Accommodation</button>
                </div>
                <div class="tab-content active" id="${id}-overview"><p>${
            d.overview || ""
          }</p></div>
                <div class="tab-content" id="${id}-schedule"><ul>${(
            d.schedule || []
          )
            .map((s) => `<li>${s}</li>`)
            .join("")}</ul></div>
                <div class="tab-content" id="${id}-meals"><p>${
            d.meals || "—"
          }</p></div>
                <div class="tab-content" id="${id}-accommodation"><p>${
            d.accommodation || "—"
          }</p></div>
              </div>
            </div>
          </div>`
        );
      });

      // Accordion toggle
      timeline.querySelectorAll(".accordion-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          btn.classList.toggle("active");
          const content = btn.parentElement.nextElementSibling;
          content.classList.toggle("open");
        });
      });

      // Tabs
      timeline.querySelectorAll(".mini-tab").forEach((tab) => {
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
    }

    // ===== Price calc =====
    const totalEl = document.querySelector(".form-bottom .price span");
    const [adultInput, kidInput] = document.querySelectorAll(
      ".guests .guest-inputs input"
    );
    function updateTotal() {
      const adults = parseInt(adultInput.value || "1");
      const kids = parseInt(kidInput.value || "0");
      const total = adults * tour.price + kids * tour.price * 0.5;
      totalEl.textContent = `$${total.toFixed(2)}`;
    }
    adultInput.addEventListener("input", updateTotal);
    kidInput.addEventListener("input", updateTotal);
    updateTotal();

    // ===== Form Validation & Booking =====
    const bookBtn = document.querySelector(".book-btn");
    if (bookBtn) {
      bookBtn.addEventListener("click", (e) => {
        e.preventDefault();

        // Lấy các giá trị trong form
        const name = document.getElementById("name")?.value.trim();
        const startDate = document.getElementById("start-date")?.value;
        const adults = parseInt(
          document.querySelector(".guest-inputs input[placeholder='Adults']")
            ?.value || "0"
        );
        const kids = parseInt(
          document.querySelector(".guest-inputs input[placeholder='Kids']")
            ?.value || "0"
        );
        const facility = document.getElementById("facilities")?.value;

        // Kiểm tra dữ liệu
        if (
          !name ||
          !startDate ||
          adults <= 0 ||
          !facility ||
          facility === "Choose..."
        ) {
          alert("⚠️ Please fill in all required information before booking!");
          return;
        }

        // Nếu đầy đủ → tính tổng & thông báo thành công
        const total = adults * tour.price + kids * tour.price * 0.5;
        const totalFormatted = `$${total.toFixed(2)}`;

        alert(
          `✅ Booking successful!\n\n` +
            `Tour: ${tour.title}\n` +
            `Name: ${name}\n` +
            `Start Date: ${startDate}\n` +
            `Adults: ${adults}, Kids: ${kids}\n` +
            `Extra: ${facility}\n` +
            `Total: ${totalFormatted}`
        );

        console.log("Booking success:", {
          name,
          startDate,
          adults,
          kids,
          facility,
          total: totalFormatted,
        });
      });
    }

    // ===== Others Tour =====
    const othersContainer = document.querySelector(".others-list");
    if (othersContainer && Array.isArray(tours)) {
      othersContainer.innerHTML = "";
      const others = tours.filter((t) => t.id !== tour.id);
      const randomOthers = others.sort(() => 0.5 - Math.random()).slice(0, 4);
      randomOthers.forEach((t) => {
        const card = document.createElement("div");
        card.classList.add("tour-card-vertical");
        card.innerHTML = `
          <img src="${t.image}" alt="${t.title}" />
          <div class="tour-content">
            <div class="top-row">
              <h4>${t.title}</h4>
              <p class="price">$${t.price}</p>
            </div>
            <div class="bottom-row">
              <p><i class="fa-solid fa-location-dot"></i> ${t.location}</p>
              <p><i class="fa-regular fa-clock"></i> ${t.duration} days</p>
            </div>
          </div>
        `;
        const link = document.createElement("a");
        link.classList.add("tour-link");
        link.href = "#";
        link.appendChild(card);
        link.addEventListener("click", (e) => {
          e.preventDefault();
          sessionStorage.setItem("selectedTourId", String(t.id));
          if (typeof window.loadSection === "function") {
            window.loadSection(
              "content",
              "./pages/tourdetail.html",
              "./tourdetail.js",
              "Tour Detail"
            );
          } else {
            window.location.href = `./tourdetail.html?id=${t.id}`;
          }
        });
        othersContainer.appendChild(link);
      });
    }
  } catch (e) {
    console.error("Error loading tour detail", e);
  }
}
