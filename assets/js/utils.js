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

    // --- 3. Cập nhật trạng thái active cho nav (chỉ 1 lần, KHÔNG lặp trùng) ---
    const allLinks = document.querySelectorAll(".nav-links a");

    // Nhóm trang: menu chính -> các trang con cùng nhóm
    const pageGroups = {
      Home: ["Home"],
      About: ["About"],
      Tours: ["Tours", "TourDetail"],
      Blog: ["Blog"], // có thể thêm sau
      Contact: ["Contact"],
    };

    const normalize = (s) => String(s || "").toLowerCase().replace(/\s+/g, "");

    allLinks.forEach((link) => {
      const className = [...link.classList].find((c) => c !== "active");
      const isActive =
        pageName &&
        Object.entries(pageGroups).some(([main, group]) => {
          const inGroup = group.some((g) => normalize(g) === normalize(pageName));
          return inGroup && normalize(className) === normalize(main);
        });

      link.classList.toggle("active", !!isActive);
    });

    // --- 4. Cuộn mượt về đầu trang ---
    window.scrollTo({ top: 0, behavior: "smooth" });

    // --- 5. Load JS tương ứng (nếu có) ---
    if (scriptPath) {
      // Xóa module cũ nếu có (tránh cache)
      const oldScript = document.querySelector(`script[src^="${scriptPath}"]`);
      if (oldScript) oldScript.remove();

      try {
        // IMPORTANT: scriptPath đã là dạng "./tour.js" -> import(`./${scriptPath}`) => "././tour.js" vẫn OK
        const module = await import(`./${scriptPath}?v=${Date.now()}`);
        if (typeof module.initPage === "function") {
          module.initPage();
        }
      } catch (err) {
        console.warn(`Không thể import hoặc chạy initPage từ ${scriptPath}`, err);
      }
    }

    return true;
  } catch (error) {
    console.error("Lỗi loadSection:", error);
  }
}

window.loadSection = loadSection;

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
