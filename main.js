(function () {
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

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
    var fallback = document.getElementById('reviews-fallback');
    if (!feed || !fallback) return;
    try {
      var res = await fetch('reviews.json', { cache: 'no-store' });
      if (!res.ok) return;
      var data = await res.json();
      var reviews = Array.isArray(data.reviews) ? data.reviews : [];
      if (!reviews.length) return;
      fallback.hidden = true;
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
