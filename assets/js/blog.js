export async function initPage() {
  console.log("Blog section initialized");
  const DATA_URL = "../data/blogs.json";
  const PAGE_SIZE = 5;

  let allBlogs = [],
    details = [],
    filteredBlogs = [];
  let currentPage = 1,
    activeTag = null;

  // ✅ Cờ (flag) để check lần tải trang đầu tiên
  let isInitialLoad = true;

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const paginate = (arr, p = 1, size = PAGE_SIZE) =>
    arr.slice((p - 1) * size, p * size);
  const uniq = (arr) => Array.from(new Set(arr));

  // ✅ Định nghĩa chiều cao Header ở đây để dùng chung
  const HEADER_OFFSET = 96;

  // ✅ TẠO HÀM CUỘN DÙNG CHUNG
  // Hàm này sẽ cuộn đến đầu danh sách bài viết (ngay trên chữ "RECENT BLOGS")
  // và chừa ra 96px cho header
  const scrollToGridTop = () => {
    const target = $(".section-title") || $(".main");
    if (target) {
      const elementPosition =
        target.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - HEADER_OFFSET;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // ✅ Vấn đề 3: Thêm hàm Debounce (cho tìm kiếm live)
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ====== SIDEBAR ======
  function renderTags(blogs) {
    const tags = uniq(blogs.map((b) => b.category));
    $("#tags").innerHTML = tags
      .map(
        (t) => `
        <button class="tag ${
          t === activeTag ? "active" : ""
        }" data-tag="${t}">${t}</button>
      `
      )
      .join("");
  }

  function renderPopular(blogs) {
    $("#popular").innerHTML = blogs
      .slice(0, 6)
      .map(
        (b) => `
        <a class="item" href="#${b.slug}">
          <img src="${b.image}" alt="${b.title}">
          <div>
            <div class="meta">${b.category}</div>
            <div class="title">${b.title}</div>
          </div>
        </a>
      `
      )
      .join("");
  }

  // ====== GRID ======
  function card(b, isBig = false) {
    return `
      <article class="card ${isBig ? "big" : ""}" data-slug="${b.slug}">
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
    $("#grid").innerHTML = list
      .map((b, i) => card(b, i === 0 && currentPage === 1))
      .join("");

    $$("#grid .card").forEach((c) => {
      c.onclick = () => {
        location.hash = c.dataset.slug;
      };
    });

    const cards = $$("#grid .card");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    cards.forEach((card) => observer.observe(card));
  }

  function renderPagination() {
    const total = Math.ceil(filteredBlogs.length / PAGE_SIZE);
    const nav = $("#pagination");
    nav.innerHTML = `
      <button class="btn prev" data-key="blog_prev_btn" ${
        currentPage === 1 ? "disabled" : ""
      }></button>
      ${Array.from(
        { length: total },
        (_, i) => `
        <button class="page ${
          i + 1 === currentPage ? "active" : ""
        }" data-page="${i + 1}">${i + 1}</button>
      `
      ).join("")}
      <button class="btn next" data-key="blog_next_btn" ${
        currentPage === total ? "disabled" : ""
      }></button>`;

    // ✅ CHỈ GỌI HÀM CUỘN KHI NHẤN NÚT PHÂN TRANG
    nav.querySelector(".prev").onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        renderGrid();
        renderPagination();
        scrollToGridTop(); // ✅ Cuộn mượt
      }
    };
    nav.querySelector(".next").onclick = () => {
      if (currentPage < total) {
        currentPage++;
        renderGrid();
        renderPagination();
        scrollToGridTop(); // ✅ Cuộn mượt
      }
    };
    $$("#pagination .page").forEach(
      (b) =>
        (b.onclick = () => {
          const newPage = +b.dataset.page;
          if (newPage === currentPage) return;
          currentPage = newPage;
          renderGrid();
          renderPagination();
          scrollToGridTop(); // ✅ Cuộn mượt
        })
    );

    import("./lang.js").then(({ applyTranslations }) => applyTranslations(nav));
  }

  // ====== FILTER ======
  function applyFilter() {
    const q = ($("#searchInput").value || "").toLowerCase();
    filteredBlogs = allBlogs.filter((b) => {
      const t =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q);
      const c = !activeTag || b.category === activeTag;
      return t && c;
    });
    currentPage = 1;
    renderGrid();
    renderPagination();

    // ✅ Thêm lại: Cuộn mượt khi lọc
    scrollToGridTop();
  }

  // ====== DETAIL ======
  function renderBlogDetail(slug) {
    const post = details.find((p) => p.slug === slug);
    if (!post) return;

    const currentCrumb = $(".breadcrumb .current");
    if (currentCrumb) {
      currentCrumb.setAttribute("data-key", "blog_breadcrumb_detail");
      currentCrumb.textContent = "";
      import("./lang.js").then(({ applyTranslations }) =>
        applyTranslations($(".breadcrumb"))
      );
    }

    const list = $("#grid"),
      pag = $("#pagination"),
      ttl = $(".section-title");
    let box = $("#blog-detail");
    if (!box) {
      box = document.createElement("div");
      box.id = "blog-detail";
      box.className = "blog-detail";
      $(".main").insertBefore(box, pag);
    }

    list.style.display = "none";
    pag.style.display = "none";
    ttl.style.display = "none";

    const avatar =
      allBlogs.find((b) => b.slug === slug)?.avatar ||
      "https://i.pravatar.cc/40?img=1";
    const mins = Math.max(1, Math.round(post.intro.split(" ").length / 150));
    const shareUrl = location.href;
    const shareTitle = post.title;

    const order = allBlogs.map((b) => b.slug);
    const idx = order.indexOf(slug);
    const nextSlug = idx < order.length - 1 ? order[idx + 1] : null;

    box.dataset.slug = slug;
    box.innerHTML = `
      <div class="bd-hero">
        <img src="${post.cover}" alt="${post.title}">
        <span class="bd-chip">${post.category}</span>
      </div>

      <div class="bd-head">
        <button class="back-btn" data-key="blog_back_btn"></button>
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
        ${post.sections
          .map(
            (s) => `
          <section class="bd-section">
            <h2>${s.heading}</h2>
            <p>${s.text}</p>
            ${
              s.image
                ? `<img src="${s.image}" alt="${s.heading}">
                   <div class="bd-cap" data-key="blog_figure_label"></div>`
                : ""
            }
          </section>
        `
          )
          .join("")}
        ${post.quote ? `<div class="bd-quote">${post.quote}</div>` : ""}
        ${
          post.gallery
            ? `<div class="bd-gallery">${post.gallery
                .map((g) => `<img src="${g}">`)
                .join("")}</div>`
            : ""
        }
      </div>

      <nav class="bd-nav">
        <div class="bd-share">
          <span data-key="blog_share_label"></span>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl
          )}" class="bd-share-btn facebook" target="_blank" rel="noopener"><i class="fab fa-facebook-f"></i></a>
          <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(
            shareUrl
          )}&text=${encodeURIComponent(
      shareTitle
    )}" class="bd-share-btn twitter" target="_blank" rel="noopener"><i class="fab fa-x-twitter"></i></a>
          <a href="https://www.instagram.com/" class="bd-share-btn instagram" target="_blank" rel="noopener"><i class="fab fa-instagram"></i></a>
        </div>
        ${
          nextSlug
            ? `<a class="bd-next" href="#${nextSlug}" data-key="blog_next_blog"></a>`
            : `<span></span>`
        }
      </nav>

      <section class="bd-comments">
        <h3 data-key="blog_comments_title"></h3>
        <ul class="cmt-list">
          <li class="cmt">
            <img class="cmt-avatar" src="https://i.pravatar.cc/40?img=32" alt="User">
            <div class="cmt-body">
              <div class="cmt-meta">
                <strong>Minh Nguyen</strong> · 
                <span data-key="blog_comment_date_2days"></span>
              </div>
              <p>Tuyệt vời! Bài viết rất hữu ích cho chuyến đi sắp tới.</p>
            </div>
          </li>
          <li class="cmt">
            <img class="cmt-avatar" src="https://i.pravatar.cc/40?img=15" alt="User">
            <div class="cmt-body">
              <div class="cmt-meta">
                <strong>Lan Pham</strong> · 
                <span data-key="blog_comment_date_yesterday"></span>
              </div>
              <p>Mong có thêm phần chi phí dự kiến ở từng địa điểm nha.</p>
            </div>
          </li>
        </ul>


        <form id="cmtForm" class="cmt-form">
          <label for="cmtText" data-key="blog_leave_comment"></label>
          <textarea id="cmtText" rows="4" data-key-placeholder="blog_comment_placeholder"></textarea>
          <button type="submit" class="cmt-submit" data-key="blog_submit_btn"></button>
          <p id="cmtNote" class="cmt-note" data-key="blog_comment_note" hidden></p>
        </form>
      </section>`;

    box.querySelector(".back-btn").onclick = () => {
      location.hash = "";
    };

    const form = box.querySelector("#cmtForm");
    form.onsubmit = (e) => {
      e.preventDefault();
      const textarea = box.querySelector("#cmtText");
      const note = box.querySelector("#cmtNote");
      if (!textarea.value.trim()) return textarea.focus();
      textarea.value = "";
      note.hidden = false;
      note.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    // Cuộn khi xem chi tiết (vẫn giữ nguyên)
    const elementPosition = box.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - HEADER_OFFSET;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }

  // ====== ROUTER ======
  function showListView() {
    const currentCrumb = $(".breadcrumb .current");
    if (currentCrumb) {
      currentCrumb.setAttribute("data-key", "blog_breadcrumb_current");
      currentCrumb.textContent = "";
      import("./lang.js").then(({ applyTranslations }) =>
        applyTranslations($(".breadcrumb"))
      );
    }

    const list = $("#grid"),
      pag = $("#pagination"),
      ttl = $(".section-title"),
      detail = $("#blog-detail");

    if (detail) detail.remove();
    if (list) list.style.display = "";
    if (pag) pag.style.display = "";
    if (ttl) ttl.style.display = "";

    // ✅ SỬA LỖI CUỘN CỦA NÚT "BACK"
    if (isInitialLoad) {
      // Khi mới tải trang lần đầu -> không cuộn, chỉ nhảy lên top 0
      if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: "instant" });
    } else {
      // Khi nhấn "Back" (hoặc tag) -> cuộn mượt
      scrollToGridTop();
    }
  }

  function handleRoute() {
    const savedSlug = sessionStorage.getItem("openBlogSlug");
    if (savedSlug) {
      location.hash = savedSlug;
      sessionStorage.removeItem("openBlogSlug");
    }
    const slug = decodeURIComponent(location.hash.replace(/^#/, "").trim());
    if (!slug) {
      showListView();
      if (window.filterAfterHashChange) {
        applyFilter(); // Filter này đã tự gọi scrollToGridTop()
        window.filterAfterHashChange = false;
      }
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

    // ✅ Thêm lại tìm kiếm "live" (debounce)
    const debouncedApplyFilter = debounce(applyFilter, 400);
    $("#searchInput").oninput = debouncedApplyFilter;
    $("#searchBtn").onclick = applyFilter; // Giữ lại nút click

    $("#tags").onclick = (e) => {
      const b = e.target.closest(".tag");
      if (!b) return;
      const newTag = b.dataset.tag === activeTag ? null : b.dataset.tag;
      activeTag = newTag;
      renderTags(allBlogs);
      if ($("#blog-detail")) {
        window.filterAfterHashChange = true;
        location.hash = "";
      } else applyFilter();
    };

    window.addEventListener("hashchange", handleRoute);
    handleRoute(); // ✅ Lần tải trang đầu tiên chạy ở đây

    isInitialLoad = false; // ✅ Sau khi chạy xong lần đầu, tắt cờ
  })();
}

window.addEventListener("retranslate", () => {
  const box = document.querySelector("#blog-detail");
  if (box)
    import("./lang.js").then(({ applyTranslations }) => applyTranslations(box));
});
