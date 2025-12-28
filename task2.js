(() => {
  const layers = Array.from(document.querySelectorAll("[data-depth]"));
  const astronaut = document.querySelector(".astronaut");
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  const hero = document.querySelector(".hero");
  const heroBg = document.querySelector(".hero-space");
  const heroCopy = document.querySelector(".hero-copy");
  const heroTypes = Array.from(document.querySelectorAll(".hero-type"));
  const sections = Array.from(document.querySelectorAll(".section"));
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let ticking = false;

  const applyParallax = () => {
    const disable = reduceMotionQuery.matches;
    const scrollY = window.scrollY;

    layers.forEach((layer) => {
      const depth = parseFloat(layer.dataset.depth) || 0;

      if (disable) {
        if (layer.classList.contains("astronaut")) {
          layer.style.transform = "translate3d(0, 0, 0)";
        } else {
          layer.style.setProperty("--parallax-y", "0px");
        }
        return;
      }

      if (layer.classList.contains("astronaut")) {
        const speed = depth || 0.08;
        const rawOffset = scrollY * speed;
        const lastSection = sections[sections.length - 1];
        const stopPoint = lastSection
          ? Math.max(
              0,
              lastSection.offsetTop + lastSection.offsetHeight - window.innerHeight * 0.95
            )
          : rawOffset;
        const clamped = Math.min(rawOffset, stopPoint);
        layer.style.transform = `translate3d(0, ${clamped}px, 0)`;
        return;
      }

      const section = layer.dataset.global ? document.body : (layer.closest(".hero, .section") || document.body);
      const sectionTop = section.offsetTop || 0;
      const sectionHeight = layer.dataset.global
        ? Math.max(document.documentElement.scrollHeight, window.innerHeight)
        : section.offsetHeight || window.innerHeight;
      const within = scrollY - sectionTop;
      const rawOffset = -within * depth;
      const maxShift = sectionHeight * 0.25;
      const clampedOffset = Math.max(Math.min(rawOffset, maxShift), -maxShift);

      layer.style.setProperty("--parallax-y", `${clampedOffset}px`);
    });

    if (hero && heroBg) {
      if (disable) {
        heroBg.style.setProperty("--section-scale", "1");
        heroBg.style.setProperty("--section-opacity", "1");
        if (heroCopy) heroCopy.style.setProperty("--hero-opacity", "1");
      } else {
        const heroHeight = hero.offsetHeight || window.innerHeight;
        const progress = Math.min(Math.max(scrollY / heroHeight, 0), 1);
        const startScale = 1.3;
        const endScale = 0.6;
        const scale = startScale - progress * (startScale - endScale);
        const fade = Math.max(1 - progress * 1.4, 0);
        heroBg.style.setProperty("--section-scale", scale.toFixed(3));
        heroBg.style.setProperty("--section-opacity", fade.toFixed(3));
        if (heroCopy) {
          heroCopy.style.setProperty("--hero-opacity", fade.toFixed(3));
        }
      }
    }

    ticking = false;
  };

  const observeReveals = () => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            entry.target.classList.remove("hide");
            if (entry.target.classList.contains("hero-copy")) {
              heroTypes.forEach((el) => {
                if (el.dataset.typed === "done") return;
                const full = el.dataset.fulltext || el.textContent;
                el.dataset.fulltext = full;
                el.textContent = "";
                let idx = 0;
                const speed = 120;
                const step = () => {
                  if (idx <= full.length) {
                    el.textContent = full.slice(0, idx);
                    idx += 1;
                    setTimeout(step, speed);
                  } else {
                    el.dataset.typed = "done";
                  }
                };
                step();
              });
            }
          } else {
            entry.target.classList.remove("show");
            entry.target.classList.add("hide");
          }
        });
      },
      { threshold: 0.25 }
    );

    reveals.forEach((el) => obs.observe(el));
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(applyParallax);
      ticking = true;
    }
  };

  document.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", applyParallax);
  if (reduceMotionQuery.addEventListener) {
    reduceMotionQuery.addEventListener("change", applyParallax);
  } else if (reduceMotionQuery.addListener) {
    reduceMotionQuery.addListener(applyParallax);
  }

  observeReveals();
  applyParallax();
})();
