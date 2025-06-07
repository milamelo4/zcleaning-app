let draggedElement = null;
let currentSchedule = []; // array of all assigned clients
let currentUnassigned = []; // array of unassigned clients

function handleDragStart(event) {
  const clientData = event.target.getAttribute("data-client");
  event.dataTransfer.setData("application/json", clientData);
  draggedElement = event.target; // store a reference to the actual DOM element being dragged
}  

function handleUnassignDrop(event) {
  event.preventDefault();

  const data = event.dataTransfer.getData("application/json");
  const client = JSON.parse(data);

  // UPDATE HOURS FIRST BEFORE REMOVING
  const parentTd = draggedElement?.closest("td");
  if (parentTd) {
    const dropDate = parentTd.getAttribute("data-date");
    const totalSpan = document.getElementById(`total-${dropDate}`);

    if (totalSpan) {
      const currentTotal = parseFloat(totalSpan.textContent || "0");
      const newTotal = currentTotal - parseFloat(client.duration_hours || 0);
      totalSpan.textContent = newTotal;
    }
  }

  // NOW remove the element AFTER total is updated
  if (draggedElement) draggedElement.remove();

  const container = document.getElementById("unassigned-list");

  const card = document.createElement("div");
  card.className = "p-2 bg-light border rounded bg-light shadow-sm";
  card.setAttribute("draggable", "true");
  card.setAttribute("ondragstart", "handleDragStart(event)"); // kept same for now
  card.setAttribute("data-client", JSON.stringify(client));

  card.innerHTML = `
    <strong>${client.first_name} ${client.last_name}</strong><br>
    <small class="text-success">Hours: ${client.duration_hours}</small><br>
    <span class="badge bg-warning text-dark">${client.service_frequency.replace(
      /_/g,
      " "
    )}</span><br>
    <small class="text-muted">Last cleaned: ${
      client.true_last_cleaned_date
        ? new Date(client.true_last_cleaned_date).toLocaleDateString("en-US")
        : "No history"
    }</small>    
  `;
  container.appendChild(card);
}

function handleDrop(event, date) {
  event.preventDefault();

  const data = event.dataTransfer.getData("application/json");
  const client = JSON.parse(data);

  // Update the appointment_date to the new drop day
  client.appointment_date = date;

  if (draggedElement) draggedElement.remove();

  const target = event.currentTarget;

  const card = document.createElement("div");
  card.className = "p-2 bg-light border rounded mb-1 shadow-sm";
  card.setAttribute("draggable", "true");
  card.setAttribute("ondragstart", "handleDragStart(event)");
  card.setAttribute("data-client", JSON.stringify(client));
  console.log("Dropping client on date:", date);

  card.innerHTML = `
    <strong>${client.first_name} ${client.last_name}</strong><br>
    <small class="text-success">Hours: ${client.duration_hours}</small><br>
    <span class="badge bg-warning text-dark">${client.service_frequency.replace(
      /_/g,
      " "
    )}</span><br>
    <small class="text-muted">Last cleaned: ${
      client.true_last_cleaned_date
        ? new Date(client.true_last_cleaned_date).toLocaleDateString("en-US")
        : "No history"
    }</small><br>
  `;

  target.appendChild(card);

  const totalSpan = document.getElementById(`total-${date}`);
  if (totalSpan) {
    const allCards = target.querySelectorAll("[data-client]");
    let total = 0;
    allCards.forEach((el) => {
      const clientData = JSON.parse(el.getAttribute("data-client"));
      total += parseFloat(clientData.duration_hours || 0);
    });
    totalSpan.textContent = total;
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const appointmentsInput = document.getElementById("appointmentsInput");

  if (appointmentsInput && typeof appointmentsJson !== "undefined") {
    appointmentsInput.value = JSON.stringify(appointmentsJson);
    //.log("appointmentsInput filled:", appointmentsInput.value);
  } else {
    //console.log("appointmentsInput or appointmentsJson missing");
  }
});

window.handleDragStart = handleDragStart;
window.handleDrop = handleDrop;
window.handleUnassignDrop = handleUnassignDrop;

document
  .getElementById("saveDraftForm")
  .addEventListener("submit", function (e) {
    const appointments = [];

    const calendarCells = document.querySelectorAll("td[data-date]");

    calendarCells.forEach((cell) => {
      const date = cell.getAttribute("data-date");
      const cards = cell.querySelectorAll("[data-client]");

      cards.forEach((card) => {
        const client = JSON.parse(card.getAttribute("data-client"));
        client.appointment_date = date; // update to new date
        appointments.push(client);
      });
    });

    // Add back unassigned clients (optional, if you want them too)
    const unassignedCards = document.querySelectorAll(
      "#unassigned-list [data-client]"
    );
    unassignedCards.forEach((card) => {
      const client = JSON.parse(card.getAttribute("data-client"));
      client.appointment_date = null;
      appointments.push(client);
    });

    // Put it in the hidden input
    document.getElementById("appointmentsInput").value =
      JSON.stringify(appointments);
  });

