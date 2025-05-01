document.addEventListener("DOMContentLoaded", () => {
  const dateElement = document.getElementById("currentDate");
  if (dateElement) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const today = new Date().toLocaleDateString(undefined, options);
    dateElement.textContent = today;
  }
});
