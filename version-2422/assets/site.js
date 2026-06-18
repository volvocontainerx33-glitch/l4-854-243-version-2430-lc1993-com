(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", menu.classList.contains("is-open"));
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function initCardsFilter() {
    var filter = document.querySelector("[data-card-filter]");
    var searchInput = document.querySelector("[data-search-input]");
    var text = document.querySelector("[data-filter-text]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (!cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (searchInput && initial) {
      searchInput.value = initial;
    }
    if (filter && initial) {
      filter.value = initial;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(filter ? filter.value : initial);
      if (!keyword && searchInput) {
        keyword = normalize(searchInput.value);
      }
      var matched = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year"),
          card.getAttribute("data-category"),
          card.textContent
        ].join(" "));
        var visible = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle("is-hidden", !visible);
        if (visible) {
          matched += 1;
        }
      });
      if (text) {
        text.textContent = keyword ? "已筛选匹配内容" : "输入关键词筛选当前列表";
      }
    }

    if (filter) {
      filter.addEventListener("input", apply);
    }
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        if (filter) {
          filter.value = searchInput.value;
        }
        apply();
      });
    }
    apply();
  }

  function initPlayer() {
    var root = document.querySelector("[data-player]");
    if (!root) {
      return;
    }
    var video = root.querySelector("video");
    var button = root.querySelector("[data-player-button]");
    var source = root.getAttribute("data-video-url");
    var hlsInstance = null;
    var loaded = false;
    if (!video || !button || !source) {
      return;
    }

    function attachSource() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function begin() {
      attachSource();
      button.classList.add("is-hidden");
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", begin);
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        begin();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initCardsFilter();
    initPlayer();
  });
})();
