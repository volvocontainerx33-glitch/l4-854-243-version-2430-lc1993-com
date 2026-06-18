(function () {
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  function syncHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('scrolled', window.scrollY > 12);
  }

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let active = 0;
    let timer = null;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const index = Number(dot.getAttribute('data-hero-dot'));
        showSlide(index);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  const filterAreas = Array.from(document.querySelectorAll('[data-filter-area]'));
  filterAreas.forEach(function (area) {
    const list = area.parentElement.querySelector('[data-filter-list]');
    const empty = area.parentElement.querySelector('[data-empty-state]');
    const keywordInput = area.querySelector('[data-filter-keyword]');
    const yearSelect = area.querySelector('[data-filter-year]');
    const typeSelect = area.querySelector('[data-filter-type]');
    const cards = list ? Array.from(list.querySelectorAll('.movie-card')) : [];

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      const keyword = normalize(keywordInput ? keywordInput.value : '');
      const year = normalize(yearSelect ? yearSelect.value : '');
      const type = normalize(typeSelect ? typeSelect.value : '');
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize(card.getAttribute('data-search'));
        const cardYear = normalize(card.getAttribute('data-year'));
        const cardType = normalize(card.getAttribute('data-type'));
        const matched = (!keyword || haystack.includes(keyword)) && (!year || cardYear === year) && (!type || cardType === type);
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [keywordInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q && keywordInput) {
      keywordInput.value = q;
    }
    applyFilters();
  });
})();
