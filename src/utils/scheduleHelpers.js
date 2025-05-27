function getClientsForWeek(clients, weekStartDate, virtualLastDates = {}) {
  const start = new Date(weekStartDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const dayMap = {
    SUN: 0,
    M: 1,
    MON: 1,
    TUE: 2,
    TUESDAY: 2,
    W: 3,
    WED: 3,
    TH: 4,
    THU: 4,
    F: 5,
    FRI: 5,
    SAT: 6,
    SATURDAY: 6,
  };

  const suggested = [];
  const availableWeekdays = [1, 2, 3, 4, 5]; // Mon–Fri
  let notSetIndex = 0;

  clients.forEach((client) => {
    const rawLastDate =
      virtualLastDates[client.client_id] || client.last_appointment_date;
    const lastDate = rawLastDate ? new Date(rawLastDate) : null;

    // 1. Choose the appointment day first
    let appointmentDate;
    if (client.preferred_day && dayMap[client.preferred_day]) {
      const preferredDayIndex = dayMap[client.preferred_day];
      appointmentDate = new Date(start);
      appointmentDate.setDate(
        start.getDate() + ((preferredDayIndex + 7 - start.getDay()) % 7)
      );

      if (preferredDayIndex > 5) return; // skip weekends unless explicitly allowed
    } else {
      const weekdayIndex =
        availableWeekdays[notSetIndex % availableWeekdays.length];
      appointmentDate = new Date(start);
      appointmentDate.setDate(start.getDate() + (weekdayIndex - 1));
      notSetIndex++;
    }

    const weekday = appointmentDate.getDay();
    if (weekday === 0 || weekday === 6) return; // skip if weekend

    // 2. Decide if this client is due
    let isDue = false;
    if (client.service_frequency === "once_a_week") {
      isDue = true;
    } else if (!lastDate) {
      isDue = true;
    } else {
      const daysSince = Math.floor(
        (appointmentDate - lastDate) / (1000 * 60 * 60 * 24)
      );

      if (client.service_frequency === "every_other_week" && daysSince >= 14) {
        isDue = true;
      }

      if (client.service_frequency === "once_a_month" && daysSince >= 28) {
        isDue = true;
      }
      
    }

    if (!isDue) return;

    if (appointmentDate >= start && appointmentDate <= end) {
      suggested.push({
        client_id: client.client_id,
        first_name: client.first_name,
        last_name: client.last_name,
        appointment_date: appointmentDate.toISOString().slice(0, 10),
        weekday: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ][weekday],
        service_type_id: client.service_type_id,
        duration_hours: client.service_hours,
        service_frequency: client.service_frequency,
        last_appointment_date: client.last_appointment_date, // for display only
      });
    }
  });

  return suggested;
}

function getClientsForMonth(clients, year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const scheduledClients = [];
  const hoursPerDay = {}; // Track total hours per YYYY-MM-DD

  // Track each client's last appointment using DB history
  const virtualLastDates = {};
  clients.forEach((c) => {
    virtualLastDates[c.client_id] = c.last_appointment_date;
  });

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 7)) {
    const weekClients = getClientsForWeek(
      clients,
      new Date(d),
      virtualLastDates
    );

    weekClients.forEach((client) => {
      const date = new Date(client.appointment_date).toISOString().slice(0, 10);

      const hoursForThisDay = hoursPerDay[date] || 0;

      if (hoursForThisDay + parseFloat(client.duration_hours || 0) > 28) {
        
        return; // Skip this client, day is full
      }

      // Otherwise, proceed to schedule
      scheduledClients.push(client);
      hoursPerDay[date] = hoursForThisDay + parseFloat(client.duration_hours);

    
      // Update the client's virtual last appointment
      virtualLastDates[client.client_id] = client.appointment_date;
    });
  }

    // After collecting all scheduled clients, find unassigned ones
    const scheduledClientIds = new Set(scheduledClients.map(c => c.client_id));

    const unassignedClients = clients.filter(c => !scheduledClientIds.has(c.client_id)).map(c => ({
      client_id: c.client_id,
      first_name: c.first_name,
      last_name: c.last_name,
      duration_hours: c.service_hours,
      service_frequency: c.service_frequency,
      last_appointment_date: c.last_appointment_date
    }));
  
    return {
      scheduledClients,
      unassignedClients,
    };
  }
  
module.exports = { getClientsForWeek, getClientsForMonth };
