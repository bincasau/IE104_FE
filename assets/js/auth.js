document.addEventListener("DOMContentLoaded", () => {
  const REG_FORM = document.getElementById("register-form");
  const LOG_FORM = document.getElementById("login-form");
  const REG_MESSAGE = document.getElementById("reg-message");
  const LOG_MESSAGE = document.getElementById("login-message");
  const REG_SECTION = document.getElementById("register-section");
  const LOG_SECTION = document.getElementById("login-section");
  const SHOW_LOGIN_LINK = document.getElementById("show-login");
  const SHOW_REGISTER_LINK = document.getElementById("show-register");

  // Tên key để lưu danh sách người dùng trong LocalStorage
  const USERS_KEY = "demoUsers";
  const DEFAULT_AVATAR = "avatarDefault.wepb";

  // Hàm lấy danh sách người dùng từ LocalStorage
  const getUsers = () => {
    const usersJson = localStorage.getItem(USERS_KEY);
    try {
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (e) {
      console.error("Lỗi khi đọc LocalStorage:", e);
      return [];
    }
  };

  // Hàm lưu danh sách người dùng vào LocalStorage
  const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  // Hàm hiển thị thông báo
  const displayMessage = (element, message, type) => {
    element.textContent = message;
    // Sử dụng class form-message, success, error đã định nghĩa trong auth.css
    element.className = `form-message ${type}`;
  };

  // Xử lý chuyển đổi giữa form Đăng ký và Đăng nhập
  SHOW_LOGIN_LINK.addEventListener("click", (e) => {
    e.preventDefault();
    REG_SECTION.style.display = "none";
    LOG_SECTION.style.display = "block";
    LOG_MESSAGE.textContent = ""; // Xóa thông báo cũ
  });

  SHOW_REGISTER_LINK.addEventListener("click", (e) => {
    e.preventDefault();
    LOG_SECTION.style.display = "none";
    REG_SECTION.style.display = "block";
    REG_MESSAGE.textContent = ""; // Xóa thông báo cũ
  });

  /* --------------------------
       LOGIC ĐĂNG KÝ
       -------------------------- */
  REG_FORM.addEventListener("submit", (e) => {
    e.preventDefault();
    REG_MESSAGE.textContent = "";

    const fullName = document.getElementById("reg-fullname").value.trim();
    const username = document.getElementById("reg-username").value.trim();
    const password = document.getElementById("reg-password").value;
    const confirmPassword = document.getElementById(
      "reg-confirm-password"
    ).value;

    if (password !== confirmPassword) {
      displayMessage(
        REG_MESSAGE,
        "Lỗi: Mật khẩu và Nhập lại mật khẩu không khớp.",
        "error"
      );
      return;
    }

    const users = getUsers();

    // Kiểm tra trùng lặp tài khoản
    const userExists = users.some((user) => user.username === username);
    if (userExists) {
      displayMessage(
        REG_MESSAGE,
        `Lỗi: Tài khoản '${username}' đã tồn tại. Vui lòng chọn tên khác.`,
        "error"
      );
      return;
    }

    // Tạo người dùng mới và thêm vào danh sách
    const newUser = {
      fullName: fullName,
      username: username,
      password: password,
      avatar: DEFAULT_AVATAR,
    };

    users.push(newUser);
    saveUsers(users);

    displayMessage(
      REG_MESSAGE,
      "Đăng ký thành công! Bạn có thể đăng nhập ngay.",
      "success"
    );

    // Chuyển sang form đăng nhập sau 1.5 giây
    setTimeout(() => {
      document.getElementById("show-login").click();
      document.getElementById("login-username").value = username; // Điền sẵn username
      REG_FORM.reset(); // Xóa form đăng ký
    }, 1500);
  });

  /* --------------------------
       LOGIC ĐĂNG NHẬP
       -------------------------- */
  LOG_FORM.addEventListener("submit", (e) => {
    e.preventDefault();
    LOG_MESSAGE.textContent = "";

    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    const users = getUsers();

    // Tìm kiếm người dùng khớp với tài khoản và mật khẩu
    const foundUser = users.find(
      (user) => user.username === username && user.password === password
    );

    if (foundUser) {
      // Đăng nhập thành công
      displayMessage(
        LOG_MESSAGE,
        `Đăng nhập thành công! Chào mừng, ${foundUser.fullName}.`,
        "success"
      );

      // Lưu thông tin (chỉ cho demo)
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          fullName: foundUser.fullName,
          username: foundUser.username,
          avatar: foundUser.avatar,
        })
      );
      LOG_FORM.reset();
    } else {
      // Đăng nhập thất bại
      displayMessage(
        LOG_MESSAGE,
        "Lỗi: Tài khoản hoặc mật khẩu không đúng.",
        "error"
      );
    }
  });
});
