const setSectionsHeight = () => {
  Array.from(document.querySelectorAll(".js-section")).forEach((el) => {
    el.style.setProperty("--section-height", `${el.offsetHeight}px`);
  });
};

const observer = new ResizeObserver((entries) => {
  entries.forEach(setSectionsHeight);
});

observer.observe(document.body);
