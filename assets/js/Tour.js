// Tour.js — Replace your old file with this
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

  // ==== Normalization for Vietnamese + whitespace + case ====
  const normalize = (s) =>
    String(s ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  // ==== Render checkboxes (adds an "All" checkbox at top) ====
  function renderList(arr, container, limit, showAll, typeLabel) {
    container.innerHTML = "";

    // All checkbox (checked by default)
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
      cb.checked = false;
      label.appendChild(cb);
      label.appendChild(document.createTextNode(" " + name));
      container.appendChild(label);
    });
  }

  // ==== Load tours JSON, init filters & ranges ====
  async function loadTours() {
    try {
      const res = await fetch("../data/tours.json");
      const data = await res.json();
      tours = Array.isArray(data.tours) ? data.tours : [];

      // get unique locations & activities
      provinces = [...new Set(tours.map((t) => t.location))];
      activities = [...new Set(tours.flatMap((t) => t.activities || []))];

      // render initial filter lists
      renderList(provinces, destList, 4, showAllDest, "Destinations");
      renderList(activities, actList, 4, showAllAct, "Activities");

      // set price range max to max price from data (and default value = max so all show)
      const maxPriceFound = tours.length ? Math.max(...tours.map((t) => t.price)) : 2000;
      priceRange.max = Math.max(2000, maxPriceFound);
      priceRange.value = priceRange.max;
      priceMin.textContent = `$0`;
      priceMax.textContent = `$${priceRange.value}`;

      // set duration range max to max duration
      const maxDurationFound = tours.length ? Math.max(...tours.map((t) => t.duration)) : 15;
      durationRange.max = Math.max(15, maxDurationFound);
      durationRange.value = durationRange.max;
      durationMin.textContent = `1 day`;
      durationMax.textContent = `${durationRange.value} days`;

      // attach events to new checkbox elements
      attachFilterEvents();

      filteredTours = [...tours];
      renderTours();
    } catch (err) {
      console.error("Lỗi load tour:", err);
      container.innerHTML = "<p style='text-align:center'>Không thể load data tours.json</p>";
    }
  }

  // ==== Attach events to checkbox lists (call after renderList) ====
  function attachFilterEvents() {
    // Destination checkboxes
    destList.querySelectorAll("input[type='checkbox']").forEach((cb) => {
      cb.removeEventListener("change", onDestChange);
      cb.addEventListener("change", onDestChange);
    });

    // Activity checkboxes
    actList.querySelectorAll("input[type='checkbox']").forEach((cb) => {
      cb.removeEventListener("change", onActChange);
      cb.addEventListener("change", onActChange);
    });
  }

  // ==== Checkbox handlers (keeps "All" semantics stable) ====
  function onDestChange(e) {
    const changed = e.target;
    const allCb = destList.querySelector('input[value="all"]');

    if (changed.value === "all" && changed.checked) {
      // check All -> uncheck others
      destList.querySelectorAll('input[type="checkbox"]').forEach((c) => {
        c.checked = c === changed;
      });
    } else if (changed.value !== "all" && changed.checked) {
      // uncheck All if any specific selected
      if (allCb) allCb.checked = false;
    } else {
      // if none selected -> re-enable All
      const anyChecked = Array.from(destList.querySelectorAll('input[type="checkbox"]'))
        .some((c) => c.checked && c.value !== "all");
      if (!anyChecked && allCb) allCb.checked = true;
    }

    applyFilters();
  }

  function onActChange(e) {
    const changed = e.target;
    const allCb = actList.querySelector('input[value="all"]');

    if (changed.value === "all" && changed.checked) {
      actList.querySelectorAll('input[type="checkbox"]').forEach((c) => {
        c.checked = c === changed;
      });
    } else if (changed.value !== "all" && changed.checked) {
      if (allCb) allCb.checked = false;
    } else {
      const anyChecked = Array.from(actList.querySelectorAll('input[type="checkbox"]'))
        .some((c) => c.checked && c.value !== "all");
      if (!anyChecked && allCb) allCb.checked = true;
    }

    applyFilters();
  }

  // ==== Build filter selection arrays (normalized) ====
  function getSelectedValues(container) {
    return Array.from(container.querySelectorAll('input[type="checkbox"]:checked'))
      .map((c) => normalize(c.value));
  }

  // ==== Apply all filters (search, checkboxes, price, duration) ====
  function applyFilters() {
    const searchQ = normalize(searchInput.value);
    const selectedProvs = getSelectedValues(destList); // 'all' normalized -> 'all'
    const selectedActs = getSelectedValues(actList);

    const maxPrice = parseInt(priceRange.value, 10);
    const maxDur = parseInt(durationRange.value, 10);

    // If nothing is checked (shouldn't happen because All is default), treat as all
    const provAllSelected = selectedProvs.length === 0 || selectedProvs.includes("all");
    const actAllSelected = selectedActs.length === 0 || selectedActs.includes("all");

    filteredTours = tours.filter((t) => {
      // normalize tour fields
      const loc = normalize(t.location);
      const acts = (t.activities || []).map((a) => normalize(a));
      const title = normalize(t.title);

      // province: OR if multiple selected (match any)
      const provinceMatch = provAllSelected || selectedProvs.includes(loc);

      // activities: OR if multiple selected (match any)
      const activityMatch = actAllSelected || acts.some((a) => selectedActs.includes(a));

      // search match (title includes search)
      const searchMatch = title.includes(searchQ);

      // price & duration
      const priceMatch = Number(t.price) <= maxPrice;
      const durationMatch = Number(t.duration) <= maxDur;

      return provinceMatch && activityMatch && searchMatch && priceMatch && durationMatch;
    });

    // reset page
    currentPage = 1;
    renderTours();
  }

  // ==== Sort helper ====
  function sortTours(arr) {
    const mode = sortSelect.value;
    if (mode === "priceAsc") return arr.slice().sort((a, b) => a.price - b.price);
    if (mode === "priceDesc") return arr.slice().sort((a, b) => b.price - a.price);
    // recent/default: by id desc (newer first) or leave as is
    return arr.slice().sort((a, b) => b.id - a.id);
  }

  // ==== Render tours + pagination (simple prev/next + numbered pages) ====
  function renderTours() {
    container.innerHTML = "";
    const sorted = sortTours(filteredTours);
    const totalPages = Math.max(1, Math.ceil(sorted.length / toursPerPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * toursPerPage;
    const pageTours = sorted.slice(start, start + toursPerPage);

    if (pageTours.length === 0) {
      container.innerHTML = "<p style='text-align:center'>Không có tour nào phù hợp 🥲</p>";
      pagination.innerHTML = "";
      return;
    }

    pageTours.forEach((tour) => {
      const saveAmount = tour.oldPrice ? tour.oldPrice - tour.price : 0;
      const datesHTML = (tour.availability || []).map(d => `<span class="avail-date">${d}</span>`).join("");
      container.innerHTML += `
        <div class="tour-card">
          <img src="${tour.image}" alt="${tour.title}">
          <div class="tour-info">
            <h3>${tour.title}</h3>
            <p>${tour.shortDesc}</p>
            <p class="location">📍 ${tour.location}</p>
            <div class="availability"><i class="fa-regular fa-calendar"></i> ${datesHTML}</div>
          </div>
          <div class="tour-price">
            <p class="duration">${tour.duration} Days</p>
            <div class="price-box">
              <p class="old-price">${tour.oldPrice ? `$${tour.oldPrice}` : ""}</p>
              <p class="price">$${tour.price}</p>
              ${saveAmount > 0 ? `<p class="save">💰 Save $${saveAmount}</p>` : ""}
            </div>
            <button>View More</button>
          </div>
        </div>
      `;
    });

    // build pagination (Prev, numbered pages limited, Next)
    pagination.innerHTML = "";
    const prev = document.createElement("button");
    prev.textContent = "Prev";
    prev.disabled = currentPage === 1;
    prev.addEventListener("click", () => { if (currentPage > 1) { currentPage--; renderTours(); } });
    pagination.appendChild(prev);

    // show up to 7 page buttons centered on current
    const maxButtons = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage + 1 < maxButtons) startPage = Math.max(1, endPage - maxButtons + 1);

    for (let p = startPage; p <= endPage; p++) {
      const btn = document.createElement("button");
      btn.textContent = p;
      if (p === currentPage) btn.classList.add("active");
      btn.addEventListener("click", () => { currentPage = p; renderTours(); });
      pagination.appendChild(btn);
    }

    const next = document.createElement("button");
    next.textContent = "Next";
    next.disabled = currentPage === totalPages;
    next.addEventListener("click", () => { if (currentPage < totalPages) { currentPage++; renderTours(); } });
    pagination.appendChild(next);
  }

  // ==== Show more / less handlers (re-render lists & re-attach events) ====
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

  // ==== Input & control events ====
  // search (debounced)
  let debounce;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(applyFilters, 250);
  });

  // sort
  sortSelect.addEventListener("change", () => { applyFilters(); });

  // range sliders
  priceRange.addEventListener("input", () => {
    priceMax.textContent = `$${priceRange.value}`;
    applyFilters();
  });
  durationRange.addEventListener("input", () => {
    durationMax.textContent = `${durationRange.value} day${durationRange.value > 1 ? "s" : ""}`;
    applyFilters();
  });

  // ==== Start ====
  loadTours();
});
