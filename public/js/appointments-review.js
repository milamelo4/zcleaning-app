document.addEventListener("DOMContentLoaded", () => {
  // --------- Handle form submission and price/notes updates ---------
  const form = document.getElementById("postScheduleForm");
  const appointmentsInput = document.getElementById("appointmentsInput");
  let appointments = [];

  if (form && appointmentsInput) {
    const raw = form.dataset.appointments;

    if (raw && raw.trim()) {
      try {
        appointments = JSON.parse(raw);
      } catch (err) {
        console.error("Failed to parse appointments JSON:", err.message);
        appointments = [];
      }
    }

    form.addEventListener("submit", (e) => {
      const prices = document.querySelectorAll(".price-input");
      const notes = document.querySelectorAll(".notes-input");

      prices.forEach((input) => {
        const index = parseInt(input.dataset.index);
        if (!isNaN(index)) {
          appointments[index].price = parseFloat(input.value) || 0;
        }
      });

      notes.forEach((input) => {
        const index = parseInt(input.dataset.index);
        if (!isNaN(index)) {
          appointments[index].notes = input.value;
        }
      });

      appointmentsInput.value = JSON.stringify(appointments);
    });
  }

  // --------- Shared DOM elements ---------
  const searchInput = document.getElementById("searchInput");
  const dateInput = document.getElementById("dateInput");
  const rows = document.querySelectorAll("tbody tr");

  // --------- Handle client name search filter ---------
  if (searchInput && rows.length > 0) {
    searchInput.addEventListener("keyup", () => {
      const filter = searchInput.value.toLowerCase();

      rows.forEach((row) => {
        const clientName =
          row.querySelector("td")?.textContent?.toLowerCase() || "";

        row.style.display =
          clientName && clientName.includes(filter) ? "" : "none";
      });
    });
  }

  // --------- Handle search by date ---------
  if (dateInput && rows.length > 0) {
    dateInput.addEventListener("change", () => {
      const selectedDate = dateInput.value;

      rows.forEach((row) => {
        const apptDate = row.querySelectorAll("td")[1]?.textContent.trim();
        row.style.display =
          selectedDate && !apptDate.includes(selectedDate) ? "none" : "";
      });
    });
  }
});
