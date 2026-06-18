document.addEventListener("DOMContentLoaded", function () {
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  var slides = Array.from(document.querySelectorAll(".hero-slide"));
  var dots = Array.from(document.querySelectorAll(".hero-dot"));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var filterWrap = document.querySelector("[data-filter-wrap]");

  if (filterWrap) {
    var searchInput = filterWrap.querySelector("[data-filter-input]");
    var regionSelect = filterWrap.querySelector("[data-region-select]");
    var yearSelect = filterWrap.querySelector("[data-year-select]");
    var cards = Array.from(document.querySelectorAll("[data-title]"));
    var emptyState = document.querySelector("[data-empty-state]");

    function filterCards() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var region = regionSelect ? regionSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-category")
        ].join(" ").toLowerCase();
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesRegion = !region || card.getAttribute("data-region") === region;
        var matchesYear = !year || card.getAttribute("data-year") === year;
        var isVisible = matchesKeyword && matchesRegion && matchesYear;
        card.classList.toggle("hide-card", !isVisible);
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("show", visibleCount === 0);
      }
    }

    [searchInput, regionSelect, yearSelect].forEach(function (node) {
      if (node) {
        node.addEventListener("input", filterCards);
        node.addEventListener("change", filterCards);
      }
    });
  }
});

window.MoviePlayer = {
  init: function (videoId, overlayId, url) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hlsInstance = null;
    var attached = false;

    if (!video || !overlay || !url) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function playVideo() {
      attachStream();
      overlay.classList.add("hidden");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    attachStream();

    overlay.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("hidden");
    });
    video.addEventListener("ended", function () {
      overlay.classList.remove("hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
};
