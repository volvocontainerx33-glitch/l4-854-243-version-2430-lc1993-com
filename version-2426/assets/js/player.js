(function () {
  const video = document.querySelector('[data-player-video]');
  const playButton = document.querySelector('[data-play-button]');
  const wrap = document.querySelector('[data-player-wrap]');

  if (!video || !playButton) {
    return;
  }

  const stream = video.getAttribute('data-stream');
  let attached = false;
  let hls = null;

  function attachStream() {
    if (attached) {
      return Promise.resolve();
    }

    if (!stream) {
      return Promise.reject(new Error('empty stream'));
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      attached = true;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      attached = true;
      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        window.setTimeout(resolve, 1200);
      });
    }

    video.src = stream;
    attached = true;
    return Promise.resolve();
  }

  function beginPlay() {
    attachStream().then(function () {
      playButton.classList.add('is-hidden');
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          playButton.classList.remove('is-hidden');
        });
      }
    }).catch(function () {
      playButton.classList.remove('is-hidden');
    });
  }

  playButton.addEventListener('click', beginPlay);

  if (wrap) {
    wrap.addEventListener('click', function (event) {
      if (event.target === video && video.paused) {
        beginPlay();
      }
    });
  }

  video.addEventListener('play', function () {
    playButton.classList.add('is-hidden');
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      playButton.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
