function generateWhatsappSchedule(appointments) {
  const grouped = {};

  // Group appointments by weekday and day
  appointments.forEach((appt) => {
    const date = new Date(appt.appointment_date);
    if (!appt.appointment_date || isNaN(date)) return;

    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    const day = date.getDate();
    const key = `${weekday}/${day}`;

    if (!grouped[key]) grouped[key] = [];

    grouped[key].push(appt);
  });

  // Create the message string
  let message = "";
  for (const key of Object.keys(grouped)) {
    message += `${key}\n`;
    grouped[key].forEach((appt) => {
      const name = `${appt.first_name} ${appt.last_name}`;
      const hrs = parseFloat(appt.duration_hours).toFixed(1);
      message += `${name} (${hrs})\n`;
    });
    message += `\n`;
  }

  return message.trim();
}

module.exports = { generateWhatsappSchedule };
