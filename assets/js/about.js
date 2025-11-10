export function initPage() {
  console.log("about.js loaded");

  /* =============================================
     THÔNG BÁO "TOAST" (THAY CHO ALERT)
  ============================================== */

  // 1. Các câu thông báo theo ngôn ngữ
  const notDevelopedMessages = {
    en: "This feature is under development. Please check back later!",
    vi: "Chức năng này đang được phát triển. Vui lòng thử lại sau!",
    cn: "此功能正在开发中。请稍后再来！",
    jp: "この機能は開発中です。後ほど再試行してください。",
  };

  // 2. Hàm hiển thị toast
  function showToast(message) {
    // Xóa toast cũ nếu có (tránh click nhiều lần)
    const existingToast = document.getElementById("feature-toast");
    if (existingToast) {
      existingToast.remove();
    }

    // Tạo phần tử toast mới
    const toast = document.createElement("div");
    toast.id = "feature-toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate (cho vào/ra)
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    // Tự động ẩn sau 3 giây
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);

    // Xóa khỏi DOM sau khi ẩn
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 3400);
  }

  // 3. Gán sự kiện cho nút Explore Trip & form
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-explore-trip");
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const lang = localStorage.getItem("lang") || "en";
    const message = notDevelopedMessages[lang] || notDevelopedMessages.en;
    showToast(message);
  });

  const bookingForm = document.querySelector(".booking-form");
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const lang = localStorage.getItem("lang") || "en";
      const message = notDevelopedMessages[lang] || notDevelopedMessages.en;
      showToast(message);
    });
  }

  /* =============================================
     CODE CŨ CỦA BẠN (Intersection Observer)
  ============================================== */

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  const selectors = [
    ".blog-text",
    ".about-intro__left",
    ".about-intro__middle",
    ".about-intro__right",
    ".timeline-item",
    ".booking-form",
    ".about-hero__content",
    ".about-hero__left h1",
  ];

  selectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      observer.observe(el);

      // Kiểm tra nếu phần tử đã hiển thị sẵn khi load trang
      const rect = el.getBoundingClientRect();
      const inView = rect.top <= window.innerHeight && rect.bottom >= 0;

      if (inView && getComputedStyle(el).opacity === "0") {
        el.classList.add("visible");
        observer.unobserve(el);
      }
    });
  });
}
