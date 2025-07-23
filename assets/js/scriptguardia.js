// ===================Formulario Guardia=================== //
/*function evaluarFormulario() {
      event.preventDefault(); // Agregado para evitar recarga
      const form = document.forms['formulario-guardia'];
      let irAGuardia = false;

      // Verificar sección de signos de alarma
      for (let i = 1; i <= 7; i++) {
        if (form[`alarma${i}`].value === "si") {
          irAGuardia = true;
          break;
        }
      }

      const resultadoDiv = document.getElementById("resultado");

      if (irAGuardia) {
        resultadoDiv.innerHTML = "🔴 Recomendación: Deberías asistir a una guardia médica. Estás presentando síntomas que requieren evaluación profesional.";
        resultadoDiv.style.backgroundColor = "#ffe6e6";
      } else {
        resultadoDiv.innerHTML = "🟡 Recomendación: Podés manejar los síntomas en casa. Reposá, hidratate y consultá a tu médico si no mejorás en 3 días.";
        resultadoDiv.style.backgroundColor = "#e0f7fa";
      }
    };*/

    // Función para evaluar el formulario y mostrar recomendación
function evaluarFormulario() {
  // Obtener respuestas de la sección 1 (Signos de alarma)
  const alarma1 = document.querySelector('select[name="alarma1"]').value;
  const alarma2 = document.querySelector('select[name="alarma2"]').value;
  const alarma3 = document.querySelector('select[name="alarma3"]').value;
  const alarma4 = document.querySelector('select[name="alarma4"]').value;
  const alarma5 = document.querySelector('select[name="alarma5"]').value;
  const alarma6 = document.querySelector('select[name="alarma6"]').value;
  const alarma7 = document.querySelector('select[name="alarma7"]').value;

  // Obtener respuestas de la sección 2 (Síntomas leves)
  const leve1 = document.querySelector('select[name="leve1"]').value;
  const leve2 = document.querySelector('select[name="leve2"]').value;
  const leve3 = document.querySelector('select[name="leve3"]').value;
  const leve4 = document.querySelector('select[name="leve4"]').value;
  const leve5 = document.querySelector('select[name="leve5"]').value;

  // Contar respuestas "Sí" en cada sección
  const alarmas = [alarma1, alarma2, alarma3, alarma4, alarma5, alarma6, alarma7];
  const leves = [leve1, leve2, leve3, leve4, leve5];
  
  const totalAlarmas = alarmas.filter(respuesta => respuesta === 'si').length;
  const totalLeves = leves.filter(respuesta => respuesta === 'si').length;

  // Determinar recomendación basada en las respuestas
  let recomendacion = '';
  let icono = '';
  let titulo = '';
  
  if (totalAlarmas >= 1) {
    // Caso urgente - ir a guardia
    titulo = "Atención Urgente";
    icono = "../assets/img/triage_rojo_sinfondo.png"; // Cambiar por tu imagen
    recomendacion = `
      <p>Basado en tus respuestas, <strong>recomendamos que acudas a la guardia médica lo antes posible</strong>.</p>
      <p>Presentás ${totalAlarmas > 1 ? 'varios' : 'un'} signo(s) de alarma que requieren evaluación médica inmediata.</p>
      <p>No demores la consulta, especialmente si los síntomas empeoran.</p>
    `;
  } else if (totalLeves >= 3) {
    // Caso intermedio - consultar médico
    titulo = "Consulta Médica";
    icono = "../assets/img/triage_amarillo_sinfondo.png"; // Cambiar por tu imagen
    recomendacion = `
      <p>Tienes varios síntomas que, aunque no son urgentes, <strong>merecen una evaluación médica</strong>.</p>
      <p>Te recomendamos:</p>
      <ul>
        <li>Programar una consulta con tu médico de cabecera</li>
        <li>Monitorear tus síntomas</li>
        <li>Si empeoras, acudir a la guardia</li>
      </ul>
    `;
  } else {
    // Caso leve - autocuidado
    titulo = "Autocuidado";
    icono = "../assets/img/triage_verde_sinfondo.png"; // Cambiar por tu imagen
    recomendacion = `
      <p>Tus síntomas parecen leves y <strong>puedes manejarlos con autocuidado</strong>.</p>
      <p>Recomendaciones:</p>
      <ul>
        <li>Descansar e hidratarte bien</li>
        <li>Usar medicamentos de venta libre si es necesario</li>
        <li>Monitorear tu evolución</li>
        <li>Si aparecen síntomas más graves, consultar</li>
      </ul>
    `;
  }

  // Mostrar el modal con la recomendación
  mostrarModal(titulo, icono, recomendacion);
}

// Función para mostrar el modal
function mostrarModal(titulo, icono, contenido) {
  const modalHTML = `
    <div class="modal-overlay active">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${titulo}</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="modal-icon">
            <img src="${icono}" alt="${titulo}">
          </div>
          ${contenido}
        </div>
        <div class="modal-footer">
          <button class="modal-button">Entendido</button>
        </div>
      </div>
    </div>
  `;
  
  // Crear e insertar el modal
  const modal = document.createElement('div');
  modal.innerHTML = modalHTML;
  document.body.appendChild(modal);
  
  // Configurar eventos para cerrar el modal
  const overlay = modal.querySelector('.modal-overlay');
  const closeBtn = modal.querySelector('.close-modal');
  const actionBtn = modal.querySelector('.modal-button');
  
  function cerrarModal() {
    overlay.classList.remove('active');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
  
  closeBtn.addEventListener('click', cerrarModal);
  actionBtn.addEventListener('click', cerrarModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      cerrarModal();
    }
  });
}

// Opcional: Validación al enviar el formulario
document.querySelector('.formulario-guardia').addEventListener('submit', function(e) {
  e.preventDefault();
  evaluarFormulario();
});