if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });

    fetch("/current-version.txt", { cache: "no-store" }).catch(() => {});

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "SW_UPDATED") {
        console.log("Newer version cached in background — next reload will use it.");
      }
    });
  });
}
