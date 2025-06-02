let draggedElement = null;

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
      client.last_appointment_date
        ? new Date(client.last_appointment_date).toLocaleDateString("en-US")
        : "No history"
    }</small>
    
  `;

  container.appendChild(card);
}

function handleDrop(event, date) {
  event.preventDefault();

  const data = event.dataTransfer.getData("application/json");
  const client = JSON.parse(data);

  if (draggedElement) draggedElement.remove();

  const target = event.currentTarget;

  const card = document.createElement("div");
  card.className = "p-2 bg-light border rounded mb-1 shadow-sm";
  card.setAttribute("draggable", "true");
  card.setAttribute("ondragstart", "handleDragStart(event)");
  card.setAttribute("data-client", JSON.stringify(client));

  card.innerHTML = `
      <strong>${client.first_name} ${client.last_name}</strong><br>
      <small class="text-success">Hours: ${client.duration_hours}</small><br>
      <span class="badge bg-warning text-dark">${client.service_frequency.replace(
        /_/g,
        " "
      )}</span>
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
  //console.log("totalSpan updated to:", totalSpan.textContent);

  }
}
  
window.handleDragStart = handleDragStart;
window.handleDrop = handleDrop;
window.handleUnassignDrop = handleUnassignDrop;
