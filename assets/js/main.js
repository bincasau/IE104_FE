// main.js
import { loadSection } from "./utils.js";

// Load các phần cố định
loadSection("header", "components/header.html");
const headerModule = await import("./header.js");
headerModule.initHeader();
loadSection("content", "pages/home.html");
const homeModule = await import("./home.js");
homeModule.initPage();
loadSection("footer", "components/footer.html");
