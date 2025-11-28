import { loadSection } from "./utils.js";

export async function initPage() {
  console.log("Home page loaded");

  // Helpers
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  /**
   * Chuyển hướng đến trang Tours và load nội dung.
   * @param {string} pageName - Tên trang cho log (mặc định là "Tours").
   */
  const navigateToTours = (pageName = "Tours") => {
    loadSection("main", "./pages/tour.html", "./tour.js", pageName);
  };

  /**
   * Chuyển hướng đến trang Tour Detail và load nội dung.
   */
  const navigateToTourDetail = () => {
    loadSection(
      "main",
      "./pages/tourdetail.html",
      "./tourdetail.js",
      "Tour Detail"
    );
  };

  /* =============================================
     PHẦN 1 & 3: HERO, SEARCH & DESTINATION ROUTING
     ============================================== */

  // Sửa orientation lỗi nhấp nháy
  window.addEventListener("orientationchange", () => {
    document.body.offsetHeight;
    window.scrollTo(0, 0);
  });

  // Nút All Tours
  $(".btn-tour")?.addEventListener("click", () => {
    console.log("Đã click btn-tour");
    navigateToTours();
  });

  // Nút Search trong form
  const cityInput = $("#city-input");
  $(".btn-search")?.addEventListener("click", (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (!city) {
      alert("Vui lòng nhập tên thành phố");
      return;
    }
    sessionStorage.setItem("searchCity", city);
    navigateToTours();
  });

  // Nút All Destinations
  $(".btn-destination")?.addEventListener("click", () => {
    console.log("Đã click btn-destination");
    navigateToTours();
  });

  // Card Destinations (lưu tỉnh/thành phố để lọc)
  $$(".dest-card").forEach((card) => {
    card.addEventListener("click", () => {
      const city = card.getAttribute("data-province-en");
      if (!city) return;
      sessionStorage.setItem("selectedProvince", city);
      navigateToTours();
    });
  });

  /* =============================================
     PHẦN 4: ABOUT SECTION ROUTING
     ============================================== */
  $(".btn-about")?.addEventListener("click", () => {
    console.log("Đã click btn-about");
    loadSection("main", "./pages/about.html", "./about.js", "About");
  });

  /* =============================================
     PHẦN 5: RECOMMENDED TRIPS SECTION (DATA LOAD & RENDER)
     ============================================== */

  const renderRecommendedTours = async () => {
    try {
      // 1. Tải dữ liệu Tours & Dịch thuật
      const res = await fetch("./data/tours.json");
      if (!res.ok) throw new Error("Không thể tải danh sách tour");
      const data = await res.json();
      const tours = data.tours.slice(0, 6);

      const lang = localStorage.getItem("lang") || "en";
      const langRes = await fetch(`././lang/${lang}.json`);
      const translations = await langRes.json();
      const locLabel = translations.tour_location || "Location";
      const dayLabel = translations.tour_days || "Days";

      const tourCards = $$(".tour-card");

      // 2. Render dữ liệu vào từng card
      tourCards.forEach((card, i) => {
        const t = tours[i];
        if (!t) return;

        const img = card.querySelector(".tour-img");
        const title = card.querySelector("h4");
        const location = card.querySelector(".location");
        const meta = card.querySelector(".tour-meta");
        const btn = card.querySelector(".btn-view");

        if (img) {
          img.src = t.image;
          img.alt = t.title;
        }
        if (title) title.textContent = t.title;
        if (location) location.textContent = `${locLabel}: ${t.location}`;
        if (meta)
          meta.innerHTML = `
            <span>⏱ ${t.duration} ${dayLabel}</span>
            <span> $${t.price}</span>
          `;
        if (btn) btn.dataset.id = t.id;
      });

      // 3. Sự kiện "View Tour"
      $$(".btn-view").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          sessionStorage.setItem("viewTourId", id); // Lưu ID tour
          await navigateToTourDetail();
          console.log("Đã mở tour id:", id);
        });
      });
    } catch (err) {
      console.error("Lỗi load tour ở home:", err);
    }
  };

  await renderRecommendedTours();

  // Nút xem thêm
  $(".btn-more")?.addEventListener("click", () => {
    console.log("Đã click btn-more");
    navigateToTours();
  });

  /* =============================================
     PHẦN 8 & 9: OFFER & TRIP SHOWCASE ROUTING
     ============================================== */

  // Nút ưu đãi đặc biệt
  $(".btn-offer")?.addEventListener("click", () => {
    console.log("Đã click ưu đãi đặc biệt");
    navigateToTours();
  });

  // Card Trip Showcase (chuyển đến detail)
  $$(".tripshowcase-container .trip-card").forEach((card) => {
    card.addEventListener("click", () => {
      console.log("Đã click vào trip-card");
      navigateToTourDetail();
    });
  });

  /* =============================================
     PHẦN 10: BLOG SECTION (DATA LOAD & RENDER)
     ============================================== */

  const renderBlogPreviews = async () => {
    const BLOG_JSON = "./data/blogs.json";
    const blogGrid = $(".blog-grid");

    if (!blogGrid) {
      console.error("Không tìm thấy .blog-grid trong HTML!");
      return;
    }

    try {
      const res = await fetch(BLOG_JSON);
      if (!res.ok) throw new Error(`Không thể tải file ${BLOG_JSON}`);
      const data = await res.json();

      if (!data.blogs || !Array.isArray(data.blogs)) {
        throw new Error("File blogs.json không có field 'blogs'");
      }

      const blogs = data.blogs.slice(0, 3);

      // Tạo HTML cho blog grid
      blogGrid.innerHTML = blogs
        .map((b) => {
          const [month, day] = b.date.split(" ");
          const shortMonth = month.substring(0, 3).toUpperCase();
          return `
            <div class="blog-item" data-slug="${b.slug}">
              <div class="blog-img">
                <img data-src="${b.image}" alt="${b.title}" class="lazy" />
                <div class="blog-date"><span>${day.replace(
                  ",",
                  ""
                )}</span> ${shortMonth}</div>
              </div>
              <div class="blog-content">
                <p class="blog-category">${b.category}</p>
                <h4 class="blog-title">${b.title}</h4>
                <div class="blog-author">
                  <img data-src="${b.avatar}" alt="${b.author}" class="lazy" />
                  <span>by ${b.author.replace("Admin ", "")}</span>
                </div>
              </div>
            </div>`;
        })
        .join("");

      // Thêm event mở Blog Detail
      $$(".blog-item").forEach((item) => {
        item.addEventListener("click", () => {
          const slug = item.dataset.slug;
          console.log("📰 Mở blog:", slug);
          sessionStorage.setItem("openBlogSlug", slug); // Lưu slug blog
          loadSection("main", "./pages/blog.html", "./blog.js", "Blog Detail");
        });
      });
    } catch (err) {
      console.error("Lỗi khi tải blogs:", err);
      blogGrid.innerHTML = `<p style="text-align:center">Không thể tải dữ liệu blog</p>`;
    }
  };

  await renderBlogPreviews();

  /* =============================================
     PHẦN 11: NEWSLETTER SECTION (FORM SUBMIT & POPUP)
     ============================================== */

  const setupNewsletterForm = async () => {
    const form = $(".newsletter-form");
    const emailInput = $("#newsletterEmail");
    const errorMsg = $(".error-msg");
    const popup = $("#thankPopup");
    const closePopup = $("#closePopup");

    let translations = {};

    // Tải ngôn ngữ cho thông báo lỗi/thành công (đảm bảo dịch thuật được áp dụng)
    const lang = localStorage.getItem("lang") || "en";
    const res = await fetch(`././lang/${lang}.json`);
    translations = await res.json();

    if (!form || !emailInput || !errorMsg || !popup) return;

    // Thiết lập trạng thái ban đầu cho popup
    popup.style.display = "none";
    popup.classList.add("hidden");

    const validateEmail = (email) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    // Hàm đóng popup
    const closePopupHandler = () => {
      popup.classList.remove("show");
      setTimeout(() => {
        popup.classList.add("hidden");
        popup.style.display = "none";
      }, 400); // 400ms = thời gian transition CSS
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();

      if (!validateEmail(email)) {
        errorMsg.textContent =
          translations.newsletter_error_invalid ||
          "Please enter a valid email address.";
        errorMsg.classList.add("show");
        emailInput.style.border = "2px solid #ff3b3b";
        return;
      }

      // Xử lý thành công
      errorMsg.classList.remove("show");
      emailInput.style.border = "none";
      emailInput.value = "";

      // Hiện popup cảm ơn
      popup.style.display = "flex";
      popup.classList.remove("hidden");
      requestAnimationFrame(() => popup.classList.add("show"));
    });

    closePopup?.addEventListener("click", closePopupHandler);
    // Đóng popup khi click vào backdrop
    popup.addEventListener("click", (e) => {
      if (e.target === popup) closePopupHandler();
    });
  };

  await setupNewsletterForm();

  /* =============================================
     HIỆU ỨNG LOAD ẢNH (Lazy Load + Fade-in)
     ============================================== */

  const initLazyImages = () => {
    const lazyImages = $$("img.lazy");

    // Khởi tạo Intersection Observer để theo dõi các ảnh lười
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            // Load ảnh từ data-src sang src
            img.src = img.dataset.src;

            // Thêm class 'loaded' sau khi ảnh tải xong để kích hoạt fade-in
            img.addEventListener("load", () => {
              img.classList.add("loaded");
            });
            obs.unobserve(img);
          }
        });
      },
      {
        rootMargin: "100px 0px", // Bắt đầu load sớm hơn 100px
        threshold: 0.1,
      }
    );

    lazyImages.forEach((img) => observer.observe(img));
  };

  initLazyImages();
}
