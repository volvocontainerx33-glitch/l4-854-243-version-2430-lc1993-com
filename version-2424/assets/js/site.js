(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
                document.body.classList.toggle("menu-open", mobileNav.classList.contains("open"));
            });
        }

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                });
            });

            if (slides.length > 1) {
                setInterval(function () {
                    show(current + 1);
                }, 5200);
            }
        });

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var searchInput = scope.querySelector("[data-search-input]") || document.querySelector("[data-search-input]");
            var regionFilter = scope.querySelector("[data-region-filter]");
            var yearFilter = scope.querySelector("[data-year-filter]");
            var sortSelect = scope.querySelector("[data-sort-select]");
            var grid = scope.querySelector("[data-card-grid]") || scope.querySelector(".movie-grid") || document.querySelector("[data-card-grid]");
            var result = scope.querySelector("[data-filter-result]");

            if (!grid) {
                return;
            }

            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card, .ranking-item"));

            function cardText(card) {
                return normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" "));
            }

            function applyFilters() {
                var keyword = normalize(searchInput && searchInput.value);
                var region = normalize(regionFilter && regionFilter.value);
                var year = normalize(yearFilter && yearFilter.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var matched = true;
                    if (keyword && cardText(card).indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (region && normalize(card.getAttribute("data-region")) !== region) {
                        matched = false;
                    }
                    if (year && normalize(card.getAttribute("data-year")) !== year) {
                        matched = false;
                    }
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });

                if (result) {
                    result.textContent = visible ? "已筛选出相关影片" : "没有匹配到影片";
                    result.classList.toggle("active", Boolean(keyword || region || year));
                }
            }

            function applySort() {
                if (!sortSelect || !grid) {
                    return;
                }
                var mode = sortSelect.value;
                var sorted = cards.slice();
                if (mode === "year-desc") {
                    sorted.sort(function (a, b) {
                        return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                    });
                }
                if (mode === "title-asc") {
                    sorted.sort(function (a, b) {
                        return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-CN");
                    });
                }
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
                cards = sorted;
                applyFilters();
            }

            if (searchInput) {
                searchInput.addEventListener("input", applyFilters);
            }
            if (regionFilter) {
                regionFilter.addEventListener("change", applyFilters);
            }
            if (yearFilter) {
                yearFilter.addEventListener("change", applyFilters);
            }
            if (sortSelect) {
                sortSelect.addEventListener("change", applySort);
            }
        });
    });
})();
