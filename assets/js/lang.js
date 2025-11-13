// /assets/js/lang.js
let I18N = {};
let CURRENT_LANG = "en";

export async function setLanguage(lang) {
  CURRENT_LANG = lang;
  // ✔ dùng root-relative để tránh sai path ở mọi trang
  const res = await fetch(`./lang/${lang}.json?v=${Date.now()}`);
  if (!res.ok) throw new Error("Language file not found");
  I18N = await res.json();

  applyTranslations(document);
  localStorage.setItem("lang", lang);

  // nếu đang ở trang có nội dung render động (blog/tour detail), báo cho nó re-render text
  window.dispatchEvent(new CustomEvent("retranslate"));
}

export function applyTranslations(root = document) {
  // text
  root.querySelectorAll("[data-key]").forEach((el) => {
    const k = el.getAttribute("data-key");
    if (I18N[k] != null) el.innerHTML = I18N[k]; // dùng innerHTML để giữ <br>
  });

  // placeholder
  root.querySelectorAll("[data-key-placeholder]").forEach((el) => {
    const k = el.getAttribute("data-key-placeholder");
    if (I18N[k] != null) el.setAttribute("placeholder", I18N[k]);
  });
}

// ✔ Tự dịch mọi phần tử mới được thêm vào DOM (SPA loadSection)
export function enableAutoTranslate() {
  if (window.__i18nObserver) return;
  window.__i18nObserver = new MutationObserver((muts) => {
    muts.forEach((m) => {
      m.addedNodes.forEach((n) => {
        if (n.nodeType === 1) applyTranslations(n);
      });
    });
  });
  window.__i18nObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
export { I18N };
