(function () {
  var header = document.querySelector('[data-site-header]');
  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 18) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('.hero-slider').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    if (slides.length < 2) return;
    var index = 0;
    var timer;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      window.clearInterval(timer);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        stop();
        show(i);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('.local-filter-input');
    var typeSelect = scope.querySelector('.local-filter-type');
    var yearSelect = scope.querySelector('.local-filter-year');
    var parent = scope.parentElement || document;
    var cards = Array.prototype.slice.call(parent.querySelectorAll('.movie-card'));
    var empty = parent.querySelector('.empty-state');

    function getText(card) {
      return [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-tags') || ''
      ].join(' ').toLowerCase();
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var typeValue = typeSelect ? typeSelect.value : '';
      var yearValue = yearSelect ? yearSelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = getText(card);
        var type = card.getAttribute('data-type') || '';
        var year = card.getAttribute('data-year') || '';
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchType = !typeValue || type.indexOf(typeValue) !== -1 || text.indexOf(typeValue.toLowerCase()) !== -1;
        var matchYear = !yearValue || year === yearValue;
        var show = matchQuery && matchType && matchYear;
        card.classList.toggle('is-hidden', !show);
        if (show) visible += 1;
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery && input) {
      input.value = initialQuery;
    }
    applyFilter();
  });
})();
