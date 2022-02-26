export const scrollToTop = (offset = 0) => {
  window.scrollTo({
    top: offset,
    behavior: "smooth",
  });
};
