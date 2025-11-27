function initAuthPopup() {
  const REG_FORM = document.getElementById("register-form");
  const LOG_FORM = document.getElementById("login-form");
  const REG_MESSAGE = document.getElementById("reg-message");
  const LOG_MESSAGE = document.getElementById("login-message");
  const REG_SECTION = document.getElementById("register-section");
  const LOG_SECTION = document.getElementById("login-section");

  const USERS_KEY = "demoUsers";
  const DEFAULT_AVATAR = "avatarDefault.webp";

  const setMode = (mode) => {
    const isLogin = mode === "login";
    LOG_SECTION.classList.toggle("hidden", !isLogin);
    REG_SECTION.classList.toggle("hidden", isLogin);
    LOG_MESSAGE.textContent = "";
    REG_MESSAGE.textContent = "";
    REG_FORM.reset();
    LOG_FORM.reset();
  };

  const getUsers = () => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch {
      return [];
    }
  };

  const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const displayMessage = (el, msg, type) => {
    el.textContent = msg;
    el.className = `form-message ${type}`;
  };

  /* ===== TOGGLE LOGIN / REGISTER ===== */
  document.querySelectorAll("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      setMode(btn.dataset.toggle === "register" ? "register" : "login");
    });
  });

  /* ===== REGISTER ===== */
  REG_FORM.addEventListener("submit", (e) => {
    e.preventDefault();

    const fullName = document.getElementById("reg-fullname").value.trim();
    const username = document.getElementById("reg-username").value.trim();
    const password = document.getElementById("reg-password").value;
    const confirmPassword = document.getElementById(
      "reg-confirm-password"
    ).value;

    if (password !== confirmPassword) {
      displayMessage(REG_MESSAGE, "Mật khẩu không khớp.", "error");
      return;
    }

    const users = getUsers();

    if (users.some((u) => u.username === username)) {
      displayMessage(
        REG_MESSAGE,
        `Tài khoản '${username}' đã tồn tại.`,
        "error"
      );
      return;
    }

    users.push({
      fullName,
      username,
      password,
      avatar: DEFAULT_AVATAR,
    });

    saveUsers(users);

    displayMessage(REG_MESSAGE, "Đăng ký thành công!", "success");

    setTimeout(() => {
      setMode("login");
      document.getElementById("login-username").value = username;
    }, 1500);
  });

  /* ===== LOGIN ===== */
  LOG_FORM.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    const users = getUsers();
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      displayMessage(LOG_MESSAGE, "Sai tài khoản hoặc mật khẩu.", "error");
      return;
    }

    displayMessage(
      LOG_MESSAGE,
      `Đăng nhập thành công! Chào ${user.fullName}.`,
      "success"
    );

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentUser", JSON.stringify(user));

    LOG_FORM.reset();
    window.parent?.postMessage({ type: "auth-login-success" }, "*");
  });

  // Nhận yêu cầu reset từ parent để luôn về màn đăng nhập sạch
  window.addEventListener("message", (event) => {
    if (!event.data || typeof event.data !== "object") return;
    if (event.data.type === "auth-reset") {
      setMode("login");
    }
  });

  // Default view
  setMode("login");
}

window.initAuthPopup = initAuthPopup;
