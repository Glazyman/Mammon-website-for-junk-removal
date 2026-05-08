(function () {
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function headerSolidOnScroll() {
    var header = document.getElementById('site-header');
    var hero = document.querySelector('.hero');
    if (!header || !hero) return;
    if (header.classList.contains('nav-open')) return;
    var threshold = Math.max(hero.offsetHeight - 72, 48);
    header.classList.toggle('site-header--solid', window.scrollY > threshold);
  }

  window.addEventListener('scroll', headerSolidOnScroll, { passive: true });
  window.addEventListener('resize', headerSolidOnScroll, { passive: true });
  headerSolidOnScroll();

  var navScrollLockY = 0;

  function lockBodyForNav() {
    navScrollLockY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    document.documentElement.classList.add('nav-scroll-lock');
    document.body.style.top = '-' + navScrollLockY + 'px';
  }

  function unlockBodyForNav() {
    if (!document.documentElement.classList.contains('nav-scroll-lock')) return;
    document.documentElement.classList.remove('nav-scroll-lock');
    document.body.style.top = '';
    window.scrollTo(0, navScrollLockY);
  }

  function closeMobileNav() {
    var header = document.getElementById('site-header');
    var toggle = document.getElementById('nav-toggle');
    if (!header || !toggle) return;
    header.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    unlockBodyForNav();
    headerSolidOnScroll();
  }

  function initMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var header = document.getElementById('site-header');
    var nav = document.getElementById('primary-nav');
    if (!toggle || !header || !nav) return;

    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) {
        lockBodyForNav();
        header.classList.remove('site-header--solid');
      } else {
        unlockBodyForNav();
        headerSolidOnScroll();
      }
    });

    var backdrop = document.getElementById('nav-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', closeMobileNav);
    }

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMobileNav();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMobileNav();
    });

    window.addEventListener(
      'resize',
      function () {
        if (window.matchMedia('(min-width: 900px)').matches) {
          closeMobileNav();
        }
        headerSolidOnScroll();
      },
      { passive: true }
    );
  }

  initMobileNav();

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function starsMarkup(rating) {
    var n = Math.min(5, Math.max(1, Number(rating) || 5));
    var filled = '★'.repeat(n);
    var empty = '☆'.repeat(5 - n);
    return (
      '<p class="g-review-card__stars" aria-label="' +
      n +
      ' out of 5 stars">' +
      filled +
      empty +
      '</p>'
    );
  }

  async function loadGoogleReviews() {
    var feed = document.getElementById('google-reviews-feed');
    if (!feed) return;
    try {
      var res = await fetch('reviews.json', { cache: 'no-store' });
      if (!res.ok) return;
      var data = await res.json();
      var reviews = Array.isArray(data.reviews) ? data.reviews : [];
      if (!reviews.length) return;
      feed.innerHTML = reviews
        .slice(0, 12)
        .map(function (r) {
          var cite =
            escapeHtml(r.author || 'Google reviewer') +
            (r.relative_time
              ? ' · ' + escapeHtml(r.relative_time)
              : '');
          return (
            '<article class="g-review-card">' +
            starsMarkup(r.rating) +
            '<blockquote class="g-review-card__quote"><p>' +
            escapeHtml(r.text) +
            '</p><cite>' +
            cite +
            '</cite></blockquote></article>'
          );
        })
        .join('');
    } catch (_) {}
  }

  loadGoogleReviews();
})();
