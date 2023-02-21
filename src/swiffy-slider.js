const swiffyslider = function() {
    return {
        version: "1.6.0",
        init(rootElement = document.body) {
            rootElement.querySelectorAll(".swiffy-slider").forEach(sliderElement => this.initSlider(sliderElement));
        },

        initSlider(sliderElement) {
            sliderElement.querySelectorAll(".slider-nav").forEach(navElement =>
                navElement.addEventListener("click", () => this.slide(sliderElement, navElement.classList.contains("slider-nav-next")), { passive: true })
            );
            sliderElement.querySelectorAll(".slider-indicators").forEach((indicatorElement) => {
                indicatorElement.addEventListener("click", (e) => this.slideToByIndicator(e));
                this.onSlideEnd(sliderElement, () => this.handleIndicators(sliderElement), 60);
            });
            if (sliderElement.classList.contains("slider-nav-autoplay")) {
                const timeout = sliderElement.getAttribute("data-slider-nav-autoplay-interval") ? sliderElement.getAttribute("data-slider-nav-autoplay-interval") : 2500;
                this.autoPlay(sliderElement, timeout, sliderElement.classList.contains("slider-nav-autopause"));
            }
            if (["slider-nav-autohide", "slider-nav-animation"].some(className => sliderElement.classList.contains(className))) {
                const threshold = sliderElement.getAttribute("data-slider-nav-animation-threshold") ? sliderElement.getAttribute("data-slider-nav-animation-threshold") : 0.3;
                this.setVisibleSlides(sliderElement, threshold);
            }
        },

        setVisibleSlides(sliderElement, threshold = 0.3) {
            let observer = new IntersectionObserver(slides => {
                slides.forEach(slide => {
                    slide.isIntersecting ? slide.target.classList.add("slide-visible") : slide.target.classList.remove("slide-visible");
                });
                sliderElement.querySelector(".slider-container>*:first-child").classList.contains("slide-visible") ? sliderElement.classList.add("slider-item-first-visible") : sliderElement.classList.remove("slider-item-first-visible");
                sliderElement.querySelector(".slider-container>*:last-child").classList.contains("slide-visible") ? sliderElement.classList.add("slider-item-last-visible") : sliderElement.classList.remove("slider-item-last-visible");
            }, {
                root: sliderElement.querySelector(".slider-container"),
                threshold: threshold
            });
            this.getSlides(sliderElement.querySelectorAll(".slider-container>*")).forEach(slide => observer.observe(slide));
        },

        slide(sliderElement, next = true) {
            const container = sliderElement.querySelector(".slider-container");
            const fullpage = sliderElement.classList.contains("slider-nav-page");
            const noloop = sliderElement.classList.contains("slider-nav-noloop");
            const nodelay = sliderElement.classList.contains("slider-nav-nodelay");
            const slides = this.getSlides(container);
            const gapWidth = parseInt(window.getComputedStyle(container).columnGap);
            const scrollStep = slides[0].offsetWidth + gapWidth;
            let scrollLeftPosition = next ?
                container.scrollLeft + scrollStep :
                container.scrollLeft - scrollStep;
            if (fullpage) {
                scrollLeftPosition = next ?
                    container.scrollLeft + container.offsetWidth :
                    container.scrollLeft - container.offsetWidth;
            }
            if (container.scrollLeft < 1 && !next && !noloop)
                scrollLeftPosition = (container.scrollWidth - container.offsetWidth);
            if (container.scrollLeft >= (container.scrollWidth - container.offsetWidth) && next && !noloop)
                scrollLeftPosition = 0;
            container.scroll({
                left: scrollLeftPosition,
                behavior: nodelay ? "auto" : "smooth"
            });
        },

        slideToByIndicator(event) {
            const indicator = event.target.closest('.slider-indicator') ?? event.target;
            const indicatorIndex = this.getIndicators(indicator.parentElement).indexOf(indicator);
            const indicatorCount = this.getIndicators(indicator.parentElement).length;
            const sliderElement = indicator.closest(".swiffy-slider");
            const slideCount = this.getSlides(sliderElement.querySelector(".slider-container")).length;
            const relativeSlideIndex = (slideCount / indicatorCount) * indicatorIndex;
            this.slideTo(sliderElement, relativeSlideIndex);
        },

        slideTo(sliderElement, slideIndex) {
            const container = sliderElement.querySelector(".slider-container");
            const gapWidth = parseInt(window.getComputedStyle(container).columnGap);
            const scrollStep = this.getSlides(container)[0].offsetWidth + gapWidth;
            const nodelay = sliderElement.classList.contains("slider-nav-nodelay");
            container.scroll({
                left: (scrollStep * slideIndex),
                behavior: nodelay ? "auto" : "smooth"
            });
        },

        onSlideEnd(sliderElement, delegate, timeout = 125) {
            let isScrolling;
            sliderElement.querySelector(".slider-container").addEventListener("scroll", () => {
                window.clearTimeout(isScrolling);
                isScrolling = setTimeout(delegate, timeout);
            }, { capture: false, passive: true });
        },

        autoPlay(sliderElement, timeout, autopause) {
            timeout = timeout < 750 ? 750 : timeout;
            let autoplayTimer = setInterval(() => this.slide(sliderElement), timeout);
            const autoplayer = () => this.autoPlay(sliderElement, timeout, autopause);
            if (autopause) {
                ["mouseover", "touchstart"].forEach((event) => {
                    sliderElement.addEventListener(event, () => {
                        window.clearTimeout(autoplayTimer);
                    }, { once: true, passive: true });
                });
                ["mouseout", "touchend"].forEach((event) => {
                    sliderElement.addEventListener(event, () => {
                        autoplayer();
                    }, { once: true, passive: true });
                });
            }
            return autoplayTimer;
        },

        getSlides(sliderElement) {
            return Array.from(sliderElement.children).filter(element => element.tagName.toLowerCase() !== "template")
        },

        getIndicators(indicator) {
            return Array.from(indicator.children).filter(element => element.tagName.toLowerCase() !== "template")
        },

        handleIndicators(sliderElement) {
            if (!sliderElement) return;
            const container = sliderElement.querySelector(".slider-container");
            const slidingAreaWidth = container.scrollWidth - container.offsetWidth;
            const percentSlide = (container.scrollLeft / slidingAreaWidth);
            sliderElement.querySelectorAll(".slider-indicators").forEach((scrollIndicatorContainers) => {
                let scrollIndicators = this.getIndicators(scrollIndicatorContainers);
                let activeIndicator = Math.abs(Math.round((scrollIndicators.length - 1) * percentSlide));
                for (let element of scrollIndicators)
                    element.classList.remove("active");
                scrollIndicators[activeIndicator].classList.add("active");
            });
        }
    };
}();

window.swiffyslider = swiffyslider;
if (!document.currentScript.hasAttribute("data-noinit")) {
    if (document.currentScript.hasAttribute("defer")) {
        swiffyslider.init();
    } else {
        document.onreadystatechange = () => {
            if (document.readyState === 'interactive') {
                swiffyslider.init();
            }
        }
    }
}
