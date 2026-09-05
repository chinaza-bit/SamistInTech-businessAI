// ============================================
// SamistInTech — site script
// ============================================

const SUPABASE_URL = "https://uktrbguxwiiadtiyeggr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdHJiZ3V4d2lpYWR0aXllZ2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNDI2NTQsImV4cCI6MjEwMzgxODY1NH0.b50d0_nhCFKJEbWEs3rmZRiOb2CbBYDO9vv27pYESH0";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());

// ---------- mobile nav ----------
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

// ---------- helpers ----------
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function blogCard(post) {
  const cover = post.cover_image_url
    ? `<img class="cover" src="${post.cover_image_url}" alt="${escapeHtml(post.title)}" loading="lazy" />`
    : `<div class="cover"></div>`;
  return `
    <a class="blog-card" href="post.html?slug=${encodeURIComponent(post.slug)}">
      ${cover}
      <div class="body">
        <p class="date">${formatDate(post.published_at)}</p>
        <h3>${escapeHtml(post.title)}</h3>
        <p class="excerpt">${escapeHtml(post.excerpt)}</p>
        <span class="read-more">Read post →</span>
      </div>
    </a>`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

// ---------- homepage blog preview ----------
const previewGrid = document.getElementById("blogPreviewGrid");
if (previewGrid) {
  db.from("blog_posts")
    .select("slug,title,excerpt,cover_image_url,published_at")
    .order("published_at", { ascending: false })
    .limit(3)
    .then(({ data, error }) => {
      if (error || !data || data.length === 0) return;
      previewGrid.innerHTML = data.map(blogCard).join("");
    });
}

// ---------- full blog listing ----------
const blogGrid = document.getElementById("blogGrid");
if (blogGrid) {
  db.from("blog_posts")
    .select("slug,title,excerpt,cover_image_url,published_at")
    .order("published_at", { ascending: false })
    .then(({ data, error }) => {
      if (error || !data || data.length === 0) return;
      blogGrid.innerHTML = data.map(blogCard).join("");
    });
}

// ---------- single post page ----------
const postContentEl = document.getElementById("postContent");
if (postContentEl) {
  const slug = new URLSearchParams(window.location.search).get("slug");
  const headEl = document.getElementById("postHead");
  if (!slug) {
    headEl.innerHTML = `<h1>Post not found</h1>`;
  } else {
    db.from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          headEl.innerHTML = `<h1>Post not found</h1><p style="color:var(--muted); margin-top:12px;">This post may have been moved. <a href="blog.html" style="color:var(--green); font-weight:600;">See all posts →</a></p>`;
          return;
        }
        document.getElementById("pageTitle").textContent = data.title + " — SamistInTech";
        document.getElementById("pageDesc").setAttribute("content", data.excerpt || "");
        headEl.innerHTML = `<p class="date">${formatDate(data.published_at)}</p><h1>${escapeHtml(data.title)}</h1>`;
        if (data.cover_image_url) {
          const coverWrap = document.getElementById("postCoverWrap");
          document.getElementById("postCover").src = data.cover_image_url;
          document.getElementById("postCover").alt = data.title;
          coverWrap.style.display = "block";
        }
        // content is stored as plain paragraphs separated by blank lines
        const paragraphs = (data.content || "").split(/\n\s*\n/).filter(Boolean);
        postContentEl.innerHTML = paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join("");
      });
  }
}

// ---------- contact form ----------
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const note = document.getElementById("formNote");
    const fd = new FormData(contactForm);
    const payload = {
      name: fd.get("name"),
      phone: fd.get("phone"),
      business_name: fd.get("business_name") || null,
      message: fd.get("message") || null,
    };
    note.textContent = "Sending…";
    const { error } = await db.from("contact_submissions").insert(payload);
    if (error) {
      note.textContent = "Something went wrong — please try WhatsApp instead.";
      note.style.color = "#b3413a";
    } else {
      note.textContent = "Thanks! We'll reach out on WhatsApp shortly.";
      note.style.color = "var(--green)";
      contactForm.reset();
    }
  });
}
