document.addEventListener("DOMContentLoaded", () => {
  // ==== ELEMENTS ====
  const destList = document.getElementById("destinationList");
  const actList = document.getElementById("activityList");
  const showMoreDestBtn = document.getElementById("showMoreDest");
  const showMoreActBtn = document.getElementById("showMoreAct");
  const sortSelect = document.getElementById("sortSelect");
  const searchInput = document.getElementById("searchInput");
  const priceRange = document.getElementById("priceRange");
  const priceMin = document.getElementById("priceMin");
  const priceMax = document.getElementById("priceMax");
  const durationRange = document.getElementById("durationRange");
  const durationMin = document.getElementById("durationMin");
  const durationMax = document.getElementById("durationMax");
  const container = document.getElementById("tour-list");
  const pagination = document.getElementById("pagination");

  // ==== STATE ====
  let tours = [];
  let filteredTours = [];
  let provinces = [];
  let activities = [];
  let showAllDest = false;
  let showAllAct = false;
  let currentPage = 1;
  const toursPerPage = 5;

  // ==== Helper ====
  const normalize = (s) =>
    String(s ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  // ==== Render checkbox filters ====
  function renderList(arr, container, limit, showAll, typeLabel) {
    container.innerHTML = "";

    const allLabel = document.createElement("label");
    const allCb = document.createElement("input");
    allCb.type = "checkbox";
    allCb.value = "all";
    allCb.checked = true;
    allLabel.appendChild(allCb);
    allLabel.appendChild(document.createTextNode(" All " + (typeLabel || "")));
    container.appendChild(allLabel);

    const items = showAll ? arr : arr.slice(0, limit);
    items.forEach((name) => {
      const label = document.createElement("label");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = name;
      label.appendChild(cb);
      label.appendChild(document.createTextNode(" " + name));
      container.appendChild(label);
    });
  }

  // ==== Load tours ====
  async function loadTours() {
    try {
      const res = await fetch("../data/tours.json");
      const data = await res.json();
      tours = Array.isArray(data.tours) ? data.tours : [];

      provinces = [...new Set(tours.map((t) => t.location))];
      activities = [...new Set(tours.flatMap((t) => t.activities || []))];

      renderList(provinces, destList, 4, showAllDest, "Destinations");
      renderList(activities, actList, 4, showAllAct, "Activities");

      const maxPriceFound = tours.length
        ? Math.max(...tours.map((t) => t.price))
        : 2000;
      priceRange.max = Math.max(2000, maxPriceFound);
      priceRange.value = priceRange.max;
      priceMin.textContent = `$0`;
      priceMax.textContent = `$${priceRange.value}`;

      const maxDurationFound = tours.length
        ? Math.max(...tours.map((t) => t.duration))
        : 15;
      durationRange.max = Math.max(15, maxDurationFound);
      durationRange.value = durationRange.max;
      durationMin.textContent = `1 day`;
      durationMax.textContent = `${durationRange.value} days`;

      attachFilterEvents();

      filteredTours = [...tours];
      renderTours();

      [priceRange, durationRange].forEach((r) => {
        setRangeProgress(r);
        r.addEventListener("input", () => setRangeProgress(r));
      });
    } catch (err) {
      console.error("Lỗi load tour:", err);
      container.innerHTML =
        "<p style='text-align:center'>Không thể load data tours.json</p>";
    }
  }

  // ==== Checkbox events ====
  function attachFilterEvents() {
    destList.querySelectorAll("input[type='checkbox']").forEach((cb) => {
      cb.addEventListener("change", onDestChange);
    });
    actList.querySelectorAll("input[type='checkbox']").forEach((cb) => {
      cb.addEventListener("change", onActChange);
    });
  }

  function onDestChange(e) {
    const allCb = destList.querySelector('input[value="all"]');
    if (e.target.value === "all" && e.target.checked) {
      destList
        .querySelectorAll('input[type="checkbox"]')
        .forEach((c) => (c.checked = c === e.target));
    } else if (e.target.checked) {
      allCb.checked = false;
    } else if (
      ![...destList.querySelectorAll('input[type="checkbox"]')].some(
        (c) => c.checked && c.value !== "all"
      )
    ) {
      allCb.checked = true;
    }
    applyFilters();
  }

  function onActChange(e) {
    const allCb = actList.querySelector('input[value="all"]');
    if (e.target.value === "all" && e.target.checked) {
      actList
        .querySelectorAll('input[type="checkbox"]')
        .forEach((c) => (c.checked = c === e.target));
    } else if (e.target.checked) {
      allCb.checked = false;
    } else if (
      ![...actList.querySelectorAll('input[type="checkbox"]')].some(
        (c) => c.checked && c.value !== "all"
      )
    ) {
      allCb.checked = true;
    }
    applyFilters();
  }

  // ==== Filtering ====
  function getSelectedValues(container) {
    return [
      ...container.querySelectorAll('input[type="checkbox"]:checked'),
    ].map((c) => normalize(c.value));
  }

  function applyFilters() {
    const searchQ = normalize(searchInput.value);
    const selectedProvs = getSelectedValues(destList);
    const selectedActs = getSelectedValues(actList);
    const maxPrice = parseInt(priceRange.value, 10);
    const maxDur = parseInt(durationRange.value, 10);
    const provAll = selectedProvs.includes("all") || selectedProvs.length === 0;
    const actAll = selectedActs.includes("all") || selectedActs.length === 0;

    filteredTours = tours.filter((t) => {
      const loc = normalize(t.location);
      const acts = (t.activities || []).map(normalize);
      return (
        (provAll || selectedProvs.includes(loc)) &&
        (actAll || acts.some((a) => selectedActs.includes(a))) &&
        normalize(t.title).includes(searchQ) &&
        t.price <= maxPrice &&
        t.duration <= maxDur
      );
    });

    currentPage = 1;
    renderTours();
  }

  // ==== Sort ====
  function sortTours(arr) {
    const mode = sortSelect.value;
    if (mode === "priceAsc") return arr.slice().sort((a, b) => a.price - b.price);
    if (mode === "priceDesc") return arr.slice().sort((a, b) => b.price - a.price);
    return arr.slice().sort((a, b) => b.id - a.id);
  }

  // ==== Render Tours ====
  function renderTours() {
    container.innerHTML = "";
    const sorted = sortTours(filteredTours);
    const totalPages = Math.max(1, Math.ceil(sorted.length / toursPerPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * toursPerPage;
    const pageTours = sorted.slice(start, start + toursPerPage);

    if (pageTours.length === 0) {
      container.innerHTML =
        "<p style='text-align:center'>Không có tour nào phù hợp 🥲</p>";
      pagination.innerHTML = "";
      return;
    }

    container.style.opacity = "0";
    setTimeout(() => {
      container.style.transition = "opacity 0.45s ease";
      container.style.opacity = "1";
    }, 60);

    pageTours.forEach((tour) => {
      const saveAmount = tour.oldPrice ? tour.oldPrice - tour.price : 0;

      let availHTML = "";
      if (Array.isArray(tour.availability) && tour.availability.length === 2) {
        const a = tour.availability[0];
        const b = tour.availability[1];
        availHTML = `
          <div class="date-range">
            <span class="date">${a}</span>
            <span class="range-arrow">→</span>
            <span class="date">${b}</span>
          </div>`;
      } else {
        availHTML = (tour.availability || [])
          .map((d) => `<span class="avail-date">${d}</span>`)
          .join("");
      }

      container.innerHTML += `
        <div class="tour-card scroll-animate">
          <div class="tour-image-wrapper">
            <img src="${tour.image}" alt="${tour.title}" loading="lazy" />
            ${
              tour.discount
                ? `<div class="discount-ribbon">${tour.discount}</div>`
                : ""
            }
          </div>

          <div class="tour-info">
            <h3>${tour.title}</h3>
            <p>${tour.shortDesc}</p>
            <p class="location"><i class="fa-solid fa-map-marker-alt" style="color:#d9302f;font-size:18px;"></i> ${tour.location}</p>
            <div class="availability">${availHTML}</div>
          </div>

          <div class="tour-price">
            <div class="price-box">
              <div class="price-row">
                ${
                  tour.oldPrice
                    ? `<div class="from-label">From $${tour.oldPrice}</div>`
                    : ""
                }
                <div class="price">$${tour.price}</div>
              </div>
              <div class="price-row-bottom">
                <div class="duration">${tour.duration} Days</div>
                ${
                  tour.oldPrice
                    ? `<div class="save">Save $${saveAmount}</div>`
                    : ""
                }
              </div>
            </div>
            <button class="view-more">View More</button>
          </div>
        </div>`;
    });

    // Lazy load
    container.querySelectorAll("img[loading='lazy']").forEach((img) => {
      if (img.complete) img.classList.add("lazy-loaded");
      else img.addEventListener("load", () => img.classList.add("lazy-loaded"));
    });

    // View More
    container.querySelectorAll(".tour-card .view-more").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.location.href = "../../pages/tourdetail.html";
      });
    });

    // Pagination
    pagination.innerHTML = "";
    const prev = document.createElement("button");
    prev.textContent = "Prev";
    prev.disabled = currentPage === 1;
    prev.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderTours();
      }
    });
    pagination.appendChild(prev);

    const maxButtons = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage + 1 < maxButtons)
      startPage = Math.max(1, endPage - maxButtons + 1);

    for (let p = startPage; p <= endPage; p++) {
      const btn = document.createElement("button");
      btn.textContent = p;
      if (p === currentPage) btn.classList.add("active");
      btn.addEventListener("click", () => {
        currentPage = p;
        renderTours();
      });
      pagination.appendChild(btn);
    }

    const next = document.createElement("button");
    next.textContent = "Next";
    next.disabled = currentPage === totalPages;
    next.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTours();
      }
    });
    pagination.appendChild(next);
  }

  // ==== Show more ====
  showMoreDestBtn.addEventListener("click", () => {
    showAllDest = !showAllDest;
    renderList(provinces, destList, 4, showAllDest, "Destinations");
    showMoreDestBtn.textContent = showAllDest ? "Show Less" : "Show More";
    attachFilterEvents();
    applyFilters();
  });

  showMoreActBtn.addEventListener("click", () => {
    showAllAct = !showAllAct;
    renderList(activities, actList, 4, showAllAct, "Activities");
    showMoreActBtn.textContent = showAllAct ? "Show Less" : "Show More";
    attachFilterEvents();
    applyFilters();
  });

  // ==== Inputs ====
  let debounce;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(applyFilters, 250);
  });
  sortSelect.addEventListener("change", applyFilters);
  priceRange.addEventListener("input", () => {
    priceMax.textContent = `$${priceRange.value}`;
    applyFilters();
  });
  durationRange.addEventListener("input", () => {
    durationMax.textContent = `${durationRange.value} day${
      durationRange.value > 1 ? "s" : ""
    }`;
    applyFilters();
  });

  // ==== Start ====
  loadTours();
});

// ==== Range bar ====
function setRangeProgress(inputEl) {
  const min = Number(inputEl.min || 0);
  const max = Number(inputEl.max || 100);
  const val = Number(inputEl.value);
  const percent = Math.round(((val - min) / (max - min)) * 100);
  inputEl.style.setProperty("--progress", `${percent}%`);
}
