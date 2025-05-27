let draggedElement = null;
console.log("✅ appointments-drag.js loaded!");


function handleDragStart(event) {
  const clientData = event.target.getAttribute("data-client");
  event.dataTransfer.setData("application/json", clientData);
  draggedElement = event.target; // store a reference to the actual DOM element being dragged
}
  

function handleUnassignDrop(event) {
  event.preventDefault();
  console.log("🔥 handleUnassignDrop() is being triggered!");


  const data = event.dataTransfer.getData("application/json");
  const client = JSON.parse(data);

  // 🟡 UPDATE HOURS FIRST BEFORE REMOVING
  if (draggedElement && draggedElement.closest("td")) {
    console.log("🚚 handleUnassignDrop called");
    console.log("draggedElement:", draggedElement);

    const parentTd = draggedElement.closest("td");
    const dateAttr = parentTd.getAttribute("ondrop");
    console.log("💡 Found parent cell. ondrop attribute:", dateAttr);

    const dateMatch = dateAttr.match(/'([\d-]+)'/);
    if (dateMatch) {
      const dropDate = dateMatch[1];
      const totalSpan = document.getElementById(`total-${dropDate}`);
      console.log("📍 total span found for:", dropDate, totalSpan);

      if (totalSpan) {
        let currentTotal = parseFloat(totalSpan.textContent || "0");
        console.log("🔢 current total before subtract:", currentTotal);
        const newTotal = currentTotal - parseFloat(client.duration_hours || 0);
        console.log(
          "➖ subtracting:",
          client.duration_hours,
          "→ New total:",
          newTotal
        );
        totalSpan.textContent = newTotal;
      }
    }
  }

  // ✅ NOW remove the element AFTER total is updated
  if (draggedElement) draggedElement.remove();

  const container = document.getElementById("unassigned-list");

  const card = document.createElement("div");
  card.className = "p-2 bg-light border rounded bg-light shadow-sm";
  card.setAttribute("draggable", "true");
  card.setAttribute("ondragstart", "handleDragStart(event)");
  card.setAttribute("data-client", JSON.stringify(client));

  card.innerHTML = `
      <strong>${client.first_name} ${client.last_name}</strong><br>
      <span class="badge bg-warning text-dark">${client.service_frequency.replace(
        /_/g,
        " "
      )}</span><br>
      <small class="text-muted">Last cleaned: ${
        client.last_appointment_date
          ? new Date(client.last_appointment_date).toLocaleDateString("en-US")
          : "No history"
      }</small><br>
      <small class="text-muted">Hours: ${client.duration_hours}</small>
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
      <span class="badge bg-warning text-dark">${client.service_frequency.replace(
        /_/g,
        " "
      )}</span><br>
     
      <small class="text-muted">Hours: ${client.duration_hours}</small>
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
    console.log("🟡 totalSpan updated to:", totalSpan.textContent);

  }
}
  
window.handleDragStart = handleDragStart;
window.handleDrop = handleDrop;
window.handleUnassignDrop = handleUnassignDrop;
