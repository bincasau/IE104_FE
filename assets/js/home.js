import { loadSection } from "./utils.js";

export async function initPage() {
  console.log("Home page loaded");

  /* =============================================
   PHẦN 1: HERO SECTION (banner chính)
   ============================================== */

  // Sửa orientation lỗi nhấp nháy
  window.addEventListener("orientationchange", () => {
    document.body.offsetHeight;
    window.scrollTo(0, 0);
  });

  // Nút All Tours
  const btnTour = document.querySelector(".btn-tour");
  btnTour?.addEventListener("click", async () => {
    console.log("Đã click btn-tour");
    loadSection("content", "./pages/tour.html", "./tour.js", "Tours");
  });

  // Nút Search trong form
  const btnSearch = document.querySelector(".btn-search");
  const cityInput = document.querySelector("#city-input");
  btnSearch?.addEventListener("click", async (e) => {
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
   PHẦN 2: FEATURE SECTION
   ============================================== */
  // Không có JS

  /* =============================================
   PHẦN 3: DESTINATIONS SECTION
   ============================================== */
  const btnDestinations = document.querySelector(".btn-destination");
  btnDestinations?.addEventListener("click", async () => {
    console.log("Đã click btn-destination");
    loadSection("content", "./pages/tour.html", "./tour.js", "Tours");
  });

  const destCards = document.querySelectorAll(".dest-card");
  destCards.forEach((card) => {
    card.addEventListener("click", () => {
      const city = card.getAttribute("data-province-en");
      if (!city) return;
      sessionStorage.setItem("selectedProvince", city);
      loadSection("content", "./pages/tour.html", "./tour.js", "Tours");
    });
  });

  /* =============================================
   PHẦN 4: ABOUT SECTION
   ============================================== */
  const btnAbout = document.querySelector(".btn-about");
  btnAbout?.addEventListener("click", async () => {
    console.log("Đã click btn-about");
    loadSection("content", "./pages/about.html", "./about.js", "About");
  });

  /* =============================================
   PHẦN 5: RECOMMENDED TRIPS SECTION
   ============================================== */
  try {
    const res = await fetch("./data/tours.json");
    if (!res.ok) throw new Error("Không thể tải danh sách tour");
    const data = await res.json();

    // Lấy ngôn ngữ hiện tại
    const lang = localStorage.getItem("lang") || "en";
    const langRes = await fetch(`././lang/${lang}.json`);
    const translations = await langRes.json();

    const tours = data.tours.slice(0, 6);
    const tourCards = document.querySelectorAll(".tour-card");

    const locLabel = translations.tour_location || "Location";
    const dayLabel = translations.tour_days || "Days";

    tourCards.forEach((card, i) => {
      const t = tours[i];
      if (!t) return;

      const img = card.querySelector(".tour-img");
      const title = card.querySelector("h4");
      const location = card.querySelector(".location");
      const meta = card.querySelector(".tour-meta");
      const btn = card.querySelector(".btn-view");

      // Ảnh
      if (img) {
        img.src = t.image;
        img.alt = t.title;
      }

      // Tiêu đề
      if (title) title.textContent = t.title;

      // Địa điểm
      if (location) location.textContent = `${locLabel}: ${t.location}`;

      // Thời lượng và giá
      if (meta)
        meta.innerHTML = `
        <span>⏱ ${t.duration} ${dayLabel}</span>
        <span> $${t.price}</span>
      `;

      if (btn) btn.dataset.id = t.id;
    });

    // Sự kiện “View Tour”
    document.querySelectorAll(".btn-view").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        await loadSection(
          "content",
          "./pages/tourdetail.html",
          "./tourdetail.js",
          "Tour Detail"
        );
        console.log("Đã mở tour id:", id);
      });
    });
  } catch (err) {
    console.error("Lỗi load tour ở home:", err);
  }

  // Nút xem thêm
  const btnMore = document.querySelector(".btn-more");
  btnMore?.addEventListener("click", async () => {
    console.log("Đã click btn-more");
    loadSection("content", "./pages/tour.html", "./tour.js", "Tours");
  });

  /* =============================================
   PHẦN 6: WHY CHOOSE US SECTION
   ============================================== */
  // Không có hành động

  /* =============================================
   PHẦN 7: TESTIMONIALS SECTION
   ============================================== */
  // Không có hành động

  /* =============================================
   PHẦN 8: SPECIAL OFFER SECTION
   ============================================== */
  const btnBooking = document.querySelector(".btn-offer");
  btnBooking?.addEventListener("click", () => {
    console.log("Đã click ưu đãi đặc biệt");
    loadSection("content", "./pages/tour.html", "./tour.js", "Tours");
  });

  /* =============================================
   PHẦN 9: TRIP SHOWCASE SECTION
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
   PHẦN 10: BLOG SECTION
   ============================================== */
  const BLOG_JSON = "./data/blogs.json";
  const blogGrid = document.querySelector(".blog-grid");

  if (!blogGrid) {
    console.error("Không tìm thấy .blog-grid trong HTML!");
  } else {
    try {
      const res = await fetch(BLOG_JSON);
      if (!res.ok) throw new Error(`Không thể tải file ${BLOG_JSON}`);
      const data = await res.json();

      if (!data.blogs || !Array.isArray(data.blogs)) {
        throw new Error("File blogs.json không có field 'blogs'");
      }

      const blogs = data.blogs.slice(0, 3);

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
      console.error("Lỗi khi tải blogs:", err);
      blogGrid.innerHTML = `<p style="text-align:center">Không thể tải dữ liệu blog</p>`;
    }
  }

  /* =============================================
   PHẦN 11: NEWSLETTER SECTION
   ============================================== */
  const form = document.querySelector(".newsletter-form");
  const emailInput = document.getElementById("newsletterEmail");
  const errorMsg = document.querySelector(".error-msg");
  const popup = document.getElementById("thankPopup");
  const closePopup = document.getElementById("closePopup");

  let translations = {};

  (async () => {
    const lang = localStorage.getItem("lang") || "en";
    const res = await fetch(`././lang/${lang}.json`);
    translations = await res.json();
  })();

  if (form && emailInput && errorMsg && popup) {
    popup.style.display = "none";
    popup.classList.add("hidden");

    const validateEmail = (email) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

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

      // Ẩn lỗi nếu hợp lệ
      errorMsg.classList.remove("show");
      emailInput.style.border = "none";
      emailInput.value = "";

      // Hiện popup cảm ơn
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

  /* =============================================
   HIỆU ỨNG LOAD ẢNH (Lazy Load + Fade-in)
   ============================================== */
  const initLazyImages = () => {
    const lazyImages = document.querySelectorAll("img.lazy");

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.addEventListener("load", () => {
              img.classList.add("loaded");
            });
            obs.unobserve(img);
          }
        });
      },
      {
        rootMargin: "100px 0px",
        threshold: 0.1,
      }
    );

    lazyImages.forEach((img) => observer.observe(img));
  };

  initLazyImages();
}
