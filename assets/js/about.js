export function initPage() {
  console.log("about.js loaded");

  /* =============================================
     THÔNG BÁO "TOAST" (THAY CHO ALERT)
  ============================================== */

  // 1. Các câu thông báo theo ngôn ngữ
  const notDevelopedMessages = {
    en: "This feature is under development. Please check back later!",
    vi: "Chức năng này đang được phát triển. Vui lòng thử lại sau!",
    cn: "此功能正在开发中。请稍后再来！", // Tiếng Trung
    jp: "この機能は開発中です。後ほど再試行してください。", // Tiếng Nhật
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
    // Dùng requestAnimationFrame để đảm bảo trình duyệt sẵn sàng cho transition
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    // Tự động ẩn sau 3 giây
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000); // Hiển thị 3 giây

    // Xóa hoàn toàn khỏi DOM sau khi transition kết thúc (3s + 0.4s)
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 3400); // 3000ms (hiển thị) + 400ms (thời gian transition trong CSS)
  }

  // 3. Hàm xử lý sự kiện click
  const showNotDevelopedToast = (event) => {
    event.preventDefault(); // Ngăn form submit hoặc chuyển link (#)

    // Lấy ngôn ngữ hiện tại từ localStorage, mặc định là 'en'
    const lang = localStorage.getItem("lang") || "en";

    // Lấy câu thông báo, nếu không tìm thấy lang thì fallback về 'en'
    const message = notDevelopedMessages[lang] || notDevelopedMessages.en;

    // Hiển thị toast
    showToast(message);
  };

  // 4. Gán sự kiện cho 2 nút "EXPLORE TRIP"
  const bookingFormButton = document.querySelector(
    ".booking-form .btn-explore-trip"
  );
  const heroCtaButton = document.querySelector(".about-hero__cta .btn-explore");

  if (bookingFormButton) {
    bookingFormButton.addEventListener("click", showNotDevelopedToast);
  }
  if (heroCtaButton) {
    heroCtaButton.addEventListener("click", showNotDevelopedToast);
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
      // Sửa lỗi: Kiểm tra xem el đã ở trong viewport khi tải trang chưa
      const rect = el.getBoundingClientRect();
      const inView = rect.top <= window.innerHeight && rect.bottom >= 0;

      // Nếu đã trong viewport (ví dụ: phần tử ở đầu trang)
      if (inView && getComputedStyle(el).opacity === "0") {
        el.classList.add("visible");
        observer.unobserve(el);
      }
    });
  });
}
