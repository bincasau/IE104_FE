

export function initPage() {
  console.log("✅ Bookings page initialized");

  const bookingListEl = document.querySelector(".booking-list");
  const historyHeading = document.querySelector(".history-heading");

  // 1. Kiểm tra đăng nhập
  const currentUserStr = localStorage.getItem("currentUser");
  
  if (!currentUserStr) {
    if (bookingListEl) {
      bookingListEl.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <h3>Please log in to view tour booking history.</h3>
        </div>`;
    }
    return;
  }

  const currentUser = JSON.parse(currentUserStr);

  // 2. Lấy dữ liệu từ LocalStorage
  const allBookings = JSON.parse(localStorage.getItem("bookings")) || [];

  // 3. Lọc tour của người dùng hiện tại
  const userBookings = allBookings.filter(b => b.userId === currentUser.username);

  // Cập nhật tiêu đề (Optional)
  if (historyHeading) {
    historyHeading.innerHTML = `Your tours (${userBookings.length})`;
  }

  // 4. Render ra HTML
  if (userBookings.length === 0) {
    bookingListEl.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #666;">
        <p>You have not booked any tours yet.</p>
        <a href="#/tour" class="btn-view-detail" style="display:inline-block; width:auto; margin-top:10px;"> Explore Tour now</a>
      </div>`;
    return;
  }

  // Xóa nội dung tĩnh cũ 
  bookingListEl.innerHTML = ""; 

  // Đảo ngược mảng để tour mới nhất lên đầu
  userBookings.reverse().forEach(booking => {
    const html = `
      <div class="booking-card">
        <div class="booking-image">
          <img src="${booking.image}" alt="${booking.tourName}" onerror="this.src='./assets/images/tour/tour_1.webp'" />
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
              <span> Service: <strong>${formatService(booking.facility)}</strong></span>
            </div>
          </div>
        </div>
        <div class="booking-actions">
          <span class="status-badge ${getStatusClass(booking.status)}">${booking.status}</span>
          <div class="total-price">$${booking.totalPrice.toFixed(2)}</div>
          <button class="btn-view-detail action-view">More Deatil</button>
        </div>
      </div>
    `;
    bookingListEl.insertAdjacentHTML('beforeend', html);
  });

bookingListEl.addEventListener('click', async (e) => {
    if (e.target.classList.contains('action-view')) {
        console.log("Chuyển hướng về trang Tour Detail...");

        // Gọi hàm loadSection để chuyển trang 
        if (typeof window.loadSection === 'function') {
            await window.loadSection(
                "content", 
                "./pages/tourdetail.html", 
                "./tourdetail.js", 
                "TourDetail"
            );
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            // Fallback nếu không phải SPA
            window.location.href = "tourdetail.html";
        }
    }
  });

}



// Helpers
function getStatusClass(status) {
  if (status === 'Success' || status === 'Hoàn Thành') return 'status-success';
  if (status === 'Pending' || status === 'Đang Xử Lý') return 'status-pending';
  return '';
}

function formatDate(dateString) {
  if(!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
}

function formatService(val) {
    const map = {
        'meals': 'Meals',
        'pickup': 'Pickup',
        'guide': 'Guide',
        'insurance': 'Insurance'
    };
    return map[val] || val;
}