export function initPage() {
  console.log("Profile page initialized.");
  // document.addEventListener("DOMContentLoaded", () => {
  // === 0. THIẾT LẬP CƠ BẢN VÀ DỮ LIỆU SẴN CÓ ===
  const LOCAL_STORAGE_KEY = "demoUsers";
  const USER_ID = 0;

  let usersData = [];
  let currentUser = null;
  let selectedAvatarFileName = null; // Biến để lưu tên ảnh được chọn tạm thời

  // Danh sách tên các file ảnh CÓ SẴN TRONG THƯ MỤC ./assets/images/users/
  const availableAvatars = [
    "avatarDefault.webp", // Ảnh mặc định
    "avatar_user_1.webp",
    "avatar_user_2.webp",
    "avatar_user_3.webp",
    "avatar_user_4.webp",
    "avatar_user_5.webp",
    "avatar_user_6.webp",
    "avatar_user_7.webp",
    // THÊM CÁC TÊN FILE ẢNH KHÁC CỦA BẠN VÀO ĐÂY
  ];

  // === Hàm Toast Notification (MỚI) ===
  function showToast(message, type = "default") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Hiển thị toast
    setTimeout(() => {
      toast.classList.add("show");
    }, 10);

    // Ẩn toast sau 3 giây
    setTimeout(() => {
      toast.classList.remove("show");
      // Xóa khỏi DOM sau khi animation hoàn tất
      toast.addEventListener("transitionend", () => {
        toast.remove();
      });
    }, 3000);
  }

  // === 1. LẤY CÁC PHẦN TỬ HTML CẦN THIẾT ===

  // Hiển thị
  const displayFullname = document.getElementById("display-fullname");
  const displayUsername = document.getElementById("display-username");
  const profileAvatar = document.getElementById("profile-avatar");

  // Gallery Elements
  const avatarGallery = document.getElementById("avatar-gallery");
  const btnSaveSelectedAvatar = document.getElementById(
    "btn-save-selected-avatar"
  );

  // Modal và Input fields
  const modalFullname = document.getElementById("modal-fullname");
  const modalPassword = document.getElementById("modal-password");
  const modalAvatar = document.getElementById("modal-avatar");
  const closeBtns = document.querySelectorAll(".modal .close-btn");

  // Nút Lưu
  const btnSaveFullname = document.getElementById("btn-save-fullname");
  const btnSavePassword = document.getElementById("btn-save-password");

  // Input fields
  const inputNewFullname = document.getElementById("input-new-fullname");
  const inputOldPassword = document.getElementById("input-old-password");
  const inputNewPassword = document.getElementById("input-new-password");
  const inputConfirmPassword = document.getElementById(
    "input-confirm-password"
  );

  // Hàm tạo Gallery
  function renderAvatarGallery() {
    avatarGallery.innerHTML = "";
    btnSaveSelectedAvatar.disabled = true;

    availableAvatars.forEach((fileName) => {
      const imgContainer = document.createElement("div");
      imgContainer.className = "gallery-item";
      imgContainer.setAttribute("data-filename", fileName);

      const img = document.createElement("img");
      img.src = "./assets/images/users/" + fileName;
      img.alt = fileName;

      imgContainer.appendChild(img);

      imgContainer.addEventListener("click", () => {
        document.querySelectorAll(".gallery-item").forEach((item) => {
          item.classList.remove("active");
        });

        imgContainer.classList.add("active");
        selectedAvatarFileName = fileName;
        btnSaveSelectedAvatar.disabled = false;
      });

      avatarGallery.appendChild(imgContainer);

      if (currentUser && currentUser.avatar === fileName) {
        imgContainer.classList.add("active");
        selectedAvatarFileName = fileName;
        btnSaveSelectedAvatar.disabled = false;
      }
    });
  }

  // Hàm Cập nhật Hiển thị trên giao diện
  function updateDisplay() {
    if (currentUser) {
      displayFullname.textContent = currentUser.fullName;
      displayUsername.textContent = currentUser.username;
      profileAvatar.style.opacity = "1";

      if (currentUser.avatar) {
        profileAvatar.src = "./assets/images/users/" + currentUser.avatar;
      } else {
        profileAvatar.src = "./assets/images/users/avatarDefault.webp";
      }

      profileAvatar.onerror = () => {
        profileAvatar.src = "./assets/images/users/avatarDefault.webp";
      };
    } else {
      const NO_USER_MSG = "⚠ Không có người dùng";
      displayFullname.textContent = NO_USER_MSG;
      displayUsername.textContent = NO_USER_MSG;
      profileAvatar.src = "./assets/images/users/avatarDefault.webp";
      profileAvatar.style.opacity = "0.5";
      console.warn("Không có người dùng được tải từ Local Storage.");
    }
  }

  // Hàm Lưu Dữ liệu vào Local Storage
  function saveUserData() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(usersData));
    console.log("Dữ liệu người dùng đã được lưu vào Local Storage.");
  }

  // Hàm Tải Dữ liệu từ Local Storage
  function loadUserData() {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (storedData) {
      try {
        usersData = JSON.parse(storedData);
      } catch (e) {
        console.error("Lỗi khi phân tích dữ liệu từ Local Storage:", e);
        usersData = [];
      }
    }

    if (usersData.length > USER_ID) {
      currentUser = usersData[USER_ID];
    } else {
      currentUser = null;
    }

    updateDisplay();
  }

  // Hàm mở modal (Sử dụng Toast)
  function openModal(modalElement) {
    if (!currentUser) {
      showToast(
        "Không có người dùng được tải. Vui lòng thêm dữ liệu vào Local Storage.",
        "error"
      );
      return;
    }

    if (modalElement.id === "modal-avatar") {
      renderAvatarGallery();
    }
    modalElement.style.display = "block";
  }

  // Hàm đóng modal
  function closeModal(modalElement) {
    modalElement.style.display = "none";
    if (modalElement.id === "modal-avatar") {
      selectedAvatarFileName = null;
    }
  }

  // === 2. XỬ LÝ MỞ/ĐÓNG MODAL CHUNG ===

  document
    .getElementById("btn-open-avatar-modal")
    .addEventListener("click", () => {
      openModal(modalAvatar);
    });

  document
    .getElementById("btn-open-password-modal")
    .addEventListener("click", () => {
      if (currentUser) {
        inputOldPassword.value = "";
        inputNewPassword.value = "";
        inputConfirmPassword.value = "";
      }
      openModal(modalPassword);
    });

  document
    .querySelector('.btn-edit[data-target="fullname"]')
    .addEventListener("click", () => {
      if (currentUser) {
        inputNewFullname.value = currentUser.fullName;
      }
      openModal(modalFullname);
    });

  // Xử lý đóng modal
  closeBtns.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      closeModal(event.target.closest(".modal"));
    });
  });
  window.addEventListener("click", (event) => {
    if (event.target === modalFullname) closeModal(modalFullname);
    if (event.target === modalPassword) closeModal(modalPassword);
    if (event.target === modalAvatar) closeModal(modalAvatar);
  });

  // === 3. XỬ LÝ CHỨC NĂNG LƯU (Sử dụng Toast) ===

  // Xử lý Lưu Full Name
  btnSaveFullname.addEventListener("click", () => {
    if (!currentUser) return;
    const newFullname = inputNewFullname.value.trim();
    if (newFullname && newFullname !== currentUser.fullName) {
      currentUser.fullName = newFullname;
      usersData[USER_ID] = currentUser;
      saveUserData();
      updateDisplay();
      showToast(`Đã đổi tên thành công thành: ${newFullname}`, "success");
      closeModal(modalFullname);
    } else {
      showToast("Họ và Tên không hợp lệ hoặc không có thay đổi.", "error");
    }
  });

  // Xử lý Lưu Mật Khẩu
  btnSavePassword.addEventListener("click", () => {
    if (!currentUser) return;
    const oldPass = inputOldPassword.value;
    const newPass = inputNewPassword.value;
    const confirmPass = inputConfirmPassword.value;

    if (!oldPass || !newPass || !confirmPass) {
      return showToast("Vui lòng điền đầy đủ tất cả các trường.", "error");
    }
    if (oldPass !== currentUser.password) {
      return showToast("Mật khẩu cũ không chính xác.", "error");
    }
    if (newPass !== confirmPass) {
      return showToast(
        "Mật khẩu mới và xác nhận mật khẩu không khớp.",
        "error"
      );
    }
    if (newPass.length < 4) {
      return showToast("Mật khẩu mới phải có ít nhất 4 ký tự.", "error");
    }

    currentUser.password = newPass;
    usersData[USER_ID] = currentUser;
    saveUserData();
    showToast("Đã đổi mật khẩu thành công!", "success");
    closeModal(modalPassword);
  });

  // Xử lý Lưu Avatar đã chọn
  btnSaveSelectedAvatar.addEventListener("click", () => {
    if (!currentUser || !selectedAvatarFileName) return;

    if (currentUser.avatar !== selectedAvatarFileName) {
      currentUser.avatar = selectedAvatarFileName;
      usersData[USER_ID] = currentUser;
      saveUserData();

      updateDisplay();
      showToast(
        `Đã đổi Avatar thành công thành: ${selectedAvatarFileName}`,
        "success"
      );
    } else {
      showToast(`Không có thay đổi, Avatar vẫn là ${selectedAvatarFileName}.`);
    }

    closeModal(modalAvatar);
    selectedAvatarFileName = null; // Reset
  });

  // Bắt đầu tải dữ liệu
  loadUserData();
  // });
}
