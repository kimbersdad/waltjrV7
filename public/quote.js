window.addEventListener("load", () => {
  console.log("✅ quote.js loaded successfully");

  const testBanner = document.createElement("div");
  testBanner.innerHTML = "<h2 style='color: green;'>✅ Walt Jr. script is running!</h2>";
  document.body.appendChild(testBanner);
});
