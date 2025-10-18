document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".carousel");
  const slides = document.querySelectorAll(".slide");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");

  const slideWidth = 900 + 20;
  let currentIndex = 2;

  function setActiveClasses() {
    slides.forEach((s) => s.classList.remove("active", "side"));
    slides[currentIndex].classList.add("active");
    if (slides[currentIndex - 1]) slides[currentIndex - 1].classList.add("side");
    if (slides[currentIndex + 1]) slides[currentIndex + 1].classList.add("side");
  }

  function updatePosition() {
    const center = window.innerWidth / 2 + 900;
    const offset = -currentIndex * slideWidth + center;
    carousel.style.transform = `translateX(${offset}px)`;
    setActiveClasses();
  }

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updatePosition();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentIndex < slides.length - 1) {
      currentIndex++;
      updatePosition();
    }
  });

  window.addEventListener("resize", updatePosition);
  updatePosition();
});


