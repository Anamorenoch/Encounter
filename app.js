document.getElementById('encounterForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Obtener los valores del formulario
    const patientId = document.getElementById('patientId').value;
    const patientName = document.getElementById('patientName').value;
    const encounterType = document.getElementById('encounterType').value;

    }

    const pad = n => n.toString().padStart(2, '0');

    }

   

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
