(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function getHls(callback) {
        if (window.Hls) {
            callback(window.Hls);
            return;
        }
        var used = false;
        function done() {
            if (!used && window.Hls) {
                used = true;
                callback(window.Hls);
            }
        }
        window.addEventListener("hls-ready", done, { once: true });
        setTimeout(done, 1200);
    }

    ready(function () {
        document.querySelectorAll("[data-player]").forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector("[data-play-button]");
            var stream = shell.getAttribute("data-stream");
            var started = false;
            var instance = null;

            function playVideo() {
                if (!video) {
                    return;
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            }

            function begin() {
                if (started || !stream || !video) {
                    return;
                }
                started = true;
                if (button) {
                    button.classList.add("is-hidden");
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    playVideo();
                    return;
                }

                getHls(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        instance = new Hls({ enableWorker: true, lowLatencyMode: true });
                        instance.loadSource(stream);
                        instance.attachMedia(video);
                        instance.on(Hls.Events.MANIFEST_PARSED, playVideo);
                    } else {
                        video.src = stream;
                        playVideo();
                    }
                });
            }

            if (button) {
                button.addEventListener("click", begin);
            }

            shell.addEventListener("click", function (event) {
                if (!started && event.target !== video) {
                    begin();
                }
            });

            video.addEventListener("click", function () {
                if (!started) {
                    begin();
                }
            });

            window.addEventListener("pagehide", function () {
                if (instance && typeof instance.destroy === "function") {
                    instance.destroy();
                }
            });
        });
    });
})();
