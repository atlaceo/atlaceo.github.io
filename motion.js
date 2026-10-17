'use strict';
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const wideScreen = matchMedia('(min-width: 761px)');
  const root = document.documentElement;
  const art = document.querySelector('.hero-art');
  const hero = document.querySelector('.hero');
  const targets = [...document.querySelectorAll('.section-top, .project, .honest-note, .services > .eyebrow, .service-row, .steps article, .contact')];
  let observer;
  let frame = 0;
  function updateScroll() {
    frame = 0;
    if (reduceMotion.matches) return;
    const distance = root.scrollHeight - root.clientHeight;
    root.style.setProperty('--scroll-progress', distance > 0 ? String(Math.min(1, Math.max(0, scrollY / distance))) : '0');
    if (art && hero) {
      const offset = wideScreen.matches ? Math.min(Math.max(scrollY, 0), hero.offsetHeight) * 0.15 : 0;
      art.style.setProperty('--parallax', offset.toFixed(1) + 'px');
    }
  }
  function scheduleScroll() {
    if (!frame && !reduceMotion.matches) frame = requestAnimationFrame(updateScroll);
  }
  function configureMotion() {
    observer?.disconnect();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    document.body.classList.remove('motion-ready');
    targets.forEach(target => { target.removeAttribute('data-reveal'); target.classList.remove('is-visible'); });
    if (reduceMotion.matches) {
      root.style.removeProperty('--scroll-progress');
      art?.style.removeProperty('--parallax');
      return;
    }
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });
      targets.forEach(target => {
        target.setAttribute('data-reveal', '');
        const siblings = target.matches('.project, .steps article') ? [...target.parentElement.children].indexOf(target) : 0;
        target.style.setProperty('--reveal-delay', wideScreen.matches ? (siblings % 3) * 90 + 'ms' : '0ms');
        // A page opened at an anchor must not hide earlier sections.
        if (target.getBoundingClientRect().top < innerHeight - 30) target.classList.add('is-visible');
        else observer.observe(target);
      });
      document.body.classList.add('motion-ready');
    }
    updateScroll();
  }
  addEventListener('scroll', scheduleScroll, {passive:true});
  addEventListener('resize', scheduleScroll, {passive:true});
  reduceMotion.addEventListener('change', configureMotion);
  wideScreen.addEventListener('change', configureMotion);
  // Keyboard navigation always reveals its destination immediately.
  document.addEventListener('focusin', event => {
    const target = event.target.closest('[data-reveal]');
    if (target) { target.classList.add('is-visible'); observer?.unobserve(target); }
  });
  configureMotion();
})();
