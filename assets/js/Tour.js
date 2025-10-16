document.addEventListener("DOMContentLoaded", () => {
  // === DANH SÁCH 34 TỈNH ===
  const provinces = [
    "An Giang","Bắc Ninh","Cà Mau","Cao Bằng","TP Cần Thơ","TP Đà Nẵng",
    "Đắk Lắk","Điện Biên","Đồng Nai","Đồng Tháp","Gia Lai","TP Hà Nội",
    "Hà Tĩnh","TP Hải Phòng","TP Hồ Chí Minh","TP Huế","Hưng Yên","Khánh Hòa",
    "Lai Châu","Lạng Sơn","Lào Cai","Lâm Đồng","Nghệ An","Ninh Bình",
    "Phú Thọ","Quảng Ngãi","Quảng Ninh","Quảng Trị","Sơn La","Tây Ninh",
    "Thái Nguyên","Thanh Hóa","Tuyên Quang","Vĩnh Long"
  ];

  // === DANH SÁCH HOẠT ĐỘNG DU LỊCH ===
  const activities = [
    "Adventure Activities",
    "Cultural & Historical Activities",
    "Relaxation & Nature Activities",
    "Water Activities",
    "Food & Culinary Tours",
    "Photography Trips",
    "Hiking & Trekking",
    "Wildlife Exploration",
    "Festival & Events",
    "Wellness & Spa Retreats"
  ];

  const destList = document.getElementById("destinationList");
  const actList = document.getElementById("activityList");
  const showMoreDestBtn = document.getElementById("showMoreDest");
  const showMoreActBtn = document.getElementById("showMoreAct");

  // === HÀM RENDER LIST CÓ GIỚI HẠN ===
  const renderList = (arr, container, limit, showAll) => {
    container.innerHTML = "";
    const items = showAll ? arr : arr.slice(0, limit);
    items.forEach((name) => {
      const label = document.createElement("label");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      label.appendChild(cb);
      label.appendChild(document.createTextNode(" " + name));
      container.appendChild(label);
    });
  };

  // === KHỞI TẠO DANH SÁCH ===
  let showAllDest = false;
  let showAllAct = false;
  renderList(provinces, destList, 4, showAllDest);
  renderList(activities, actList, 4, showAllAct);

  // === NÚT SHOW MORE / SHOW LESS ===
  showMoreDestBtn.addEventListener("click", () => {
    showAllDest = !showAllDest;
    renderList(provinces, destList, 4, showAllDest);
    showMoreDestBtn.textContent = showAllDest ? "Show Less" : "Show More";
  });

  showMoreActBtn.addEventListener("click", () => {
    showAllAct = !showAllAct;
    renderList(activities, actList, 4, showAllAct);
    showMoreActBtn.textContent = showAllAct ? "Show Less" : "Show More";
  });

  // === PRICE & DURATION RANGE ===
  const priceRange = document.getElementById("priceRange");
  const priceMin = document.getElementById("priceMin");
  const priceMax = document.getElementById("priceMax");

  const durationRange = document.getElementById("durationRange");
  const durationMin = document.getElementById("durationMin");
  const durationMax = document.getElementById("durationMax");

  // Giữ MIN cố định
  const fixedPriceMin = 0;
  const fixedDurationMin = 0;

  // Cập nhật giá trị khi kéo MAX
  priceRange.addEventListener("input", () => {
    priceMax.textContent = `$${priceRange.value}`;
  });

  durationRange.addEventListener("input", () => {
    durationMax.textContent = `${durationRange.value} day${durationRange.value > 1 ? "s" : ""}`;
  });

  // Khởi tạo hiển thị ban đầu
  priceMin.textContent = `$${fixedPriceMin}`;
  priceMax.textContent = `$${priceRange.value}`;
  durationMin.textContent = `${fixedDurationMin} day`;
  durationMax.textContent = `${durationRange.value} days`;
});


// === SORT FUNCTION ===
const sortSelect = document.getElementById("sortSelect");
sortSelect.addEventListener("change", () => {
  const value = sortSelect.value;
  if (value === "recent") {
    console.log("Sort: Recently Added");
  } else if (value === "priceAsc") {
    console.log("Sort: Price Low → High");
  } else if (value === "priceDesc") {
    console.log("Sort: Price High → Low");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");

  // Debounce nhỏ để không spam khi gõ
  let debounceTimer;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const q = e.target.value.trim();
      console.log("Search query:", q);
      // TODO: call your filter function here to filter tours
      // filterToursByQuery(q);
    }, 250);
  });

  sortSelect.addEventListener("change", (e) => {
    const mode = e.target.value;
    console.log("Sort mode:", mode);
    // TODO: apply sort logic on your tour list:
    // if (mode === 'priceAsc') sortByPriceAsc();
  });
});
