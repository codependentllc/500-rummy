export function registerPwa() {
  if (!("serviceWorker" in navigator) || !import.meta.env.PROD) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then((registration) => {
      function notifyUpdateReady() {
        window.dispatchEvent(new CustomEvent("pwa:update-ready"));
      }

      if (registration.waiting) {
        notifyUpdateReady();
      }

      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;

        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            notifyUpdateReady();
          }
        });
      });
    }).catch((error) => {
      console.warn("PWA service worker registration failed", error);
    });
  });
}
