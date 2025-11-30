export function initPage() {
  console.log("Profile page initialized.");
  const LOCAL_STORAGE_KEY = "demoUsers";
  const USER_ID = 0;

  let usersData = [];
  let currentUser = null;
  let selectedAvatarFileName = null; // Temporary selected avatar filename

  const availableAvatars = [
    "avatarDefault.webp",
    "avatar_user_1.webp",
    "avatar_user_2.webp",
    "avatar_user_3.webp",
    "avatar_user_4.webp",
    "avatar_user_5.webp",
    "avatar_user_6.webp",
    "avatar_user_7.webp",
  ];

  // === Language Setup ===
  // Bỏ định nghĩa const LANG cũ. Thay bằng hàm:
  function getCurrentLang() {
    return localStorage.getItem("lang") || "en"; // Luôn lấy giá trị mới nhất
  }

  const messages = {
    noUser: {
      en: "No user loaded. Please add data to Local Storage.",
      vi: "Không có người dùng. Vui lòng thêm dữ liệu vào Local Storage.",
      jp: "ユーザーがロードされていません。Local Storage にデータを追加してください。",
      cn: "未加载用户。请将数据添加到本地存储。",
    },
    fullNameUpdated: {
      en: (name) => `Full Name updated successfully to: ${name}`,
      vi: (name) => `Họ và tên đã được cập nhật thành: ${name}`,
      jp: (name) => `フルネームが更新されました: ${name}`,
      cn: (name) => `姓名已成功更新为: ${name}`,
    },
    invalidFullName: {
      en: "Invalid Full Name or no changes detected.",
      vi: "Họ và tên không hợp lệ hoặc không có thay đổi.",
      jp: "無効なフルネーム、または変更はありません。",
      cn: "姓名无效或未检测到更改。",
    },
    fillAllFields: {
      en: "Please fill in all fields.",
      vi: "Vui lòng điền đầy đủ tất cả các trường.",
      jp: "すべてのフィールドに入力してください。",
      cn: "请填写所有字段。",
    },
    oldPasswordIncorrect: {
      en: "Old password is incorrect.",
      vi: "Mật khẩu cũ không chính xác.",
      jp: "古いパスワードが正しくありません。",
      cn: "旧密码不正确。",
    },
    passwordMismatch: {
      en: "New password and confirmation do not match.",
      vi: "Mật khẩu mới và xác nhận mật khẩu không khớp.",
      jp: "新しいパスワードと確認が一致しません。",
      cn: "新密码与确认密码不匹配。",
    },
    passwordTooShort: {
      en: "New password must be at least 4 characters long.",
      vi: "Mật khẩu mới phải có ít nhất 4 ký tự.",
      jp: "新しいパスワードは4文字以上である必要があります。",
      cn: "新密码必须至少 4 个字符。",
    },
    passwordUpdated: {
      en: "Password updated successfully!",
      vi: "Đã đổi mật khẩu thành công!",
      jp: "パスワードが正常に更新されました！",
      cn: "密码更新成功！",
    },
    avatarUpdated: {
      en: "Avatar updated successfully!",
      vi: "Đã đổi Avatar thành công!",
      jp: "アバターが正常に更新されました！",
      cn: "头像已成功更新！",
    },
    noChangesDetected: {
      en: "No changes detected.",
      vi: "Không có thay đổi.",
      jp: "変更はありません。",
      cn: "未检测到更改。",
    },
    noUserMsg: {
      en: "⚠ No user available",
      vi: "⚠ Không có người dùng",
      jp: "⚠ ユーザーがいません",
      cn: "⚠ 无可用用户",
    },
  };

  // === Toast Notification Function ===
  function showToast(messageKey, type = "default", extra = null) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    // 🚀 Lấy ngôn ngữ mới nhất
    const currentLang = getCurrentLang();

    let text;
    if (typeof messages[messageKey][currentLang] === "function") {
      text = messages[messageKey][currentLang](extra);
    } else {
      text = messages[messageKey][currentLang];
    }

    toast.textContent = text;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      toast.addEventListener("transitionend", () => toast.remove());
    }, 3000);
  }

  // === 1. GET REQUIRED HTML ELEMENTS ===
  const displayFullname = document.getElementById("display-fullname");
  const displayUsername = document.getElementById("display-username");
  const profileAvatar = document.getElementById("profile-avatar");
  const avatarGallery = document.getElementById("avatar-gallery");
  const btnSaveSelectedAvatar = document.getElementById(
    "btn-save-selected-avatar"
  );
  const modalFullname = document.getElementById("modal-fullname");
  const modalPassword = document.getElementById("modal-password");
  const modalAvatar = document.getElementById("modal-avatar");
  const closeBtns = document.querySelectorAll(".modal .close-btn");
  const btnSaveFullname = document.getElementById("btn-save-fullname");
  const btnSavePassword = document.getElementById("btn-save-password");
  const inputNewFullname = document.getElementById("input-new-fullname");
  const inputOldPassword = document.getElementById("input-old-password");
  const inputNewPassword = document.getElementById("input-new-password");
  const inputConfirmPassword = document.getElementById(
    "input-confirm-password"
  );

  // Render avatar gallery
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
        document
          .querySelectorAll(".gallery-item")
          .forEach((item) => item.classList.remove("active"));
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

  // Update UI display
  function updateDisplay() {
    // 🚀 Lấy ngôn ngữ mới nhất
    const currentLang = getCurrentLang();

    if (currentUser) {
      displayFullname.textContent = currentUser.fullName;
      displayUsername.textContent = currentUser.username;
      profileAvatar.style.opacity = "1";
      profileAvatar.src = currentUser.avatar
        ? "./assets/images/users/" + currentUser.avatar
        : "./assets/images/users/avatarDefault.webp";
      profileAvatar.onerror = () =>
        (profileAvatar.src = "./assets/images/users/avatarDefault.webp");
    } else {
      // Sử dụng currentLang
      displayFullname.textContent = messages.noUserMsg[currentLang];
      displayUsername.textContent = messages.noUserMsg[currentLang];
      profileAvatar.src = "./assets/images/users/avatarDefault.webp";
      profileAvatar.style.opacity = "0.5";
      console.warn("No user loaded from Local Storage.");
    }
  }

  // Sửa hàm saveUserData: Đảm bảo lưu cả "currentUser" và "demoUsers"
  function saveUserData() {
    // 1. Lưu thông tin người dùng hiện tại vào key "currentUser" (để load lần sau)
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }

    // 2. Lưu mảng đầy đủ vào key "demoUsers" (để logic đăng nhập/đăng ký vẫn hoạt động chính xác)
    // Cần đảm bảo usersData đã được cập nhật trước khi gọi hàm này
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(usersData));
    console.log(
      "User data updated in Local Storage: currentUser and demoUsers."
    );
  }

  // Sửa hàm loadUserData: Đảm bảo load mảng demoUsers trước, sau đó tìm user hiện tại
  // Hàm này được sửa lại để lấy được usersData (mảng) VÀ currentUser (object)
  function loadUserData() {
    const storedUsers = localStorage.getItem(LOCAL_STORAGE_KEY);
    const storedCurrentUser = localStorage.getItem("currentUser");

    if (storedUsers) {
      try {
        usersData = JSON.parse(storedUsers);
      } catch (e) {
        console.error("Error parsing Local Storage data (demoUsers):", e);
        usersData = [];
      }
    }

    if (storedCurrentUser) {
      try {
        currentUser = JSON.parse(storedCurrentUser);

        // Cần đảm bảo currentUser trong usersData được cập nhật
        if (currentUser) {
          const userIndex = usersData.findIndex(
            (u) => u.username === currentUser.username
          );
          if (userIndex !== -1) {
            // Đặt currentUser vào vị trí 0 của mảng usersData (logic cũ)
            // HOẶC tìm và cập nhật user trong mảng usersData
            usersData[userIndex] = currentUser; // Cập nhật user trong mảng usersData
          } else {
            // Nếu user không có trong demoUsers (có thể chưa đăng ký),
            // coi như không có user hiện tại hoặc thêm vào mảng.
            // Ta sẽ dựa vào storedCurrentUser để hiển thị.
            // Để giữ nguyên logic cũ usersData[USER_ID] = currentUser;
            // Nhưng vì không có user id, ta chỉ lấy user đầu tiên nếu tồn tại.
            // Giữ nguyên logic đơn giản: nếu tìm thấy storedCurrentUser, đó là user hiện tại.
            // Logic cập nhật sẽ sử dụng username để tìm và sửa trong usersData.
          }
        }
      } catch (e) {
        console.error("Error parsing Local Storage data (currentUser):", e);
        currentUser = null;
      }
    }

    // Nếu không có storedCurrentUser nhưng có usersData, có thể đặt currentUser = usersData[0]
    // Tuy nhiên, ta sẽ chỉ dựa vào storedCurrentUser (được auth.js thiết lập) để xác định.

    updateDisplay();
  }

  function openModal(modalElement) {
    if (!currentUser) {
      showToast("noUser", "error");
      return;
    }
    if (modalElement.id === "modal-avatar") renderAvatarGallery();
    modalElement.style.display = "block";
  }

  function closeModal(modalElement) {
    modalElement.style.display = "none";
    if (modalElement.id === "modal-avatar") selectedAvatarFileName = null;
  }

  document
    .getElementById("btn-open-avatar-modal")
    .addEventListener("click", () => openModal(modalAvatar));
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
      if (currentUser) inputNewFullname.value = currentUser.fullName;
      openModal(modalFullname);
    });

  closeBtns.forEach((btn) =>
    btn.addEventListener("click", (e) => closeModal(e.target.closest(".modal")))
  );
  window.addEventListener("click", (e) => {
    if (e.target === modalFullname) closeModal(modalFullname);
    if (e.target === modalPassword) closeModal(modalPassword);
    if (e.target === modalAvatar) closeModal(modalAvatar);
  });

  // === SAVE HANDLERS ===
  btnSaveFullname.addEventListener("click", () => {
    if (!currentUser) return;
    const newFullname = inputNewFullname.value.trim();
    if (newFullname && newFullname !== currentUser.fullName) {
      currentUser.fullName = newFullname;

      // Cập nhật usersData trước khi lưu
      const userIndex = usersData.findIndex(
        (u) => u.username === currentUser.username
      );
      if (userIndex !== -1) {
        usersData[userIndex] = currentUser;
      }

      saveUserData(); // Sẽ lưu cả currentUser và usersData
      updateDisplay();
      showToast("fullNameUpdated", "success", newFullname);
      closeModal(modalFullname);
    } else {
      showToast("invalidFullName", "error");
    }
  });

  btnSavePassword.addEventListener("click", () => {
    if (!currentUser) return;
    const oldPass = inputOldPassword.value;
    const newPass = inputNewPassword.value;
    const confirmPass = inputConfirmPassword.value;
    if (!oldPass || !newPass || !confirmPass)
      return showToast("fillAllFields", "error");
    if (oldPass !== currentUser.password)
      return showToast("oldPasswordIncorrect", "error");
    if (newPass !== confirmPass) return showToast("passwordMismatch", "error");
    if (newPass.length < 4) return showToast("passwordTooShort", "error");
    currentUser.password = newPass;

    // Cập nhật usersData trước khi lưu
    const userIndex = usersData.findIndex(
      (u) => u.username === currentUser.username
    );
    if (userIndex !== -1) {
      usersData[userIndex] = currentUser;
    }

    saveUserData(); // Sẽ lưu cả currentUser và usersData
    showToast("passwordUpdated", "success");
    closeModal(modalPassword);
  });

  btnSaveSelectedAvatar.addEventListener("click", () => {
    if (!currentUser || !selectedAvatarFileName) return;
    if (currentUser.avatar !== selectedAvatarFileName) {
      currentUser.avatar = selectedAvatarFileName;

      // Cập nhật usersData trước khi lưu
      const userIndex = usersData.findIndex(
        (u) => u.username === currentUser.username
      );
      if (userIndex !== -1) {
        usersData[userIndex] = currentUser;
      }

      saveUserData(); // Sẽ lưu cả currentUser và usersData
      updateDisplay();
      showToast("avatarUpdated", "success");
    } else showToast("noChangesDetected");
    closeModal(modalAvatar);
    selectedAvatarFileName = null;
  });

  loadUserData();
}
