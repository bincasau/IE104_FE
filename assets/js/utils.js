// ============================
// utils.js
// ============================

export async function loadSection(
  id,
  filePath,
  scriptPath = null,
  pageName = null
) {
  try {
    const container = document.getElementById(id);
    if (!container) {
      console.error(`Không tìm thấy phần tử #${id}`);
      return;
    }

    // --- 1. Cập nhật title ---
    if (pageName) {
      document.title = `Travel VN | ${pageName}`;
    }

    // --- 2. Load HTML ---
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Không thể tải ${filePath}`);
    const html = await response.text();
    container.innerHTML = html;

    // --- 3. Cập nhật trạng thái active cho nav ---
    const allLinks = document.querySelectorAll(".nav-links a");
    allLinks.forEach((link) => {
      const className = [...link.classList].find((c) => c !== "active");
      if (pageName && className?.toLowerCase() === pageName.toLowerCase()) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // --- 4. Cuộn mượt về đầu trang ---
    // ✅ Đặt ở đây để luôn cuộn kể cả khi không có scriptPath
    window.scrollTo({ top: 0, behavior: "smooth" });

    // --- 5. Load JS tương ứng (nếu có) ---
    if (scriptPath) {
      // Xóa module cũ nếu có (tránh cache)
      const oldScript = document.querySelector(`script[src^="${scriptPath}"]`);
      if (oldScript) oldScript.remove();

      try {
        const module = await import(`./${scriptPath}?v=${Date.now()}`);
        // Gọi initPage() nếu có
        if (typeof module.initPage === "function") {
          module.initPage();
        }
      } catch (err) {
        console.warn(
          `Không thể import hoặc chạy initPage từ ${scriptPath}`,
          err
        );
      }
    }

    return true; // để có thể await loadSection()
  } catch (error) {
    console.error("Lỗi loadSection:", error);
  }
}

// ============================
// Đặt favicon (logo trên tab)
// ============================
export function setFavicon(iconPath) {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = iconPath;
}
