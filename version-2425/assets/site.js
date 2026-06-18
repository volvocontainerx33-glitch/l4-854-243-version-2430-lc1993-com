(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var opened = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    var grids = document.querySelectorAll('[data-card-grid]');
    if (!grids.length) {
      return;
    }

    var searchInput = document.querySelector('[data-search-input]');
    var regionSelect = document.querySelector('[data-region-filter]');
    var typeSelect = document.querySelector('[data-type-filter]');
    var categorySelect = document.querySelector('[data-category-filter]');
    var query = normalize(searchInput ? searchInput.value : '');
    var region = regionSelect ? regionSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';
    var category = categorySelect ? categorySelect.value : '';

    grids.forEach(function (grid) {
      var visible = 0;
      Array.prototype.forEach.call(grid.children, function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var matchesSearch = !query || text.indexOf(query) !== -1;
        var matchesRegion = !region || card.getAttribute('data-region') === region;
        var matchesType = !type || card.getAttribute('data-type') === type;
        var matchesCategory = !category || card.getAttribute('data-category') === category;
        var show = matchesSearch && matchesRegion && matchesType && matchesCategory;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      var emptyState = document.querySelector('[data-empty-state]');
      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    });
  }

  function applySort() {
    var sortSelect = document.querySelector('[data-sort-select]');
    var grid = document.querySelector('[data-card-grid]');
    if (!sortSelect || !grid) {
      return;
    }

    var mode = sortSelect.value;
    var cards = Array.prototype.slice.call(grid.children);

    cards.sort(function (left, right) {
      if (mode === 'year') {
        return Number(right.getAttribute('data-year') || 0) - Number(left.getAttribute('data-year') || 0);
      }
      if (mode === 'title') {
        return String(left.getAttribute('data-title') || '').localeCompare(String(right.getAttribute('data-title') || ''), 'zh-CN');
      }
      return Number(right.getAttribute('data-hot') || 0) - Number(left.getAttribute('data-hot') || 0);
    });

    cards.forEach(function (card) {
      grid.appendChild(card);
    });

    applyFilters();
  }

  var inputs = document.querySelectorAll('[data-search-input], [data-region-filter], [data-type-filter], [data-category-filter]');
  inputs.forEach(function (input) {
    input.addEventListener('input', applyFilters);
    input.addEventListener('change', applyFilters);
  });

  var sortSelect = document.querySelector('[data-sort-select]');
  if (sortSelect) {
    sortSelect.addEventListener('change', applySort);
  }

  var params = new URLSearchParams(window.location.search);
  var queryParam = params.get('q');
  var firstSearch = document.querySelector('[data-search-input]');
  if (queryParam && firstSearch) {
    firstSearch.value = queryParam;
    applyFilters();
  }

  function setupHero(hero) {
    var slides = hero.querySelectorAll('.hero-slide');
    var dots = hero.querySelectorAll('[data-hero-dot]');
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    var current = 0;
    var timer = null;

    if (!slides.length) {
      return;
    }

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        play();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        play();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        play();
      });
    });

    hero.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });

    hero.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  document.querySelectorAll('[data-hero]').forEach(setupHero);
})();
