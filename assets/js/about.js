export function initPage() {
  console.log("about.js loaded");

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  const selectors = [
    '.blog-text',
    '.about-intro__left',
    '.about-intro__middle',
    '.about-intro__right',
    '.timeline-item',
    '.booking-form',
    '.about-hero__content',
    '.about-hero__left h1'
  ];

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      observer.observe(el);
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
      if (inView) {
        el.classList.add('visible');
        observer.unobserve(el);
      }
    });
  });
}
