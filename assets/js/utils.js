export async function loadSection(id, filePath, scriptPath = null) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Không thể tải ${filePath}`);
    const html = await response.text();
    document.getElementById(id).innerHTML = html;

    if (scriptPath) {
      const module = await import(scriptPath);
      if (typeof module.initPage === "function") {
        module.initPage();
      }
    }
  } catch (error) {
    console.error("Lỗi loadSection:", error);
  }
}
