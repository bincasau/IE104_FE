// Biến toàn cục (module-level) để lưu trữ các bản dịch đã tải
let I18N = {};
// Biến toàn cục (module-level) để lưu trữ mã ngôn ngữ đang sử dụng
let CURRENT_LANG = "en";

/**
 * Tải và thiết lập ngôn ngữ mới cho trang.
 * @param {string} lang - Mã ngôn ngữ (ví dụ: "en", "vi").
 */
export async function setLanguage(lang) {
  try {
    CURRENT_LANG = lang;

    // ✔ Sử dụng đường dẫn tuyệt đối (root-relative) bắt đầu bằng "/"
    //   để đảm bảo luôn fetch đúng file /lang/..json dù đang ở bất kỳ trang con nào.
    //   (Sửa từ "./lang/" thành "/lang/")
    const res = await fetch(`./lang/${lang}.json?v=${Date.now()}`);

    if (!res.ok) {
      console.error(`Không thể tải file ngôn ngữ: ${lang}.json`);
      throw new Error("Language file not found");
    }

    I18N = await res.json();

    // Áp dụng bản dịch cho toàn bộ tài liệu
    applyTranslations(document);

    // Lưu ngôn ngữ được chọn vào localStorage
    localStorage.setItem("lang", lang);

    // ✔ Bắn (dispatch) một sự kiện tùy chỉnh tên là "retranslate".
    //   Các phần của trang có nội dung render động (như blog/tour detail)
    //   có thể lắng nghe sự kiện này để tự render lại nội dung với ngôn ngữ mới.
    window.dispatchEvent(new CustomEvent("retranslate"));
  } catch (error) {
    console.error("Lỗi khi thiết lập ngôn ngữ:", error);
  }
}

/**
 * Áp dụng các bản dịch trong I18N cho một cây DOM (hoặc toàn bộ document).
 * @param {Element|Document} root - Phần tử gốc (hoặc document) để quét và áp dụng bản dịch.
 */
export function applyTranslations(root = document) {
  // Đảm bảo `root` là một Element hoặc Document có thể query
  if (!root.querySelectorAll) return;

  // 1. Dịch các phần tử có [data-key] (dành cho nội dung text)
  root.querySelectorAll("[data-key]").forEach((element) => {
    const key = element.getAttribute("data-key");
    if (I18N[key] != null) {
      // Dùng innerHTML để giữ lại các thẻ con như <br>, <strong>
      element.innerHTML = I18N[key];
    }
  });

  // 2. Dịch các phần tử có [data-key-placeholder] (dành cho thuộc tính placeholder)
  root.querySelectorAll("[data-key-placeholder]").forEach((element) => {
    const key = element.getAttribute("data-key-placeholder");
    if (I18N[key] != null) {
      element.setAttribute("placeholder", I18N[key]);
    }
  });
}

/**
 * Kích hoạt MutationObserver để tự động dịch các phần tử
 * mới được thêm vào DOM (hữu ích cho các trang SPA - Single Page Application).
 */
export function enableAutoTranslate() {
  // Chỉ khởi tạo Observer một lần duy nhất
  if (window.__i18nObserver) return;

  // Tạo một Observer mới
  window.__i18nObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Duyệt qua tất cả các node mới được thêm vào
      mutation.addedNodes.forEach((node) => {
        // Chỉ xử lý các Element Node (nodeType === 1)
        // Bỏ qua các Text Node (nodeType === 3) hoặc Comment Node (nodeType === 8)
        if (node.nodeType === 1) {
          applyTranslations(node);
        }
      });
    });
  });

  // Bắt đầu theo dõi các thay đổi trên document.body và các cây con của nó
  window.__i18nObserver.observe(document.body, {
    childList: true, // Theo dõi các node con được thêm/xóa
    subtree: true, // Theo dõi thay đổi trong toàn bộ cây con
  });
}

/**
 * Trả về đối tượng chứa tất cả bản dịch hiện tại.
 */
export { I18N };
