var hlsLoader = null;

function loadHlsLibrary() {
  if (window.Hls) {
    return Promise.resolve(window.Hls);
  }

  if (!hlsLoader) {
    hlsLoader = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error('hls'));
      };
      document.head.appendChild(script);
    });
  }

  return hlsLoader;
}

export function initPlayer(videoId, buttonId, overlayId, sourceUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var overlay = document.getElementById(overlayId);
  var attached = false;
  var hlsInstance = null;

  if (!video || !sourceUrl) {
    return;
  }

  function revealControls() {
    video.controls = true;
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function attachSource() {
    if (attached) {
      return Promise.resolve();
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return Promise.resolve();
    }

    return loadHlsLibrary().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }).catch(function () {
      video.src = sourceUrl;
    });
  }

  function startPlayback(event) {
    if (event) {
      event.preventDefault();
    }

    revealControls();
    attachSource().then(function () {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          video.controls = true;
        });
      }
    });
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  if (overlay && overlay !== button) {
    overlay.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
