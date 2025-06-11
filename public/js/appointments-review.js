document.addEventListener("DOMContentLoaded", () => {
  // --------- Handle form submission for database save ---------
  const form = document.getElementById("postScheduleForm");
  const appointmentsInput = document.getElementById("appointmentsInput");

  if (form && appointmentsInput) {
    form.addEventListener("submit", () => {
      const appointments = [];

      // Collect scheduled appointments
      const calendarCells = document.querySelectorAll("td[data-date]");
      calendarCells.forEach((cell) => {
        const date = cell.getAttribute("data-date");
        const cards = cell.querySelectorAll("[data-client]");

        cards.forEach((card) => {
          const client = JSON.parse(card.getAttribute("data-client"));
          client.appointment_date = date;

          // If price/notes exist in DOM (optional future feature)
          const priceInput = card.querySelector(".price-input");
          const notesInput = card.querySelector(".notes-input");

          if (priceInput) client.price = parseFloat(priceInput.value) || 0;
          if (notesInput) client.notes = notesInput.value || "";

          appointments.push(client);
        });
      });

      // Add unassigned clients
      const unassignedCards = document.querySelectorAll(
        "#unassigned-list [data-client]"
      );
      unassignedCards.forEach((card) => {
        const client = JSON.parse(card.getAttribute("data-client"));
        client.appointment_date = null;
        appointments.push(client);
      });

      // Update hidden input
      appointmentsInput.value = JSON.stringify(appointments);
    });
  }

  // --------- Handle client name search filter ---------
  const searchInput = document.getElementById("searchInput");
  const rows = document.querySelectorAll("tbody tr");

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

  // --------- Handle date search filter ---------
  const dateInput = document.getElementById("dateInput");

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
