export async function loadSection(id, filePath, scriptPath = null) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Không thể tải ${filePath}`);
    const html = await response.text();
    document.getElementById(id).innerHTML = html;

    if (scriptPath) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = scriptPath;
      document.body.appendChild(script);
    }
  } catch (error) {
    console.error(error);
  }
}

// Gọi các component
loadSection("header", "components/header.html");
loadSection("content", "pages/home.html", "assets/js/home.js");
loadSection("footer", "components/footer.html");

window.addEventListener("scroll", () => {
  const header = document.querySelector(".header");
  if (!header) return;
  if (window.scrollY > 50) header.classList.add("scrolled");
  else header.classList.remove("scrolled");
});
