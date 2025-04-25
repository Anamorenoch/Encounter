document.getElementById('encounterForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Obtener los valores del formulario
    const patientId = document.getElementById('patientId').value;
    const patientName = document.getElementById('patientName').value;
    const encounterDate = document.getElementById('encounterDate').value;
    const encounterTime = document.getElementById('encounterTime').value;
    const encounterType = document.getElementById('encounterType').value;

    // Validar hora entre 08:00 y 20:00
    const [hour, minute] = encounterTime.split(':').map(Number);
    if (hour < 8 || hour >= 20) {
        alert('La hora debe estar entre las 08:00 y las 20:00');
        return;
    }

    const pad = n => n.toString().padStart(2, '0');

    // Crear start y end con offset colombiano (-05:00)
    const startDateTime = `${encounterDate}T${encounterTime}:00-05:00`;

    let endHour = hour;
    let endMinute = minute + 30;
    if (endMinute >= 60) {
        endMinute -= 60;
        endHour += 1;
    }

    const endDateTime = `${encounterDate}T${pad(endHour)}:${pad(endMinute)}:00-05:00`;

    // Crear objeto Encounter en formato FHIR
    const encounter = {
        resourceType: "Encounter",
        status: "in-progress",
        class: [{
            code: "AMB"
        }],
        type: [{
            text: encounterType
        }],
        subject: {
            reference: `Patient/${patientId}`,
            display: patientName
        },
        period: {
            start: startDateTime,
            end: endDateTime
        }
    };

    // Enviar los datos usando Fetch API
    fetch('https://hl7-fhir-ehr-ana-006.onrender.com/encounter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(encounter)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('Encuentro creado exitosamente!');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Hubo un error al crear el encuentro.');
    });
});
