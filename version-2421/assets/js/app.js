(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initHeader() {
    var header = document.querySelector("[data-site-header]");
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (header) {
      var updateHeader = function () {
        header.classList.toggle("is-scrolled", window.scrollY > 40);
      };
      updateHeader();
      window.addEventListener("scroll", updateHeader, { passive: true });
    }

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video[data-src]");
      var button = player.querySelector("[data-player-start]");
      var message = player.querySelector("[data-player-message]");
      var started = false;
      var hls = null;

      if (!video || !button) {
        return;
      }

      function showMessage(text) {
        if (message) {
          message.textContent = text;
        }
      }

      function playWhenReady() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            showMessage("浏览器阻止了自动播放，请再次点击播放器开始观看。");
          });
        }
      }

      function startPlayback() {
        if (started) {
          playWhenReady();
          return;
        }

        var src = video.getAttribute("data-src");
        if (!src) {
          showMessage("播放源暂不可用。");
          return;
        }

        started = true;
        button.classList.add("is-loading");
        showMessage("");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          video.addEventListener("loadedmetadata", function () {
            button.classList.add("is-hidden");
            playWhenReady();
          }, { once: true });
          video.load();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            button.classList.add("is-hidden");
            playWhenReady();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage("视频加载失败，请稍后重试或更换网络环境。");
              button.classList.remove("is-loading");
              started = false;
              if (hls) {
                hls.destroy();
                hls = null;
              }
            }
          });
          return;
        }

        showMessage("当前浏览器暂不支持 HLS 播放。");
        button.classList.remove("is-loading");
        started = false;
      }

      button.addEventListener("click", startPlayback);
      video.addEventListener("click", function () {
        if (!started || video.paused) {
          startPlayback();
        }
      });
    });
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.MOVIE_DATA) {
      return;
    }

    var input = document.getElementById("movie-search-input");
    var region = document.getElementById("movie-region-filter");
    var type = document.getElementById("movie-type-filter");
    var year = document.getElementById("movie-year-filter");
    var results = document.getElementById("movie-search-results");
    var status = document.getElementById("movie-search-status");
    var movies = window.MOVIE_DATA;

    function includes(text, query) {
      return String(text || "").toLowerCase().indexOf(query) !== -1;
    }

    function card(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="movie-card-link" href="' + escapeHtml(movie.url) + '" title="' + escapeHtml(movie.title) + '">',
        '    <figure class="movie-thumb">',
        '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 封面" loading="lazy">',
        '      <span class="badge badge-primary">' + escapeHtml(movie.primaryGenre || movie.type) + '</span>',
        '      <span class="badge badge-dark">' + escapeHtml(movie.year) + '</span>',
        '      <span class="play-float" aria-hidden="true">▶</span>',
        '    </figure>',
        '    <div class="movie-card-body">',
        '      <h3>' + escapeHtml(movie.title) + '</h3>',
        '      <p>' + escapeHtml(movie.oneLine) + '</p>',
        '      <div class="movie-card-meta">',
        '        <span>' + escapeHtml(movie.region) + '</span>',
        '        <span>' + escapeHtml(movie.type) + '</span>',
        '      </div>',
        '      <div class="movie-card-genre">' + escapeHtml(movie.genre) + '</div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join("\n");
    }

    function render() {
      var query = String(input.value || "").trim().toLowerCase();
      var regionValue = region.value;
      var typeValue = type.value;
      var yearValue = year.value;
      var filtered = movies.filter(function (movie) {
        var matchesQuery = !query ||
          includes(movie.title, query) ||
          includes(movie.oneLine, query) ||
          includes(movie.genre, query) ||
          includes(movie.tags, query) ||
          includes(movie.region, query) ||
          includes(movie.type, query);
        var matchesRegion = !regionValue || movie.region === regionValue;
        var matchesType = !typeValue || movie.type === typeValue;
        var matchesYear = !yearValue || String(movie.year) === String(yearValue);
        return matchesQuery && matchesRegion && matchesType && matchesYear;
      });
      var visible = filtered.slice(0, 96);
      results.innerHTML = visible.map(card).join("\n");
      status.textContent = "共找到 " + filtered.length + " 部，当前显示 " + visible.length + " 部。";
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });

    render();
  }

  onReady(function () {
    initHeader();
    initHero();
    initPlayers();
    initSearchPage();
  });
})();
