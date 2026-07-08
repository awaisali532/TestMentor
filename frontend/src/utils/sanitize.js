// File Path: src/utils/sanitize.js

export const sanitizeHTML = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");

  // 1. Remove script tags
  const scripts = doc.querySelectorAll("script");
  scripts.forEach((s) => s.remove());

  // 2. Remove dangerous inline events (like onerror, onclick)
  const allElements = doc.querySelectorAll("*");
  allElements.forEach((el) => {
    for (let i = el.attributes.length - 1; i >= 0; i--) {
      const attr = el.attributes[i].name;
      if (attr.startsWith("on")) {
        el.removeAttribute(attr);
      }
    }
  });

  return doc.body.innerHTML;
};
