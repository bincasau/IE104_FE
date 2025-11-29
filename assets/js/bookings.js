// ===============================
// bookings.js (FINAL VERSION WITH OTHER TOURS)
// ===============================

export function initPage() {
  console.log("✅ Bookings page initialized");

  const bookingListEl = document.querySelector(".booking-list");
  const historyHeading = document.querySelector(".history-heading");

  if (!bookingListEl) {
    console.warn("⚠️ .booking-list không tồn tại trong bookings.html");
    return;
  }

  // ===============================
  // 1. KIỂM TRA ĐĂNG NHẬP
  // ===============================
  const currentUserStr = localStorage.getItem("currentUser");

  if (!currentUserStr) {
    bookingListEl.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <h3>Please log in to view tour booking history.</h3>
        <a 
          href="#"
          class="btn-view-detail action-explore"
          style="display:inline-block; width:auto; margin-top:20px;"
        >
          Explore Tour now
        </a>
      </div>`;
    attachHandlers(bookingListEl);
    attachOtherToursHandlers();
    return;
  }

  const currentUser = JSON.parse(currentUserStr);

  // ===============================
  // 2. LẤY BOOKING CỦA USER
  // ===============================
  const allBookings = JSON.parse(localStorage.getItem("bookings")) || [];
  const userBookings = allBookings.filter(b => b.userId === currentUser.username);

  // Cập nhật tiêu đề
  if (historyHeading) {
    historyHeading.innerHTML = `Your tours (${userBookings.length})`;
  }

  // ===============================
  // 3. KHÔNG CÓ BOOKING NÀO
  // ===============================
  if (userBookings.length === 0) {
    bookingListEl.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #666;">
        <p>You have not booked any tours yet.</p>
        <a 
          href="#"
          class="btn-view-detail action-explore"
          style="display:inline-block; width:auto; margin-top:10px;"
        >
          Explore Tour now
        </a>
      </div>`;
    attachHandlers(bookingListEl);
    attachOtherToursHandlers();
    return;
  }

  // ===============================
  // 4. RENDER DANH SÁCH BOOKING
  // ===============================
  bookingListEl.innerHTML = "";

  userBookings
    .slice()
    .reverse()
    .forEach((booking) => {
      const html = `
        <div class="booking-card">
          
          <div class="booking-image">
            <img src="${booking.image}" alt="${booking.tourName}"
              onerror="this.src='./assets/images/tour/tour_1.webp'" />
          </div>

          <div class="booking-details">
            <h3 class="tour-title">${booking.tourName}</h3>

            <div class="detail-grid">
              <div class="detail-item">
                <i class="fa-solid fa-barcode"></i>
                <span>ID: <strong>#${booking.id}</strong></span>
              </div>

              <div class="detail-item">
                <i class="fa-regular fa-calendar"></i>
                <span>Date: <strong>${booking.bookingDate}</strong></span>
              </div>

              <div class="detail-item">
                <i class="fa-solid fa-plane-departure"></i>
                <span>Start: <strong>${formatDate(booking.date)}</strong></span>
              </div>

              <div class="detail-item">
                <i class="fa-solid fa-user-group"></i>
                <span>Member: <strong>${booking.guests.adults} Adults, ${booking.guests.kids} Childs</strong></span>
              </div>

              <div class="detail-item">
                <i class="fa-solid fa-star"></i>
                <span>Service: <strong>${formatService(booking.facility)}</strong></span>
              </div>
            </div>
          </div>

          <div class="booking-actions">
            <span class="status-badge ${getStatusClass(booking.status)}">
              ${booking.status}
            </span>

            <div class="total-price">$${booking.totalPrice.toFixed(2)}</div>

            <button 
              class="btn-view-detail action-view"
              data-id="${booking.id}">
              More Detail
            </button>
          </div>

        </div>
      `;
      bookingListEl.insertAdjacentHTML("beforeend", html);
    });

  attachHandlers(bookingListEl);

  // ⭐ gắn handler cho Other Tours
  attachOtherToursHandlers();
}

// ===============================
// CLICK HANDLERS – MAIN
// ===============================
function attachHandlers(bookingListEl) {
  bookingListEl.addEventListener("click", async (e) => {
    const exploreBtn = e.target.closest(".action-explore");
    const viewBtn = e.target.closest(".action-view");

    // ⭐ Explore now → Tour List
    if (exploreBtn) {
      e.preventDefault();

      if (window.loadSection) {
        await window.loadSection("main", "./pages/tour.html", "./tour.js", "Tours");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.location.href = "./pages/tour.html";
      }
      return;
    }

    // ⭐ More Detail → Tour Detail
    if (viewBtn) {
      e.preventDefault();

      const bookingId = viewBtn.dataset.id;
      sessionStorage.setItem("selectedBookingId", bookingId);

      if (window.loadSection) {
        await window.loadSection("main", "./pages/tourdetail.html", "./tourdetail.js", "TourDetail");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.location.href = "./pages/tourdetail.html";
      }
    }
  });
}

// ===============================
// ⭐⭐ OTHER TOURS HANDLER ⭐⭐
// ===============================

function attachOtherToursHandlers() {
  const links = document.querySelectorAll(".sidebar-tours .others-list a");

  if (!links.length) return;

  links.forEach((item) => {
    item.addEventListener("click", async (e) => {
      e.preventDefault();

      const img = item.querySelector("img")?.src || "";
      const title = item.querySelector("h4")?.innerText || "Tour Detail";
      const price = item.querySelector(".price")?.innerText || "";
      const location = item.querySelector(".bottom-row p:first-child")?.innerText || "";
      const duration = item.querySelector(".bottom-row p:last-child")?.innerText || "";

      // Lưu dữ liệu sang trang tourdetail
      sessionStorage.setItem(
        "selectedOtherTour",
        JSON.stringify({ img, title, price, location, duration })
      );

      console.log("➡ OTHER TOUR from bookings:", title);

      if (window.loadSection) {
        await window.loadSection(
          "main",
          "./pages/tourdetail.html",
          "./tourdetail.js",
          "TourDetail"
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.location.href = "./pages/tourdetail.html";
      }
    });
  });
}

// ===============================
// HELPERS
// ===============================

function getStatusClass(status) {
  if (status === "Success" || status === "Hoàn Thành") return "status-success";
  if (status === "Pending" || status === "Đang Xử Lý") return "status-pending";
  return "";
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}

function formatService(val) {
  const map = {
    meals: "Meals",
    pickup: "Pickup",
    guide: "Guide",
    insurance: "Insurance",
  };
  return map[val] || val;
}
