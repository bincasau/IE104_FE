// ====== CONFIG ======
const DATA_URL = "../data/blogs.json"; // chứa cả blogs + details
const PAGE_SIZE = 5;

// ====== STATE ======
let allBlogs = [], details = [], filteredBlogs = [];
let currentPage = 1, activeTag = null;

// ====== HELPERS ======
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const paginate = (arr, p = 1, size = PAGE_SIZE) => arr.slice((p - 1) * size, p * size);
const uniq = arr => Array.from(new Set(arr));

// ====== SIDEBAR ======
function renderTags(blogs) {
  const tags = uniq(blogs.map(b => b.category));
  $("#tags").innerHTML = tags.map(t => `
    <button class="tag ${t === activeTag ? "active" : ""}" data-tag="${t}">${t}</button>
  `).join("");
}

function renderPopular(blogs) {
  $("#popular").innerHTML = blogs.slice(0, 4).map(b => `
    <a class="item" href="#${b.slug}">
      <img src="${b.image}" alt="${b.title}">
      <div>
        <div class="meta">${b.category}</div>
        <div class="title">${b.title}</div>
      </div>
    </a>
  `).join("");
}

// ====== GRID ======
function card(b, isBig = false) {
  return `
  <article class="card ${isBig ? 'big' : ''}" data-slug="${b.slug}">
    <img class="cover" src="${b.image}" alt="${b.title}">
    <div class="body">
      <div class="category">${b.category}</div>
      <h3 class="title">${b.title}</h3>
      <div class="author">
        <img class="avatar" src="${b.avatar}" alt="${b.author}">
        <span>${b.author} · ${b.date}</span>
      </div>
    </div>
  </article>`;
}

function renderGrid() {
  const list = paginate(filteredBlogs, currentPage);
  $("#grid").innerHTML = list.map((b, i) => card(b, i === 0 && currentPage === 1)).join("");
  $$("#grid .card").forEach(c => {
    c.onclick = () => {
      location.hash = c.dataset.slug;
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  });
}

function renderPagination() {
  const total = Math.ceil(filteredBlogs.length / PAGE_SIZE);
  const nav = $("#pagination");
  nav.innerHTML = `
    <button class="btn prev" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>
    ${Array.from({ length: total }, (_, i) => `
      <button class="page ${i + 1 === currentPage ? 'active' : ''}" data-page="${i + 1}">${i + 1}</button>
    `).join("")}
    <button class="btn next" ${currentPage === total ? 'disabled' : ''}>Next</button>`;
  nav.querySelector(".prev").onclick = () => { if (currentPage > 1) { currentPage--; renderGrid(); renderPagination(); } };
  nav.querySelector(".next").onclick = () => { if (currentPage < total) { currentPage++; renderGrid(); renderPagination(); } };
  $$("#pagination .page").forEach(b => b.onclick = () => { currentPage = +b.dataset.page; renderGrid(); renderPagination(); });
}

// ====== FILTER ======
function applyFilter() {
  const q = ($("#searchInput").value || "").toLowerCase();
  filteredBlogs = allBlogs.filter(b => {
    const t = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    const c = !activeTag || b.category === activeTag;
    return t && c;
  });
  currentPage = 1; renderGrid(); renderPagination();
}

// ====== DETAIL ======
function renderBlogDetail(slug) {
  const post = details.find(p => p.slug === slug);
  if (!post) return;

  const list = $("#grid"), pag = $("#pagination"), ttl = $(".section-title");
  let box = $("#blog-detail");
  if (!box) {
    box = document.createElement("div");
    box.id = "blog-detail";
    box.className = "blog-detail";
    $(".main").insertBefore(box, pag);
  }

  // Ẩn phần danh sách
  list.style.display = "none";
  pag.style.display = "none";
  ttl.style.display = "none";

  const avatar = (allBlogs.find(b => b.slug === slug)?.avatar) || "https://i.pravatar.cc/40?img=1";
  const mins = Math.max(1, Math.round(post.intro.split(" ").length / 150));

  box.dataset.slug = slug; // lưu slug hiện tại
  box.innerHTML = `
    <div class="bd-hero">
      <img src="${post.cover}" alt="${post.title}">
      <span class="bd-chip">${post.category}</span>
    </div>
    <div class="bd-head">
      <button class="back-btn">← Back to Blogs</button>
      <h1 class="bd-title">${post.title}</h1>
      <div class="bd-meta">
        <img class="avatar" src="${avatar}" alt="${post.author}">
        <span>${post.author}</span>
        <span>•</span><span>${post.date}</span>
        <span>•</span><span>${mins} min read</span>
      </div>
    </div>
    <div class="bd-divider"></div>
    <div class="bd-body">
      <p class="bd-intro">${post.intro}</p>
      ${post.sections.map((s, i) => `
        <section class="bd-section">
          <h2>${s.heading}</h2>
          <p>${s.text}</p>
          ${s.image ? `<img src="${s.image}" alt="${s.heading}"><div class="bd-cap">Figure ${i + 1}. ${s.heading}</div>` : ""}
        </section>`).join("")}
      ${post.quote ? `<div class="bd-quote">${post.quote}</div>` : ""}
      ${post.gallery ? `<div class="bd-gallery">${post.gallery.map(g => `<img src="${g}">`).join("")}</div>` : ""}
    </div>`;

  // ==== Nút quay lại ====
  box.querySelector(".back-btn").onclick = () => {
    // luôn trở về trang blog list
    location.hash = "";   // xóa hash để router render lại danh sách
    showListView();       // hiển thị lại grid + pagination
  };

};

// ====== ROUTER UTILS ======
function showListView() {
  const list = $("#grid");
  const pag = $("#pagination");
  const ttl = $(".section-title");
  const detail = $("#blog-detail");

  if (detail) detail.remove(); // remove DOM để tránh lỗi trùng
  if (list) list.style.display = "";
  if (pag) pag.style.display = "";
  if (ttl) ttl.style.display = "";
  window.scrollTo({ top: 0, behavior: "instant" });
}

function handleRoute() {
  const slug = decodeURIComponent(location.hash.replace(/^#/, "").trim());
  if (!slug) {
    showListView();
    return;
  }
  const opened = $("#blog-detail");
  if (opened && opened.dataset.slug === slug) return;
  renderBlogDetail(slug);
}

// ====== INIT ======
(async () => {
  const res = await fetch(DATA_URL);
  const data = await res.json();
  allBlogs = data.blogs;
  details = data.details;
  filteredBlogs = allBlogs.slice();

  renderTags(allBlogs);
  renderPopular(allBlogs);
  renderGrid();
  renderPagination();

  $("#searchBtn").onclick = applyFilter;
  $("#searchInput").onkeydown = e => e.key === "Enter" && applyFilter();

  $("#tags").onclick = e => {
    const b = e.target.closest(".tag");
    if (!b) return;
    activeTag = b.dataset.tag === activeTag ? null : b.dataset.tag;
    renderTags(allBlogs);
    applyFilter();
  };

  window.addEventListener("hashchange", handleRoute);
  handleRoute(); // render theo hash hiện tại (nếu có)
})();
