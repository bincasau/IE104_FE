// auth.js

/* ===== MULTI LANGUAGE SYSTEM ===== */
const MSG = {
  wrongLogin: {
    en: "Incorrect username or password.",
    vi: "Sai tài khoản hoặc mật khẩu.",
    jp: "ユーザー名またはパスワードが間違っています。",
    cn: "用户名或密码错误。",
  },
  loginSuccess: {
    en: (name) => `Login successful! Welcome ${name}.`,
    vi: (name) => `Đăng nhập thành công! Chào ${name}.`,
    jp: (name) => `ログイン成功！ようこそ ${name} さん。`,
    cn: (name) => `登录成功！欢迎 ${name}。`,
  },
  passwordMismatch: {
    en: "Passwords do not match.",
    vi: "Mật khẩu không khớp.",
    jp: "パスワードが一致しません。",
    cn: "密码不匹配。",
  },
  userExists: {
    en: (u) => `User '${u}' already exists.`,
    vi: (u) => `Tài khoản '${u}' đã tồn tại.`,
    jp: (u) => `ユーザー '${u}' は既に存在します。`,
    cn: (u) => `用户 '${u}' 已存在。`,
  },
  registerSuccess: {
    en: "Registration successful!",
    vi: "Đăng ký thành công!",
    jp: "登録が成功しました！",
    cn: "注册成功！",
  },
};

// lấy language trong localStorage (default EN)
//  SỬA ĐỔI: Hàm này phải đọc từ localStorage để đồng bộ với cửa sổ cha
function getLang() {
  return localStorage.getItem("lang") || "en";
}

function getMsg(key, param) {
  const lang = getLang();
  const item = MSG[key][lang];
  return typeof item === "function" ? item(param) : item;
}

/* ===== MAIN CODE ===== */

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

    // Đảm bảo message box được làm sạch khi chuyển mode
    LOG_MESSAGE.textContent = "";
    REG_MESSAGE.textContent = "";
    LOG_MESSAGE.className = "form-message";
    REG_MESSAGE.className = "form-message";

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
      displayMessage(REG_MESSAGE, getMsg("passwordMismatch"), "error");
      return;
    }

    const users = getUsers();

    if (users.some((u) => u.username === username)) {
      displayMessage(REG_MESSAGE, getMsg("userExists", username), "error");
      return;
    }

    users.push({
      fullName,
      username,
      password,
      avatar: DEFAULT_AVATAR,
    });

    saveUsers(users);

    displayMessage(REG_MESSAGE, getMsg("registerSuccess"), "success");

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
      displayMessage(LOG_MESSAGE, getMsg("wrongLogin"), "error");
      return;
    }

    displayMessage(
      LOG_MESSAGE,
      getMsg("loginSuccess", user.fullName),
      "success"
    );

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentUser", JSON.stringify(user));

    LOG_FORM.reset();
    window.parent?.postMessage({ type: "auth-login-success" }, "*");
  });

  //  SỬA ĐỔI: Thêm listener để reset message box khi ngôn ngữ thay đổi trong cửa sổ cha
  window.addEventListener("storage", (event) => {
    if (event.key === "lang") {
      setMode(LOG_SECTION.classList.contains("hidden") ? "register" : "login");
    }
  });

  // Reset từ parent
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
