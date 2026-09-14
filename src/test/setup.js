import "@testing-library/jest-dom";

// jsdom no implementa window.matchMedia; varios hooks del proyecto
// (usePreferredTheme) lo llaman sin optional chaining dentro de un
// useEffect, lo que revienta con "matchMedia is not a function" si no
// se provee un stub mínimo.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
