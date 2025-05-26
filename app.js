document.getElementById('encounterForm').addEventListener('submit', async function(event) {
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

    // Validar que la fecha no sea anterior a hoy (sí se permite hoy)
    const selectedDate = new Date(`${encounterDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignorar la hora al comparar

    if (selectedDate < today) {
        alert('La fecha del encuentro no puede ser anterior a hoy.');
        return;
    }

    // Verificar si el paciente existe en la base de datos por identificador
    const system = "http://cedula";
    const queryUrl = `https://hl7-fhir-ehr-ana-006.onrender.com/patient?system=${encodeURIComponent(system)}&value=${encodeURIComponent(patientId)}`;

    try {
        const checkResponse = await fetch(queryUrl);

        if (checkResponse.status === 204) {
            alert('Paciente no registrado. Por favor verifique el ID.');
            return;
        }

        if (!checkResponse.ok) {
            throw new Error(`Error del servidor: ${checkResponse.status}`);
        }

        const data = await checkResponse.json();
        if (!data || Object.keys(data).length === 0) {
            alert('Paciente no registrado. Por favor verifique el ID.');
            return;
        }

    } catch (error) {
        console.error('Error al verificar paciente:', error);
        alert('Error al verificar el paciente. Inténtelo más tarde.');
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
        type: [{
            text: encounterType
        }],
        subject: {
            reference: `Patient/${patientId}`,
            display: patientName
        },
        actualPeriod: {
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
        if (data.error) {
            console.error('Error desde el servidor:', data.error);
        } else {
            console.log('Success:', data);
            alert('Encuentro creado exitosamente!');
        }
    })
    .catch((error) => {
        console.error('Error en la solicitud:', error);
        alert('Hubo un error al crear el encuentro.');
    });
});
