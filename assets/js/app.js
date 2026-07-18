/**
 * مدينة الفكر — منطق التطبيق
 * تنقّل SPA · وضع داكن/فاتح · فلاتر · قوالب الصفحات
 */

(function () {
  "use strict";

  const app = document.getElementById("app");
  const themeToggle = document.getElementById("theme-toggle");
  const menuToggle = document.getElementById("menu-toggle");
  const mainNav = document.getElementById("main-nav");
  const siteHeader = document.getElementById("site-header");
  const readProgress = document.getElementById("read-progress");

  /* ─── أدوات ─── */
  function specialtyById(id) {
    return SPECIALTIES.find((s) => s.id === id);
  }

  function articleById(id) {
    return ARTICLES.find((a) => a.id === id);
  }

  function formatDate(iso) {
    try {
      return new Intl.DateTimeFormat("ar", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(iso + "T12:00:00"));
    } catch {
      return iso;
    }
  }

  function articlesSorted() {
    return [...ARTICLES].sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ─── الوضع الفاتح / الداكن ─── */
  function getPreferredTheme() {
    const saved = localStorage.getItem("madinah-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("madinah-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#0c1410" : "#1b4332");
    }
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"
      );
      themeToggle.title =
        theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن";
    }
  }

  function toggleTheme() {
    const current =
      document.documentElement.getAttribute("data-theme") || "light";
    applyTheme(current === "dark" ? "light" : "dark");
  }

  applyTheme(getPreferredTheme());
  themeToggle?.addEventListener("click", toggleTheme);

  /* ─── القائمة الجوال ─── */
  function closeMenu() {
    mainNav?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  function toggleMenu() {
    const open = mainNav?.classList.toggle("open");
    menuToggle?.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-open", !!open);
  }

  menuToggle?.addEventListener("click", toggleMenu);

  /* ─── الهيدر عند التمرير ─── */
  window.addEventListener(
    "scroll",
    () => {
      siteHeader?.classList.toggle("scrolled", window.scrollY > 12);
      updateReadProgress();
    },
    { passive: true }
  );

  /* ─── شريط تقدّم القراءة ─── */
  let progressEnabled = false;

  function setProgressEnabled(on) {
    progressEnabled = on;
    if (!readProgress) return;
    readProgress.classList.toggle("visible", on);
    if (!on) readProgress.style.transform = "scaleX(0)";
  }

  function updateReadProgress() {
    if (!progressEnabled || !readProgress) return;
    const content = app.querySelector(".article-content");
    if (!content) {
      readProgress.style.transform = "scaleX(0)";
      return;
    }
    const rect = content.getBoundingClientRect();
    const total = content.offsetHeight - window.innerHeight * 0.35;
    const scrolled = Math.min(
      Math.max(-rect.top + window.innerHeight * 0.15, 0),
      Math.max(total, 1)
    );
    const ratio = total > 0 ? scrolled / total : 0;
    readProgress.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`;
  }

  /* ─── تمييز الرابط النشط ─── */
  function setActiveNav(page) {
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.toggle("active", link.dataset.page === page);
    });
  }

  /* ─── قوالب واجهة ─── */
  function sectionHead(kicker, title, desc) {
    return `
      <div class="section-head">
        <span class="section-kicker">${kicker}</span>
        <h2>${title}</h2>
        <div class="divider">✦</div>
        ${desc ? `<p>${desc}</p>` : ""}
      </div>
    `;
  }

  function specialtyCard(s) {
    return `
      <a href="#/specialty/${s.id}" class="specialty-card" data-link>
        <div class="specialty-icon" aria-hidden="true">${s.icon}</div>
        <h3>${escapeHtml(s.name)}</h3>
        <p>${escapeHtml(s.short)}</p>
        <span class="specialty-tag">${escapeHtml(s.category)}</span>
      </a>
    `;
  }

  function articleCard(a) {
    const sp = specialtyById(a.specialty);
    return `
      <article class="article-card">
        <div class="article-card-top" aria-hidden="true"></div>
        <div class="article-card-body">
          <div class="article-meta">
            <span class="article-cat">${sp ? escapeHtml(sp.name) : ""}</span>
            <span>${formatDate(a.date)}</span>
            <span>·</span>
            <span>${a.readTime} دقائق</span>
          </div>
          <h3><a href="#/article/${a.id}" data-link>${escapeHtml(a.title)}</a></h3>
          <p>${escapeHtml(a.excerpt)}</p>
          <a href="#/article/${a.id}" class="article-read" data-link>اقرأ المقال</a>
        </div>
      </article>
    `;
  }

  /* ─── الصفحات ─── */
  function pageHome() {
    setActiveNav("home");
    const latest = articlesSorted().slice(0, 3);
    const h = SITE.hero;
    const b = SITE.bridge || {};

    return `
      <div class="page">
        <section class="hero">
          <div class="container hero-grid">
            <div>
              <div class="hero-badge">
                <span aria-hidden="true">۞</span>
                ${escapeHtml(h.badge)}
              </div>
              <h1>${h.title}</h1>
              <p class="hero-lead">${escapeHtml(h.lead)}</p>
              <div class="hero-actions">
                <a href="#/articles" class="btn btn-primary" data-link>تصفّح المقالات</a>
                <a href="#/specialties" class="btn btn-ghost" data-link>التخصصات</a>
              </div>
              <div class="hero-meta">
                <span><strong>${SPECIALTIES.length}</strong> تخصصات</span>
                <span><strong>${ARTICLES.length}</strong> مقالات</span>
                <span><strong>☕</strong> ركن للقهوة</span>
              </div>
            </div>
            <aside class="hero-quote">
              <blockquote>${escapeHtml(h.quote)}</blockquote>
              <cite>— ${escapeHtml(h.quoteSource)}</cite>
              <div class="hero-ornament" aria-hidden="true">◆ ✦ ◆</div>
            </aside>
          </div>
        </section>

        <div class="container bridge">
          <div class="bridge-inner">
            <div class="bridge-col">
              <h3><span aria-hidden="true">📜</span> ${escapeHtml(b.heritageTitle || "الأصالة")}</h3>
              <p>${escapeHtml(b.heritage || "")}</p>
            </div>
            <div class="bridge-mid" aria-hidden="true">
              <div class="bridge-x">×</div>
              <span>جسر</span>
            </div>
            <div class="bridge-col">
              <h3><span aria-hidden="true">🌐</span> ${escapeHtml(b.modernTitle || "العصر")}</h3>
              <p>${escapeHtml(b.modern || "")}</p>
            </div>
          </div>
        </div>

        <div class="ornament-bar" aria-hidden="true">—— ✦ ——</div>

        <section class="section">
          <div class="container">
            ${sectionHead(
              "المسارات",
              "تخصصات المدينة",
              "من الفقه وأصوله إلى الإنسان والاقتصاد والطب — مسارات تتقاطع ولا تتنافر."
            )}
            <div class="specialties-grid">
              ${SPECIALTIES.map(specialtyCard).join("")}
            </div>
            <div class="section-actions">
              <a href="#/specialties" class="btn btn-ghost" data-link>عرض كل التخصصات</a>
            </div>
          </div>
        </section>

        <section class="section" style="padding-top:0">
          <div class="container">
            ${sectionHead(
              "أحدث الكتابة",
              "من دفاتر المدينة",
              "مقالات حديثة في الفقه والمقاصد والإنسان والقهوة."
            )}
            <div class="articles-grid">
              ${latest.map(articleCard).join("")}
            </div>
            <div class="section-actions">
              <a href="#/articles" class="btn btn-primary" data-link>كل المقالات</a>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function pageSpecialties() {
    setActiveNav("specialties");
    return `
      <div class="page">
        <section class="section">
          <div class="container">
            ${sectionHead(
              "خريطة المدينة",
              "التخصصات السبعة",
              "اختر مسارًا لتقرأ عنه وعن المقالات المرتبطة به."
            )}
            <div class="specialties-grid">
              ${SPECIALTIES.map(specialtyCard).join("")}
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function pageSpecialty(id) {
    setActiveNav("specialties");
    const s = specialtyById(id);
    if (!s) return pageNotFound();

    const related = articlesSorted().filter((a) => a.specialty === id);

    return `
      <div class="page specialty-page">
        <div class="container">
          <a href="#/specialties" class="article-back" data-link>→ كل التخصصات</a>
          <div class="specialty-banner">
            <div class="specialty-banner-inner">
              <div class="specialty-icon" aria-hidden="true">${s.icon}</div>
              <div>
                <span class="specialty-tag">${escapeHtml(s.category)}</span>
                <h1>${escapeHtml(s.name)}</h1>
                <p>${escapeHtml(s.long)}</p>
              </div>
            </div>
          </div>
          <h2 class="path-title">مقالات في هذا المسار</h2>
          ${
            related.length
              ? `<div class="articles-grid">${related.map(articleCard).join("")}</div>`
              : `<div class="empty-state"><div class="icon">📭</div><p>لا مقالات بعد في هذا التخصص — أضفها من ملف content.js</p></div>`
          }
        </div>
      </div>
    `;
  }

  function pageArticles(filterId) {
    setActiveNav("articles");
    const all = articlesSorted();
    const filtered = filterId
      ? all.filter((a) => a.specialty === filterId)
      : all;

    const filters = `
      <div class="filters" role="tablist" aria-label="تصفية حسب التخصص">
        <button type="button" class="filter-btn ${!filterId ? "active" : ""}" data-filter="">الكل</button>
        ${SPECIALTIES.map(
          (s) => `
          <button type="button" class="filter-btn ${filterId === s.id ? "active" : ""}" data-filter="${s.id}">
            ${s.icon} ${escapeHtml(s.name)}
          </button>`
        ).join("")}
      </div>
    `;

    return `
      <div class="page">
        <section class="section">
          <div class="container">
            ${sectionHead(
              "الأرشيف",
              "المقالات",
              "صفِّ حسب التخصص، أو اقرأ ما يشدّك أولًا."
            )}
            ${filters}
            ${
              filtered.length
                ? `<div class="articles-grid">${filtered.map(articleCard).join("")}</div>`
                : `<div class="empty-state"><div class="icon">🔍</div><p>لا مقالات في هذا التصنيف.</p></div>`
            }
          </div>
        </section>
      </div>
    `;
  }

  function pageArticle(id) {
    setActiveNav("articles");
    const a = articleById(id);
    if (!a) return pageNotFound();
    const sp = specialtyById(a.specialty);

    const related = articlesSorted()
      .filter((x) => x.specialty === a.specialty && x.id !== a.id)
      .slice(0, 3);

    return `
      <div class="page article-page">
        <div class="container">
          <a href="#/articles" class="article-back" data-link>→ العودة للمقالات</a>
          <header class="article-header">
            <div class="article-meta">
              ${
                sp
                  ? `<a href="#/specialty/${sp.id}" class="article-cat" data-link>${escapeHtml(sp.name)}</a>`
                  : ""
              }
              <span>${formatDate(a.date)}</span>
              <span>·</span>
              <span>${a.readTime} دقائق قراءة</span>
            </div>
            <h1>${escapeHtml(a.title)}</h1>
            <p class="lead">${escapeHtml(a.excerpt)}</p>
          </header>
          <div class="ornament-bar" aria-hidden="true">—— ✦ ——</div>
          <div class="article-content">
            ${a.content}
          </div>
          <div class="article-footer">
            ${
              sp
                ? `<a href="#/specialty/${sp.id}" class="btn btn-ghost" data-link>
                    المزيد في: ${escapeHtml(sp.name)}
                  </a>`
                : ""
            }
            <a href="#/articles" class="btn btn-ghost" data-link>كل المقالات</a>
          </div>
          ${
            related.length
              ? `<div class="related-block">
                  <h2>قد يهمّك أيضًا</h2>
                  <div class="related-list">
                    ${related
                      .map(
                        (r) => `
                      <a href="#/article/${r.id}" class="related-item" data-link>
                        <span class="dot" aria-hidden="true"></span>
                        <span>
                          <strong>${escapeHtml(r.title)}</strong>
                          <small>${formatDate(r.date)} · ${r.readTime} دقائق</small>
                        </span>
                      </a>`
                      )
                      .join("")}
                  </div>
                </div>`
              : ""
          }
        </div>
      </div>
    `;
  }

  function pageCoffee() {
    setActiveNav("coffee");
    const c = SITE.coffee;
    return `
      <div class="page">
        <div class="container">
          <div class="coffee-hero">
            <div>
              <span class="section-kicker">طقس المدينة</span>
              <h1 style="font-family:var(--font-display);font-size:clamp(1.9rem,3.5vw,2.6rem);color:var(--accent);margin:0.5rem 0 1rem;line-height:1.4">
                ${escapeHtml(c.title)}
              </h1>
              <p class="hero-lead" style="margin-bottom:0">${escapeHtml(c.lead)}</p>
            </div>
            <div class="coffee-visual" aria-hidden="true">
              <div class="coffee-ring"></div>
              <div class="coffee-ring coffee-ring-2"></div>
              <div class="coffee-cup">☕</div>
            </div>
          </div>
          <div class="coffee-notes" style="max-width:720px;margin:1rem auto 2rem">
            ${c.notes
              .map(
                (n) => `
              <div class="coffee-note">
                <h3>${escapeHtml(n.title)}</h3>
                <p>${escapeHtml(n.text)}</p>
              </div>`
              )
              .join("")}
          </div>
          <div class="coffee-cta">
            <a href="#/articles" class="btn btn-primary" data-link>اقرأ مقالًا مع قهوتك</a>
          </div>
        </div>
      </div>
    `;
  }

  function pageAbout() {
    setActiveNav("about");
    const a = SITE.about;
    return `
      <div class="page">
        <section class="section">
          <div class="container">
            ${sectionHead("التعريف", "عن مدينة الفكر", "")}
            <div class="about-layout">
              <div class="about-card">
                <h2>لماذا هذه المدونة؟</h2>
                <p>${escapeHtml(a.intro)}</p>
                <p>${escapeHtml(a.mission)}</p>
                <p class="about-author">— ${escapeHtml(SITE.author)}</p>
              </div>
              <div class="about-card">
                <h2>ما الذي ستجده هنا؟</h2>
                <ul class="about-list">
                  ${SPECIALTIES.map(
                    (s) => `
                    <li>
                      <span class="mark">${s.icon}</span>
                      <span><strong style="color:var(--accent)">${escapeHtml(s.name)}</strong>
                      — ${escapeHtml(s.short)}</span>
                    </li>`
                  ).join("")}
                </ul>
                <div class="values-grid">
                  ${a.values
                    .map(
                      (v) => `
                    <div class="value-item">
                      <strong>${escapeHtml(v.title)}</strong>
                      <span>${escapeHtml(v.desc)}</span>
                    </div>`
                    )
                    .join("")}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function pageNotFound() {
    setActiveNav("");
    return `
      <div class="page not-found">
        <h1>الصفحة غير موجودة</h1>
        <p>يبدو أن الرابط لا يؤدي إلى دربٍ في مدينة الفكر.</p>
        <a href="#/" class="btn btn-primary" data-link>العودة للرئيسية</a>
      </div>
    `;
  }

  /* ─── الموجّه ─── */
  function parseRoute() {
    const raw = (location.hash || "#/").replace(/^#/, "") || "/";
    const parts = raw.split("/").filter(Boolean);
    if (parts.length === 0) return { name: "home" };
    const [a, b] = parts;
    if (a === "specialties") return { name: "specialties" };
    if (a === "specialty" && b) return { name: "specialty", id: b };
    if (a === "articles") return { name: "articles", filter: b || null };
    if (a === "article" && b) return { name: "article", id: b };
    if (a === "coffee") return { name: "coffee" };
    if (a === "about") return { name: "about" };
    return { name: "notfound" };
  }

  function render() {
    const route = parseRoute();
    let html;

    switch (route.name) {
      case "home":
        html = pageHome();
        break;
      case "specialties":
        html = pageSpecialties();
        break;
      case "specialty":
        html = pageSpecialty(route.id);
        break;
      case "articles":
        html = pageArticles(route.filter);
        break;
      case "article":
        html = pageArticle(route.id);
        break;
      case "coffee":
        html = pageCoffee();
        break;
      case "about":
        html = pageAbout();
        break;
      default:
        html = pageNotFound();
    }

    app.innerHTML = html;
    window.scrollTo(0, 0);
    closeMenu();
    setProgressEnabled(route.name === "article");
    bindPageEvents();
    requestAnimationFrame(updateReadProgress);

    document.title =
      route.name === "home"
        ? `${SITE.name} | مدونة فقهية عصرية`
        : `${pageTitle(route)} | ${SITE.name}`;
  }

  function pageTitle(route) {
    switch (route.name) {
      case "specialties":
        return "التخصصات";
      case "specialty":
        return specialtyById(route.id)?.name || "تخصص";
      case "articles":
        return "المقالات";
      case "article":
        return articleById(route.id)?.title || "مقال";
      case "coffee":
        return "ركن القهوة";
      case "about":
        return "عن المدونة";
      default:
        return "غير موجود";
    }
  }

  function bindPageEvents() {
    app.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const f = btn.getAttribute("data-filter") || "";
        location.hash = f ? `#/articles/${f}` : "#/articles";
      });
    });
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-link]");
    if (!link) return;
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) {
      closeMenu();
    }
  });

  window.addEventListener("hashchange", render);

  if (!location.hash) location.hash = "#/";
  else render();
})();
