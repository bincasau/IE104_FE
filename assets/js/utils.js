// utils.js
export async function loadSection(id, filePath, scriptPath = null) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Không thể tải ${filePath}`);
    const html = await response.text();
    document.getElementById(id).innerHTML = html;
    if (scriptPath) {
      const oldScript = document.querySelector(`script[src^="${scriptPath}"]`);
      if (oldScript) oldScript.remove();

      const script = document.createElement("script");
      script.type = "module";
      // script.src = `${scriptPath}?v=${Date.now()}`; // ép reload mỗi lần
      document.body.appendChild(script);
    }
  } catch (error) {
    console.error("Lỗi loadSection:", error);
  }
}
