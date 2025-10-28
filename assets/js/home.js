import { loadSection } from "./utils.js";
export async function initPage() {
  console.log("Home page loaded");

  /* =============================================
   PHẦN 1: HERO SECTION (banner chính)
   ============================================== */

  window.addEventListener("orientationchange", () => {
    document.body.offsetHeight; // force reflow
    window.scrollTo(0, 0); // tránh giật khung
  });

  let btnTour = document.querySelector(".btn-tour");
  btnTour.addEventListener("click", async () => {
    console.log("Đã click btn-tour");
    loadSection("content", "./pages/tour.html", "./tour.js", "Tours");
  });

  const btnSearch = document.querySelector(".btn-search");
  const cityInput = document.querySelector("#city-input");
  btnSearch.addEventListener("click", async (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (!city) {
      alert("Vui lòng nhập tên thành phố");
      return;
    }
    sessionStorage.setItem("searchCity", city);
    loadSection("content", "./pages/tour.html", "./tour.js", "Tours");
  });
  /* =============================================
   PHẦN 2: FEATURE SECTION (điểm nổi bật)
   ============================================== */
  // Không có hành động nào ở phần này
  /* =============================================
   PHẦN 3: DESTINATIONS SECTION (điểm đến nổi bật)
   ============================================== */
  let btnDestinations = document.querySelector(".btn-destination");
  btnDestinations.addEventListener("click", async () => {
    console.log("Đã click btn-destination");
    loadSection("content", "./pages/tour.html", "./tour.js", "Tours");
  });

  const destCards = document.querySelectorAll(".dest-card");
  destCards.forEach((card) => {
    card.addEventListener("click", () => {
      const city = card.querySelector(".label span")?.textContent?.trim();
      if (!city) return;
      sessionStorage.setItem("selectedProvince", city);
      loadSection("content", "./pages/tour.html", "./tour.js", "Tours");
    });
  });
  /* =============================================
   PHẦN 4: ABOUT SECTION (giới thiệu thương hiệu)
   ============================================== */
  let btnAbout = document.querySelector(".btn-about");
  btnAbout.addEventListener("click", async () => {
    console.log("Đã click btn-about");
    loadSection("content", "./pages/about.html", "./about.js", "About");
  });
  /* =============================================
   PHẦN 5: RECOMMENDED TRIPS SECTION (gợi ý tour)
   ============================================== */
  try {
    // Fetch dữ liệu
    const res = await fetch("../data/tours.json");
    if (!res.ok) throw new Error("Không thể tải danh sách tour");
    const data = await res.json();

    // Lấy ra 6 tour đầu tiên
    const tours = data.tours.slice(0, 6);

    // Lấy danh sách .tour-card trong trang home
    const tourCards = document.querySelectorAll(".tour-card");

    tourCards.forEach((card, i) => {
      const t = tours[i];
      if (!t) return; // đề phòng thiếu dữ liệu

      const img = card.querySelector(".tour-img");
      const title = card.querySelector("h4");
      const location = card.querySelector(".location");
      const meta = card.querySelector(".tour-meta");
      const btn = card.querySelector(".btn-view");

      img.src = t.image;
      img.alt = t.title;
      title.textContent = t.title;
      location.textContent = `Location: ${t.location}`;
      meta.innerHTML = `
        <span>⏱ ${t.duration} Days</span>
        <span>💲 $${t.price}</span>
      `;
      btn.dataset.id = t.id;
    });

    // Sự kiện click "View Tour"
    document.querySelectorAll(".btn-view").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;

        // load sang trang chi tiết
        await loadSection(
          "content",
          "./pages/tourdetail.html",
          "./tourdetail.js",
          "Tour Detail"
        );

        // thêm id lên URL
        // history.pushState({}, "", `?id=${id}`);
      });
    });
  } catch (err) {
    console.error("Lỗi load tour ở home:", err);
  }

  let btnMore = document.querySelector(".btn-more");
  btnMore.addEventListener("click", async () => {
    console.log("Đã click btn-more");
    loadSection("content", "./pages/tour.html", "./tour.js", " Tours");
  });
  /* =============================================
   PHẦN 6: WHY CHOOSE US SECTION (lý do chọn Travel VN)
   ============================================== */
  //Cũng chưa có hành động gì ở phần này
  /* =============================================
   PHẦN 7: TESTIMONIALS SECTION (Đánh giá khách hàng)
  ============================================== */
  // Này cũng chưa có hành động gì ở phần này
  /* =============================================
   PHẦN 8: SPECIAL OFFER SECTION (Ưu đãi đặc biệt)
  ============================================== */
  const btnBooking = document.querySelector(".btn-offer");
  btnBooking.addEventListener("click", () => {
    console.log("Đã click vào ưu đãi đặc biệt");
    loadSection("content", "./pages/tour.html", "./tour.js", "Tours");
  });
  /* =============================================
   PHẦN 9: TRIP SHOWCASE SECTION (Gợi ý hành trình)
  ============================================== */
  const tripCards = document.querySelectorAll(
    ".tripshowcase-container .trip-card"
  );
  tripCards.forEach((card) => {
    card.addEventListener("click", () => {
      console.log("Đã click vào trip-card");
      loadSection(
        "content",
        "./pages/tourdetail.html",
        "./tourdetail.js",
        "Tour Detail"
      );
    });
  });
  /* =============================================
   PHẦN 10: BLOG SECTION (bài viết & kinh nghiệm du lịch)
  ============================================== */
  const BLOG_JSON = "../data/blogs.json";
  const blogGrid = document.querySelector(".blog-grid");

  if (!blogGrid) {
    console.error(" Không tìm thấy .blog-grid trong HTML!");
  } else {
    try {
      const res = await fetch(BLOG_JSON);
      if (!res.ok) throw new Error(`Không thể tải file ${BLOG_JSON}`);
      const data = await res.json();

      if (!data.blogs || !Array.isArray(data.blogs)) {
        throw new Error("File blogs.json không có field 'blogs'");
      }

      // Lấy 3 bài mới nhất
      const blogs = data.blogs.slice(0, 3);

      // Tạo HTML cho từng blog
      blogGrid.innerHTML = blogs
        .map((b) => {
          // Cắt ngày, tháng từ chuỗi "August 15, 2025"
          const [month, day] = b.date.split(" ");
          const shortMonth = month.substring(0, 3).toUpperCase();

          return `
          <div class="blog-item" data-slug="${b.slug}">
            <div class="blog-img">
              <img src="${b.image}" alt="${b.title}" />
              <div class="blog-date"><span>${day.replace(
                ",",
                ""
              )}</span> ${shortMonth}</div>
            </div>
            <div class="blog-content">
              <p class="blog-category">${b.category}</p>
              <h4 class="blog-title">${b.title}</h4>
              <div class="blog-author">
                <img src="${b.avatar}" alt="${b.author}" />
                <span>by ${b.author.replace("Admin ", "")}</span>
              </div>
            </div>
          </div>
        `;
        })
        .join("");

      // Thêm click event -> mở Blog Detail
      blogGrid.querySelectorAll(".blog-item").forEach((item) => {
        item.addEventListener("click", () => {
          const slug = item.dataset.slug;
          console.log("📰 Mở blog:", slug);
          sessionStorage.setItem("openBlogSlug", slug);
          loadSection(
            "content",
            "./pages/blog.html",
            "./blog.js",
            "Blog Detail"
          );
        });
      });
    } catch (err) {
      console.error(" Lỗi khi tải blogs:", err);
      blogGrid.innerHTML = `<p style="text-align:center">Không thể tải dữ liệu blog </p>`;
    }
  }
  /* =============================================
   PHẦN 11: NEWSLETTER SECTION (đăng ký nhận tin)
  ============================================== */
  const form = document.querySelector(".newsletter-form");
  const emailInput = document.getElementById("newsletterEmail");
  const errorMsg = document.querySelector(".error-msg");
  const popup = document.getElementById("thankPopup");
  const closePopup = document.getElementById("closePopup");

  if (!form || !emailInput || !errorMsg || !popup) return;

  popup.style.display = "none";
  popup.classList.add("hidden");

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();

    if (!validateEmail(email)) {
      // ❌ Email sai
      errorMsg.textContent = "Please enter a valid email address.";
      errorMsg.classList.add("show");
      emailInput.style.border = "2px solid #ff3b3b";
      return;
    }

    // ✅ Email đúng
    errorMsg.classList.remove("show");
    emailInput.style.border = "none";
    emailInput.value = "";

    popup.style.display = "flex";
    popup.classList.remove("hidden");
    requestAnimationFrame(() => popup.classList.add("show"));
  });

  const closePopupHandler = () => {
    popup.classList.remove("show");
    setTimeout(() => {
      popup.classList.add("hidden");
      popup.style.display = "none";
    }, 400);
  };

  closePopup?.addEventListener("click", closePopupHandler);
  popup.addEventListener("click", (e) => {
    if (e.target === popup) closePopupHandler();
  });
}
