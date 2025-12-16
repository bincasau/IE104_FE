document.addEventListener("DOMContentLoaded", () => {
  /* Hiệu ứng parallax nhẹ theo chuyển động chuột */
  document.addEventListener("mousemove", (e) => {
    const shapes = document.querySelectorAll(".shape");

    const xRatio = e.clientX / window.innerWidth;
    const yRatio = e.clientY / window.innerHeight;

    shapes.forEach((shape, index) => {
      const speed = (index + 1) * 20;
      shape.style.transform = `translate(${xRatio * speed}px, ${
        yRatio * speed
      }px) rotate(${index * 45}deg)`;
    });
  });
});
