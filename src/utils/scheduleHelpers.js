function getClientsForWeek(clients, weekStartDate) {
  const start = new Date(weekStartDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const dayMap = {
    M: 1,
    TUE: 2,
    W: 3,
    TH: 4,
    F: 5,
  };

  const suggested = [];
  const availableWeekdays = [1, 2, 3, 4, 5]; // Mon–Fri
  let notSetIndex = 0;

  clients.forEach((client) => {
    // console.log({
    //   name: `${client.first_name} ${client.last_name}`,
    //   frequency: client.service_frequency,
    //   last: client.last_appointment_date,
    // });
      
    const lastDate = client.last_appointment_date
      ? new Date(client.last_appointment_date)
      : null;

    let isDue = false;

    if (!lastDate) {
      isDue = false; // never had an appointment — due
    } else {
      const daysSince = Math.floor((start - lastDate) / (1000 * 60 * 60 * 24));

      if (client.service_frequency === "once_a_week" && daysSince >= 6) {
        isDue = true;
      } else if (
        client.service_frequency === "every_other_week" &&
        daysSince >= 14
      ) {
        isDue = true;
      } else if (
        client.service_frequency === "once_a_month" &&
        daysSince >= 28
      ) {
        isDue = true;
      }
    }

    if (!isDue) return;

    let appointmentDate;

    if (client.preferred_day && dayMap[client.preferred_day]) {
      const preferredDayIndex = dayMap[client.preferred_day];
      appointmentDate = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
      );

      appointmentDate.setDate(
        start.getDate() + ((preferredDayIndex + 7 - start.getDay()) % 7)
      );

    } else {
      // Spread NOTSET clients across weekdays
      const weekdayIndex =
        availableWeekdays[notSetIndex % availableWeekdays.length];
      appointmentDate = new Date(start);
      appointmentDate.setDate(start.getDate() + (weekdayIndex - 1));
      notSetIndex++;
    }

    if (appointmentDate >= start && appointmentDate <= end) {
      suggested.push({
        client_id: client.client_id,
        first_name: client.first_name,
        last_name: client.last_name,
        appointment_date: appointmentDate.toISOString().slice(0, 10),
        weekday: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Sat"][
          appointmentDate.getDay()
        ],

        service_type_id: client.service_type_id,
      });
    }
  });

  return suggested;
}

module.exports = { getClientsForWeek };