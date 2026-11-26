// Warm-up for the free Render apps.
// Render's free plan puts an app to sleep after 15 minutes without traffic, and waking it takes up to a minute.
// As soon as the portfolio opens, this sends each app one cheap request, so the apps are already waking
// while the visitor reads the page. The "Live app" buttons can then link straight to the apps.
// mode "no-cors" means the browser sends the request and ignores the answer, which is all we need.
(function () {
  var apps = [
    "https://inventory-api-jl5m.onrender.com/v3/api-docs",
    "https://log-analyzer-vjuz.onrender.com/"
  ];
  apps.forEach(function (url) {
    try {
      fetch(url, { mode: "no-cors", cache: "no-store" }).catch(function () {});
    } catch (e) { /* ignore */ }
  });
})();
