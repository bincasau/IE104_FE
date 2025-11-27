// FILE: assets/js/bookings.js

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
          <h3>Vui lòng đăng nhập để xem lịch sử đặt tour.</h3>
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
        <p>Bạn chưa đặt tour nào.</p>
        <a href="#/tour" class="btn-view-detail" style="display:inline-block; width:auto; margin-top:10px;">Khám phá Tour ngay</a>
      </div>`;
    return;
  }

  // Xóa nội dung tĩnh cũ (nếu có)
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
              <span>Mã: <strong>#${booking.id}</strong></span>
            </div>
            <div class="detail-item">
              <i class="fa-regular fa-calendar"></i>
              <span>Ngày đặt: <strong>${booking.bookingDate}</strong></span>
            </div>
            <div class="detail-item">
              <i class="fa-solid fa-plane-departure"></i>
              <span>Khởi hành: <strong>${formatDate(booking.date)}</strong></span>
            </div>
            <div class="detail-item">
              <i class="fa-solid fa-user-group"></i>
              <span>Khách: <strong>${booking.guests.adults} Lớn, ${booking.guests.kids} Bé</strong></span>
            </div>
             <div class="detail-item">
              <i class="fa-solid fa-star"></i>
              <span>Dịch vụ: <strong>${formatService(booking.facility)}</strong></span>
            </div>
          </div>
        </div>
        <div class="booking-actions">
          <span class="status-badge ${getStatusClass(booking.status)}">${booking.status}</span>
          <div class="total-price">$${booking.totalPrice.toFixed(2)}</div>
          <button class="btn-view-detail" onclick="alert('Tính năng chi tiết đang phát triển!')">Xem Chi Tiết</button>
        </div>
      </div>
    `;
    bookingListEl.insertAdjacentHTML('beforeend', html);
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
  // Giả sử dateString dạng YYYY-MM-DD từ input date
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
}

function formatService(val) {
    const map = {
        'meals': 'Bữa ăn',
        'pickup': 'Đưa đón',
        'guide': 'HDV Riêng',
        'insurance': 'Bảo hiểm'
    };
    return map[val] || val;
}