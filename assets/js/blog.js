// ---- Config ----
const PAGE_SIZE = 5; // số bài/ trang
const DATA_URL  = "../data/blogs.json"; // nhớ tạo file này

// ---- State ----
let allBlogs = [];
let filteredBlogs = [];
let currentPage = 1;
let activeTag = null;

// ---- Helpers ----
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function paginate(arr, page = 1, size = PAGE_SIZE) {
  const start = (page - 1) * size;
  return arr.slice(start, start + size);
}

function uniq(arr) { return Array.from(new Set(arr)); }

// ---- Renderers ----
function renderPopular(blogs) {
  const popEl = $("#popular");
  const picks = blogs.slice(0, 4); // 4 bài bất kỳ đầu danh sách (bạn có thể sort theo view)
  popEl.innerHTML = picks.map(b => `
    <a class="item" href="#${b.slug}" data-slug="${b.slug}">
      <img src="${b.image}" alt="${b.title}">
      <div>
        <div class="meta">${b.category}</div>
        <div class="title">${b.title}</div>
      </div>
    </a>
  `).join("");
}

function renderTags(blogs) {
  const tagsEl = $("#tags");
  const tags = uniq(blogs.map(b => b.category)); // dùng category làm tag chính
  tagsEl.innerHTML = tags.map(t => `<button class="tag${t===activeTag?' active':''}" data-tag="${t}">${t}</button>`).join("");
}

function cardTemplate(b, isBig=false) {
  return `
    <article class="card ${isBig ? 'big' : ''}" data-slug="${b.slug}" tabindex="0">
      <img class="cover" src="${b.image}" alt="${b.title}">
      <div class="body">
        <div class="category">${b.category}</div>
        <h3 class="title">${b.title}</h3>
        <div class="author">
          <img class="avatar" src="${b.avatar}" alt="${b.author}">
          <span>${b.author} · ${b.date}</span>
        </div>
      </div>
    </article>
  `;
}

function renderGrid() {
  const holder = $("#grid");
  const list = paginate(filteredBlogs, currentPage, PAGE_SIZE);
  // tấm lớn đầu tiên (giống mock)
  holder.innerHTML = list.map((b, idx) => cardTemplate(b, idx === 0)).join("");


  // attach click → (Bạn có thể chuyển sang detail.html nếu đã có trang chi tiết)
  $$("#grid .card").forEach(card => {
    card.addEventListener("click", () => {
      const slug = card.dataset.slug;
      // ví dụ: mở detail.html?slug=...
      // window.location.href = `detail.html?slug=${slug}`;
      // demo: chỉ cuộn lên đầu và đánh hash
      location.hash = slug;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / PAGE_SIZE));
  const nav = $("#pagination");
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  nav.innerHTML = `
    <button class="btn prev" ${currentPage===1?'disabled':''}>Previous</button>
    ${pages.map(p => `<button class="page ${p===currentPage?'active':''}" data-page="${p}">${p}</button>`).join("")}
    <button class="btn next" ${currentPage===totalPages?'disabled':''}>Next</button>
  `;

  nav.querySelector(".prev").onclick = () => { if (currentPage>1){ currentPage--; renderGrid(); renderPagination(); window.scrollTo({top:0,behavior:"smooth"});} };
  nav.querySelector(".next").onclick = () => { if (currentPage<totalPages){ currentPage++; renderGrid(); renderPagination(); window.scrollTo({top:0,behavior:"smooth"});} };
  $$("#pagination .page").forEach(btn => {
    btn.onclick = () => {
      currentPage = Number(btn.dataset.page);
      renderGrid(); renderPagination();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  });
}

// ---- Search & Filter ----
function applyFilters() {
  const q = $("#searchInput").value.trim().toLowerCase();
  filteredBlogs = allBlogs.filter(b => {
    const byText = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    const byTag  = !activeTag || b.category === activeTag;
    return byText && byTag;
  });
  currentPage = 1;
  renderGrid();
  renderPagination();
}

function attachSidebarEvents() {
  $("#searchBtn").onclick = applyFilters;
  $("#searchInput").onkeydown = (e) => { if (e.key === "Enter") applyFilters(); };
  $("#tags").addEventListener("click", e => {
    const btn = e.target.closest(".tag");
    if (!btn) return;
    activeTag = (btn.dataset.tag === activeTag) ? null : btn.dataset.tag;
    renderTags(allBlogs);
    applyFilters();
  });
}

// ---- Boot ----
(async function init() {
  const res = await fetch(DATA_URL);
  const data = await res.json();

  // sắp xếp mới nhất trước (nếu date là dạng text tiếng Anh — có thể giữ nguyên id desc)
  allBlogs = data.blogs.slice().sort((a,b) => b.id - a.id);
  filteredBlogs = allBlogs.slice();

  renderPopular(allBlogs);
  renderTags(allBlogs);
  renderGrid();
  renderPagination();
  attachSidebarEvents();
})();
