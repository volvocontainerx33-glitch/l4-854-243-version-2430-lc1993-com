(function () {
  var hlsPromise = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsPromise) {
      return hlsPromise;
    }

    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js";
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsPromise;
  }

  function initHeader() {
    var header = document.querySelector("[data-header]");
    if (!header) {
      return;
    }

    function updateHeader() {
      header.classList.toggle("is-scrolled", window.scrollY > 16);
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  function initNavigation() {
    var button = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      button.classList.toggle("is-open");
    });
  }

  function initHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
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
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    start();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function applyFilter(input, cards, emptyState) {
    var query = normalize(input.value);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search"));
      var matched = !query || text.indexOf(query) !== -1;
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  function initLocalSearch() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-local-search]"));
    if (!panels.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    panels.forEach(function (panel) {
      var input = panel.querySelector("input[type='search']");
      var form = panel.tagName.toLowerCase() === "form" ? panel : panel.querySelector("form");
      var scopeSelector = panel.getAttribute("data-local-search") || "body";
      var scope = document.querySelector(scopeSelector) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var emptyState = document.querySelector("[data-empty-state]");

      if (!input || !cards.length) {
        return;
      }

      if (initial) {
        input.value = initial;
      }

      input.addEventListener("input", function () {
        applyFilter(input, cards, emptyState);
      });

      if (form) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          applyFilter(input, cards, emptyState);
          var url = new URL(window.location.href);
          if (input.value.trim()) {
            url.searchParams.set("q", input.value.trim());
          } else {
            url.searchParams.delete("q");
          }
          window.history.replaceState(null, "", url.toString());
        });
      }

      applyFilter(input, cards, emptyState);
    });
  }

  function initPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-card"));
    if (!players.length) {
      return;
    }

    players.forEach(function (card) {
      var video = card.querySelector("video");
      var button = card.querySelector(".play-button");
      var overlay = card.querySelector(".player-overlay");
      var message = card.querySelector(".player-message");
      if (!video || !button) {
        return;
      }

      var stream = video.getAttribute("data-stream") || button.getAttribute("data-stream");
      if (!stream) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || "";
        }
      }

      function beginPlayback() {
        card.classList.add("is-playing");
        video.setAttribute("controls", "controls");
        setMessage("正在加载高清影片…");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (!video.src) {
            video.src = stream;
          }
          video.play().then(function () {
            setMessage("");
          }).catch(function () {
            setMessage("点击视频画面继续播放");
          });
          return;
        }

        loadHlsLibrary().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            if (!video.__hlsPlayer) {
              var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
              });
              hls.loadSource(stream);
              hls.attachMedia(video);
              hls.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play().then(function () {
                  setMessage("");
                }).catch(function () {
                  setMessage("点击视频画面继续播放");
                });
              });
              video.__hlsPlayer = hls;
            } else {
              video.play().catch(function () {
                setMessage("点击视频画面继续播放");
              });
            }
          } else {
            setMessage("播放暂时不可用，请稍后再试。");
            card.classList.remove("is-playing");
          }
        }).catch(function () {
          setMessage("播放暂时不可用，请稍后再试。");
          card.classList.remove("is-playing");
        });
      }

      button.addEventListener("click", function (event) {
        event.preventDefault();
        beginPlayback();
      });

      if (overlay) {
        overlay.addEventListener("click", function (event) {
          if (event.target !== button) {
            beginPlayback();
          }
        });
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          video.play().catch(function () {});
        }
      });
    });
  }

  ready(function () {
    initHeader();
    initNavigation();
    initHeroCarousel();
    initLocalSearch();
    initPlayer();
  });
})();
