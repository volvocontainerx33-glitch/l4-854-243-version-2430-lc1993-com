(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      index = nextIndex % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.site-search'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card, [data-card-list] .rank-item'));
  var currentFilter = '全部';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter() {
    var keyword = normalize(searchInputs.map(function (input) {
      return input.value;
    }).join(' '));

    cards.forEach(function (card) {
      var info = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-info'));
      var matchKeyword = !keyword || info.indexOf(keyword) !== -1;
      var matchFilter = currentFilter === '全部' || info.indexOf(normalize(currentFilter)) !== -1;
      card.classList.toggle('is-hidden', !(matchKeyword && matchFilter));
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyFilter);
  });

  filterButtons.forEach(function (button) {
    if (button.getAttribute('data-filter') === '全部') {
      button.classList.add('is-active');
    }

    button.addEventListener('click', function () {
      currentFilter = button.getAttribute('data-filter') || '全部';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilter();
    });
  });
})();
