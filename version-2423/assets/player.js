(function () {
  var shell = document.querySelector('.player-shell[data-stream]');

  if (!shell) {
    return;
  }

  var video = shell.querySelector('.movie-video');
  var cover = shell.querySelector('.player-cover');
  var stream = shell.getAttribute('data-stream');
  var ready = false;
  var loading = null;

  function loadScript() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve();
        return;
      }

      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function prepare() {
    if (ready) {
      return Promise.resolve();
    }

    if (loading) {
      return loading;
    }

    loading = new Promise(function (resolve, reject) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        ready = true;
        resolve();
        return;
      }

      loadScript().then(function () {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            ready = true;
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                hls.destroy();
                reject(data);
              }
            }
          });
        } else {
          video.src = stream;
          ready = true;
          resolve();
        }
      }).catch(reject);
    });

    return loading;
  }

  function playMovie() {
    if (cover) {
      cover.classList.add('is-hidden');
    }

    prepare().then(function () {
      var action = video.play();

      if (action && action.catch) {
        action.catch(function () {});
      }
    }).catch(function () {
      video.src = stream;
      var action = video.play();

      if (action && action.catch) {
        action.catch(function () {});
      }
    });
  }

  if (cover) {
    cover.addEventListener('click', playMovie);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playMovie();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });
})();
