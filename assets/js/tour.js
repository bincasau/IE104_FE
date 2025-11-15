export async function initPage() {
  console.log("Tour.js loaded ");

  // ===== 1. DOM Elements =====
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

  // ===== 2. State Variables =====
  let tours = [];
  let filteredTours = [];
  let provinces = [];
  let activities = [];
  let showAllDest = false;
  let showAllAct = false;
  let currentPage = 1;
  const toursPerPage = 5;

  // ===== 3. Utility Functions =====

  /**
   * Lấy text dịch từ global `window.__translations` hoặc fallback
   */
  function t(key, fallback) {
    if (window.__translations && window.__translations[key]) {
      return window.__translations[key];
    }
    const el = document.querySelector(`[data-key="${key}"]`);
    return el?.textContent?.trim() || fallback;
  }

  /**
   * Load file JSON ngôn ngữ ban đầu dựa trên localStorage
   */
  async function loadInitialTranslations() {
    const lang = localStorage.getItem("lang") || "en";
    try {
      const res = await fetch(`././lang/${lang}.json`);
      if (res.ok) {
        const translations = await res.json();
        window.__translations = translations;
      }
    } catch (err) {
      console.warn("Không thể load bản dịch ban đầu:", err);
    }
  }

  /**
   * Chuẩn hóa chuỗi: lowercase, bỏ dấu, bỏ khoảng trắng thừa
   */
  const normalize = (s) =>
    String(s ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  /**
   * Cập nhật màu nền cho input range
   */
  function setRangeProgress(inputEl) {
    const min = Number(inputEl.min || 0);
    const max = Number(inputEl.max || 100);
    const val = Number(inputEl.value);
    const percent = Math.round(((val - min) / (max - min)) * 100);
    inputEl.style.setProperty("--progress", `${percent}%`);
  }

  // ===== 4. Core Rendering =====

  /**
   * Render danh sách checkbox (cho điểm đến hoặc hoạt động)
   */
  function renderList(
    arr,
    container,
    limit,
    showAll,
    typeLabel,
    allKey,
    preSelectedValue = null // Dùng để tự động tick 1 giá trị (nếu có)
  ) {
    container.innerHTML = "";
    const allLabel = document.createElement("label");
    const allCb = document.createElement("input");
    allCb.type = "checkbox";
    allCb.value = "all";

    // 'All' is checked by default *unless* a pre-selected value is given
    allCb.checked = !preSelectedValue;

    allLabel.appendChild(allCb);
    const allText = document.createElement("span");
    allText.setAttribute("data-key", allKey);
    allText.textContent = t(allKey, "All " + (typeLabel || ""));
    allLabel.appendChild(allText);
    container.appendChild(allLabel);

    // Normalize the pre-selected value for comparison
    const normalizedPreSelected = normalize(preSelectedValue);

    const items = showAll ? arr : arr.slice(0, limit);
    items.forEach((name) => {
      const label = document.createElement("label");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = name;

      // Tự động check vào ô nếu nó khớp
      if (preSelectedValue && normalize(name) === normalizedPreSelected) {
        cb.checked = true;
      }

      label.appendChild(cb);
      label.appendChild(document.createTextNode(" " + name));
      container.appendChild(label);
    });
  }

  /**
   * Tạo chuỗi HTML cho một thẻ tour
   */
  function createTourCardHTML(tour) {
    const saveAmount = tour.oldPrice ? tour.oldPrice - tour.price : 0;
    const imgPath = tour.image.replace("././", "./");
    let availHTML = "";

    if (Array.isArray(tour.availability) && tour.availability.length === 2) {
      availHTML = `<div class="date-range"><span class="date">${tour.availability[0]}</span><span class="range-arrow">→</span><span class="date">${tour.availability[1]}</span></div>`;
    } else {
      availHTML = (tour.availability || [])
        .map((d) => `<span class="avail-date">${d}</span>`)
        .join("");
    }

    return `
      <div class="tour-card hidden-card">
        <div class="tour-image-wrapper">
          <img src="${imgPath}" alt="${tour.title}" loading="lazy" />
          ${
            tour.discount
              ? `<div class="discount-ribbon">${tour.discount}</div>`
              : ""
          }
        </div>
        <div class="tour-info">
          <h3>${tour.title}</h3>
          <p>${tour.shortDesc}</p>
          <p class="location"><i class="fa-solid fa-map-marker-alt" style="color:#d9302f;font-size:18px;"></i> ${
            tour.location
          }</p>
          <div class="availability">${availHTML}</div>
        </div>
        <div class="tour-price">
          <div class="price-box">
            <div class="price-row">
              ${
                tour.oldPrice
                  ? `<div class="from-label">${t(
                      "tour_from_label",
                      "From"
                    )} $${tour.oldPrice}</div>`
                  : ""
              }
              <div class="price">$${tour.price}</div>
            </div>
            <div class="price-row-bottom">
              <div class="duration">${tour.duration} ${
      tour.duration > 1
        ? t("tour_days_label", "Days")
        : t("tour_day_label", "Day")
    }</div>
              ${
                tour.oldPrice
                  ? `<div class="save">${t(
                      "tour_save_label",
                      "Save"
                    )} $${saveAmount}</div>`
                  : ""
              }
            </div>
          </div>
          <button class="view-more" data-key="tour_view_more">${t(
            "tour_view_more",
            "View More"
          )}</button>
        </div>
      </div>`;
  }

  /**
   * Render danh sách các tour đã lọc (chỉ render DOM)
   */
  function renderTours() {
    container.innerHTML = "";
    const sorted = sortTours(filteredTours);
    const totalPages = Math.max(1, Math.ceil(sorted.length / toursPerPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * toursPerPage;
    const pageTours = sorted.slice(start, start + toursPerPage);

    if (pageTours.length === 0) {
      container.innerHTML = `<p style='text-align:center'>${t(
        "tour_no_result",
        "No matching tours found 🥲"
      )}</p>`;
      pagination.innerHTML = "";
      return;
    }

    // Fade-in effect
    container.style.opacity = "0";
    setTimeout(() => {
      container.style.transition = "opacity 0.45s ease";
      container.style.opacity = "1";
    }, 60);

    // Render tour cards
    container.innerHTML = pageTours.map(createTourCardHTML).join("");

    // Setup interactions
    renderPagination(totalPages, sorted.length);
    setupTourCardInteractions(pageTours);
    setupLazyImageLoading(container);
  }

  /**
   * Render các nút phân trang
   */
  function renderPagination(totalPages) {
    pagination.innerHTML = "";
    if (totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement("button");
    prevBtn.textContent = t("tour_prev_btn", "Prev");
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderTours();
        window.scrollTo({ top: 200, behavior: "smooth" });
      }
    });
    pagination.appendChild(prevBtn);

    // Page Number Buttons
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      if (i === currentPage) btn.classList.add("active");
      btn.addEventListener("click", () => {
        currentPage = i;
        renderTours();
        window.scrollTo({ top: 200, behavior: "smooth" });
      });
      pagination.appendChild(btn);
    }

    // Next Button
    const nextBtn = document.createElement("button");
    nextBtn.textContent = t("tour_next_btn", "Next");
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTours();
        window.scrollTo({ top: 200, behavior: "smooth" });
      }
    });
    pagination.appendChild(nextBtn);
  }

  /**
   * Gắn sự kiện "View More" và Intersection Observer (lazy animation)
   */
  function setupTourCardInteractions(pageTours) {
    // "View More" click events
    container
      .querySelectorAll(".tour-card .view-more")
      .forEach((btn, index) => {
        btn.addEventListener("click", async () => {
          // Lấy tour tương ứng từ mảng `pageTours` (chính xác hơn)
          const selectedTour = pageTours[index];
          if (!selectedTour) return;

          sessionStorage.setItem("selectedTourId", selectedTour.id);
          if (window.loadSection) {
            await window.loadSection(
              "content",
              "./pages/tourdetail.html",
              "./tourdetail.js",
              "TourDetail"
            );
          } else {
            window.location.href = "./pages/tourdetail.html";
          }
        });
      });

    // Lazy animation
    const cards = container.querySelectorAll(".hidden-card");
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show-card");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    cards.forEach((card) => observer.observe(card));
  }

  /**
   * Xử lý lazy load cho ảnh (fade-in khi load xong)
   */
  function setupLazyImageLoading(containerEl) {
    containerEl.querySelectorAll("img[loading='lazy']").forEach((img) => {
      if (img.complete) {
        img.classList.add("lazy-loaded");
      } else {
        img.addEventListener("load", () => img.classList.add("lazy-loaded"));
      }
      // fallback
      setTimeout(() => img.classList.add("lazy-loaded"), 1000);
    });
  }

  // ===== 5. Data & Filtering Logic =====

  /**
   * Hàm chính: Fetch tour, xử lý state từ sessionStorage, và render UI ban đầu
   */
  async function loadTours() {
    try {
      const res = await fetch("././data/tours.json");
      const data = await res.json();
      tours = Array.isArray(data.tours) ? data.tours : [];

      provinces = [...new Set(tours.map((t) => t.location))];
      activities = [...new Set(tours.flatMap((t) => t.activities || []))];

      // 1️⃣ Lấy dữ liệu từ Home (sessionStorage)
      const searchCity = sessionStorage.getItem("searchCity");
      const selectedProvinceRaw = sessionStorage.getItem("selectedProvince");

      // Xoá sau khi dùng
      if (searchCity) sessionStorage.removeItem("searchCity");
      if (selectedProvinceRaw) sessionStorage.removeItem("selectedProvince");

      // 2️⃣ Nếu có searchCity → điền vào thanh tìm kiếm
      if (searchCity && searchInput) {
        searchInput.value = searchCity;
      }

      // 3️⃣ Xử lý tick tỉnh (nếu có selectedProvince)
      if (selectedProvinceRaw) {
        const selectedProvince = normalize(selectedProvinceRaw);
        const hasProvince = provinces.some(
          (p) => normalize(p) === selectedProvince
        );
        const isHidden =
          hasProvince && !showAllDest && provinces.length > 4;

        // Hàm này sẽ tìm và tick vào checkbox tỉnh
        const tickProvince = () => {
          const allCb = destList.querySelector('input[value="all"]');
          if (allCb) allCb.checked = false;

          const targetCb = Array.from(
            destList.querySelectorAll('input[type="checkbox"]')
          ).find((cb) => normalize(cb.value) === selectedProvince);

          if (targetCb) {
            targetCb.checked = true;
            applyFilters(); // Quan trọng: Áp dụng filter ngay sau khi tick
            console.log("✅ Đã tick tỉnh:", selectedProvinceRaw);
          } else {
            console.warn("⚠️ Không tìm thấy tỉnh:", selectedProvinceRaw);
          }
        };

        // Nếu tỉnh bị ẩn (cần "Show More")
        if (isHidden) {
          showAllDest = true;
          renderList(
            provinces,
            destList,
            4,
            showAllDest,
            "Destinations",
            "tour_all_destination"
          );
          attachFilterEvents(); // Phải gắn lại event
          showMoreDestBtn.textContent = "Show Less";
          setTimeout(tickProvince, 80); // Tick sau khi DOM update
        } else {
          // Tỉnh không bị ẩn
          renderList(
            provinces,
            destList,
            4,
            showAllDest,
            "Destinations",
            "tour_all_destination"
          );
          attachFilterEvents();
          setTimeout(tickProvince, 80);
        }
      } else {
        // Không có selectedProvince → render list bình thường
        renderList(
          provinces,
          destList,
          4,
          showAllDest,
          "Destinations",
          "tour_all_destination"
        );
        renderList(
          activities,
          actList,
          4,
          showAllAct,
          "Activities",
          "tour_all_activity"
        );
        attachFilterEvents();
      }

      // --- Cài đặt thanh trượt giá và thời lượng ---
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
      durationMin.textContent = t("tour_duration_min", "1 day");
      durationMax.textContent = `${durationRange.value} ${t(
        "tour_duration_day_label",
        "days"
      )}`;

      // Áp dụng filter lần đầu (quan trọng nếu không có tỉnh nào được chọn)
      if (!selectedProvinceRaw) {
        applyFilters();
      }

      [priceRange, durationRange].forEach((r) => {
        setRangeProgress(r);
        r.addEventListener("input", () => setRangeProgress(r));
      });
    } catch (err) {
      console.error("Lỗi load tour:", err);
      container.innerHTML = `<p style='text-align:center'>${t(
        "tour_no_result",
        "Unable to load tours 🥲"
      )}</p>`;
    }
  }

  /**
   * Lấy các giá trị đã chọn từ một container checkbox
   */
  function getSelectedValues(container) {
    return [
      ...container.querySelectorAll('input[type="checkbox"]:checked'),
    ].map((c) => normalize(c.value));
  }

  /**
   * Áp dụng tất cả các bộ lọc và render lại danh sách tour
   */
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

    currentPage = 1; // Reset về trang 1 khi filter
    renderTours();
  }

  /**
   * Sắp xếp mảng tour dựa trên giá trị của sortSelect
   */
  function sortTours(arr) {
    const mode = sortSelect.value;
    if (mode === "priceAsc")
      return arr.slice().sort((a, b) => a.price - b.price);
    if (mode === "priceDesc")
      return arr.slice().sort((a, b) => b.price - a.price);
    // Default (mới nhất)
    return arr.slice().sort((a, b) => b.id - a.id);
  }

  // ===== 6. Event Handlers =====

  /**
   * Gắn event listener cho các checkbox (phải gọi lại mỗi khi renderList)
   */
  function attachFilterEvents() {
    destList
      .querySelectorAll("input[type='checkbox']")
      .forEach((cb) => cb.addEventListener("change", onDestChange));
    actList
      .querySelectorAll("input[type='checkbox']")
      .forEach((cb) => cb.addEventListener("change", onActChange));
  }

  /**
   * Xử lý logic khi chọn checkbox điểm đến (Destinations)
   */
  function onDestChange(e) {
    const allCb = destList.querySelector('input[value="all"]');
    if (e.target.value === "all" && e.target.checked) {
      // Nếu
      destList
        .querySelectorAll('input[type="checkbox"]')
        .forEach((c) => (c.checked = c === e.target));
    } else if (e.target.checked) {
      // Bỏ check "All" nếu chọn cái khác
      allCb.checked = false;
    } else if (
      // Tự động check "All" nếu bỏ check hết
      ![...destList.querySelectorAll('input[type="checkbox"]')].some(
        (c) => c.checked && c.value !== "all"
      )
    ) {
      allCb.checked = true;
    }
    applyFilters();
  }

  /**
   * Xử lý logic khi chọn checkbox hoạt động (Activities)
   */
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

  // ===== 7. Initialization Flow =====

  // --- Load ngôn ngữ trước ---
  await loadInitialTranslations();

  // --- Load tour và cài đặt UI ban đầu ---
  // (Hàm này cũng gọi applyFilters() và attachFilterEvents() lần đầu)
  await loadTours();

  // --- Gắn các sự kiện filter còn lại ---
  showMoreDestBtn.addEventListener("click", () => {
    showAllDest = !showAllDest;
    renderList(
      provinces,
      destList,
      4,
      showAllDest,
      "Destinations",
      "tour_all_destination"
    );
    showMoreDestBtn.textContent = showAllDest
      ? "Show Less"
      : t("tour_filter_show_more", "Show More");
    attachFilterEvents(); // Phải gắn lại
    applyFilters();
  });

  showMoreActBtn.addEventListener("click", () => {
    showAllAct = !showAllAct;
    renderList(
      activities,
      actList,
      4,
      showAllAct,
      "Activities",
      "tour_all_activity"
    );
    showMoreActBtn.textContent = showAllAct
      ? "Show Less"
      : t("tour_filter_show_more", "Show More");
    attachFilterEvents(); // Phải gắn lại
    applyFilters();
  });

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
    durationMax.textContent = `${durationRange.value} ${t(
      "tour_duration_day_label",
      "days"
    )}`;
    applyFilters();
  });

  // --- Gắn sự kiện re-translate (khi đổi ngôn ngữ) ---
  window.addEventListener("retranslate", async () => {
    // Load lại file ngôn ngữ
    try {
      const lang = localStorage.getItem("lang") || "en";
      const res = await fetch(`././lang/${lang}.json`);
      const translations = await res.json();
      window.__translations = translations;
    } catch (err) {
      console.warn("Không thể load lại file ngôn ngữ:", err);
    }

    // Render lại các list
    renderList(
      provinces,
      destList,
      4,
      showAllDest,
      "Destinations",
      "tour_all_destination"
    );
    renderList(
      activities,
      actList,
      4,
      showAllAct,
      "Activities",
      "tour_all_activity"
    );
    // Cập nhật text (Hàm renderTours() sẽ tự dịch các thẻ)
    durationMax.textContent = `${durationRange.value} ${t(
      "tour_duration_day_label",
      "days"
    )}`;
    // Render lại tour (để dịch text trong thẻ)
    renderTours();
  });
}