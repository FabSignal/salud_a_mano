// ======================= CONFIGURACIÓN API =======================
const API_BASE_URL = "https://menstrual-cycle-tracking-api.onrender.com";

/* ======================= DECLARACIONES GLOBALES ====================== */
// ciclosPrecargados : true cuando muestra ejemplos y false cuando muestra ciclos reales
let ciclos = [];
let ciclosPrecargados = false;

// ESTADO DE AUTENTICACIÓN
// const userId = localStorage.getItem("userId");
function getCurrentUserId() {
  return localStorage.getItem("userId");
}

//const userName = localStorage.getItem("userName");
function getCurrentUserName() {
  return localStorage.getItem("userName");
}

/*  ======================= VARIABLES GLOBALES PARA DOM ==================== */
let cycleList;
let emptyTemplate;

/* ============================= FUNCIONES ======================== */

// ==========================
function cargarCiclosDeEjemplo() {
  const ejemplos = [
    {
      id: "1",
      fecha: "2025-01-01",
      duracion: 5,
      sintomas: "Dolor abdominal, Hinchazón, Fatiga",
      synced: true,
      example: true,
    },
    {
      id: "2",
      fecha: "2025-01-28",
      duracion: 6,
      sintomas: "Dolor de cabeza, Cólicos, Dolor de espalda",
      synced: true,
      example: true,
    },
  ];
  ciclos = ejemplos;
  ciclosPrecargados = true;
  localStorage.setItem("ciclos", JSON.stringify(ciclos));
}

// Función que trae los ciclos del servidor, actualiza variables y localStorage
async function loadCycles() {
  // 0) Leer el userId desde LocalStorage
  const userId = getCurrentUserId();
  // 1) Si no hay usuario logueado, cargo ejemplos y salgo
  if (!userId) {
    cargarCiclosDeEjemplo();
    return;
  }

  try {
    const resp = await fetch(
      `${API_BASE_URL}/api/cycles/${encodeURIComponent(userId)}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!resp.ok) throw new Error(`Error ${resp.status}`);

    //  Parsear JSON
    //const data = await resp.json();

    // 2. Asegurar que 'data' sea un array
    //    Si no lo es, convierte a vacío para no romper .map()
    //const serverCycles = Array.isArray(data) ? data : [];

    // 1) Parsear JSON y normalizarlo
    const payload = await resp.json();
    let serverCycles;
    if (Array.isArray(payload)) {
      serverCycles = payload;
    } else if (Array.isArray(payload.cycles)) {
      serverCycles = payload.cycles;
    } else {
      console.warn("loadCycles: estructura inesperada", payload);
      serverCycles = [];
    }

    // 3. Si no hay ciclos guardados, se cargan ejemplos
    if (serverCycles.length === 0) {
      cargarCiclosDeEjemplo();
    } else {
      // Si hay ciclos reales, se mapean y almacenan
      ciclos = serverCycles.map((c) => ({
        id: c.id,
        fecha: c.startDate || c.fecha,
        duracion: c.duration || c.duracion,
        sintomas: c.symptoms || c.sintomas,
        synced: true,
        example: false,
      }));

      // Guardar en localStorage
      ciclosPrecargados = false;
      localStorage.setItem("ciclos", JSON.stringify(ciclos));
    }
  } catch (err) {
    console.error("loadCycles:", err);

    // 4. Si no había nada en LocalStorage o error 404, mostrar ejemplos
    if (!localStorage.getItem("ciclos")) {
      cargarCiclosDeEjemplo();
      ciclosPrecargados = true;
    }
  }
}

// Función para ordenar ciclos por fecha (más reciente primero)
function ordenarCiclosPorFechaDesc(array) {
  return [...array].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

// Función para mostrar fechas en español
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("es-ES", options);
}

// ====================
/* ========== Mostrar ciclos dinámicamente en el DOM ========== */
/* 
  - Se limpia la lista previa y se agregan los ciclos ordenados por fecha
  - Se usa una función para formatear fechas en español
  */

// Función para mostrar los datos de los ciclos en pantalla
function mostrarCiclos() {
  // 1. Se limpia el contenido anterior de la lista (por si ya hay ciclos)
  //cycleList.querySelectorAll("li").forEach((li) => li.remove());
  cycleList.innerHTML = "";

  // Si no hay ciclos nuevos agregados por la usuaria (es decir, solo están los precargados)
  // se muestra el estado vacío como indicación visual. Esto se controla con la variable ciclosPrecargados.
  //if (ciclos.length === 0) {
  // Clonar & mostrar el template de empty-state
  /* emptyState.style.display = "";
    return;
  } */

  //if (ciclos.length === 0) {
  // Clonar & mostrar el template de empty-state
  //  cycleList.appendChild(emptyTemplate.content.cloneNode(true));
  //return;
  //}

  // 3) ¿Hay al menos un ciclo real?
  //const tieneReal = ciclos.some((c) => !c.isExample);
  // 4) Si NO hay real (sólo ejemplos), muestro empty-state;
  //    si hay real, lo oculto.
  //emptyState.style.display = tieneReal ? "none" : "";

  // Si NO hay reales (solo ejemplos), muestro también el empty-state
  /* if (!tieneReal) {
    cycleList.appendChild(emptyTemplate.content.cloneNode(true));
  } */

  // 2. Si no hay ciclos (ni ejemplos), mostramos el estado vacío
  if (ciclosPrecargados) {
    cycleList.appendChild(emptyTemplate.content.cloneNode(true));
    // Luego listar cada ejemplo
    ordenarCiclosPorFechaDesc(ciclos).forEach((ciclo) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div>
          <div class="cycle-date">${formatDate(ciclo.fecha)}</div>
          <div class="cycle-symptoms">${
            ciclo.sintomas || "Sin síntomas registrados"
          }</div>
        </div>
        <div class="cycle-duration">${ciclo.duracion} días</div>
      `;
      cycleList.appendChild(li);
    });

    return;
  }
  // 3) Si NO hay ciclos reales tras precargados=false
  if (ciclos.length === 0) {
    cycleList.appendChild(emptyTemplate.content.cloneNode(true));
    return;
  }

  // 4) Al menos un ciclo real: render común
  ordenarCiclosPorFechaDesc(ciclos).forEach((ciclo) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <div class="cycle-date">${formatDate(ciclo.fecha)}</div>
        <div class="cycle-symptoms">${
          ciclo.sintomas || "Sin síntomas registrados"
        }</div>
      </div>
      <div class="cycle-duration">${ciclo.duracion} días</div>
    `;
    cycleList.appendChild(li);
  });
}

/* ======================= AUTENTICACIÓN ====================== */

// Elementos del DOM
const authModal = document.getElementById("auth-modal");
const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const userNameSpan = document.getElementById("userName");
const greetingText = document.querySelector("header h1");
//const logoutBtn = document.getElementById("logout-btn");
const tabButtons = document.querySelectorAll(".tab-btn");

// Función para mostrar errores
function showError(form, message) {
  // Eliminar errores anteriores en este formulario
  const existingError = form.querySelector(".error-message");
  if (existingError) existingError.remove();

  const errorElement = document.createElement("div");
  errorElement.className = "error-message";
  errorElement.textContent = message;

  // Insertar después del último elemento del formulario
  form.appendChild(errorElement);
}

// Verificar estado de autenticación
function showAuthenticatedState() {
  authModal.classList.remove("active");
  // Leer SIEMPRE desde localStorage
  const storedUserName = localStorage.getItem("userName") || "usuaria";

  // Usar el nombre almacenado
  userNameSpan.textContent = storedUserName;

  // Actualizar el saludo en el header
  const titulo = document.querySelector("header h1");
  titulo.innerHTML = `<span class="icon"><img src="../assets/img/luna_1.png" alt="Luna" class="icon-img"></span> ¡Hola ${storedUserName}! ¿Cómo te sentís hoy?`;
}

// Función para mostrar estado no autenticado
function showUnauthenticatedState() {
  authModal.classList.add("active");
  greetingText.innerHTML = `<span class="icon"><img src="../assets/img/luna_1.png" alt="Luna" class="icon-img"></span> ¡Hola! ¿Cómo te sentís hoy?`;
}

// ======================= MENÚ DE USUARIa =======================

// Verificar si debemos limpiar los ciclos de ejemplo
// QUE HACE ESTO???????
/* if (userId && !ciclosPrecargados) {
  localStorage.removeItem("ciclos");
  ciclos = [];
} */

// Manejar tabs
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Actualizar botones activos
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    // Mostrar formulario correspondiente
    const tab = button.getAttribute("data-tab");
    document.querySelectorAll(".auth-form").forEach((form) => {
      form.classList.remove("active");
    });
    document.getElementById(`${tab}-form`).classList.add("active");
  });
});

// Manejar registro
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  // Mostrar indicador de carga
  const submitBtn = registerForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
  submitBtn.disabled = true;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    let data;
    // Manejar respuesta según el tipo de contenido
    if (response.headers.get("content-type")?.includes("application/json")) {
      data = await response.json();
      console.log("Registro payload →", data);
      console.log("auth response payload:", data);
    } else {
      const text = await response.text();
      throw new Error(text || "Respuesta inesperada del servidor");
    }

    if (response.ok) {
      // 1. Guardar credenciales en localStorage
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userName", data.name);

      // Si hay login exitoso:
      // 2. Resetear los ciclos locales
      localStorage.removeItem("ciclos");

      // 3. Cargar los ciclos reales y mostrarlos
      //ciclos = [];
      await loadCycles(); // recarga los ciclos del servidor
      mostrarCiclos(); // los dibuja en pantalla
      fetchPredictions();
      // Ocultar modal y mostrar estado autenticado
      authModal.classList.remove("active");
      showAuthenticatedState();
      syncPendingCycles();

      // Mostrar notificación de éxito
      showSuccessNotification("¡Registro exitoso! ¡Bienvenida!");
    } else {
      // Mostrar error
      if (response.status === 409) {
        showError(
          registerForm,
          data.message || "Este correo ya está registrado"
        );
      } else {
        showError(
          registerForm,
          data.message || `Error ${response.status}: ${response.statusText}`
        );
      }
    }
  } catch (error) {
    console.error("Error:", error);
    showError(registerForm, error.message || "Error en la conexión");
  } finally {
    // Restaurar botón
    submitBtn.textContent = originalBtnText;
    submitBtn.disabled = false;
  }
});

// Manejar login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  // Mostrar indicador de carga
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ingresando...';
  submitBtn.disabled = true;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    let data;
    // Manejar respuesta según el tipo de contenido
    if (response.headers.get("content-type")?.includes("application/json")) {
      data = await response.json();
      console.log("Registro payload →", data);
    } else {
      const text = await response.text();
      throw new Error(text || "Respuesta inesperada del servidor");
    }

    if (response.ok) {
      // Guardar en localStorage
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userName", data.name);

      // Al login exitoso:
      localStorage.removeItem("ciclos");
      //ciclos = [];
      await loadCycles(); // recarga los ciclos del servidor
      mostrarCiclos(); // los dibuja en pantalla
      fetchPredictions();
      showAuthenticatedState();
      syncPendingCycles();
      showSuccessNotification("¡Bienvenida de nuevo!");
    } else {
      // Mostrar error
      const errorMsg =
        data.message || `Error ${response.status}: ${response.statusText}`;
      showError(loginForm, errorMsg);
    }
  } catch (error) {
    console.error("Error:", error);
    showError(loginForm, error.message || "Error en la conexión");
  } finally {
    // Restaurar botón
    submitBtn.textContent = originalBtnText;
    submitBtn.disabled = false;
  }
});

// ============= Función para mostrar notificación de éxito
function showSuccessNotification(message) {
  const successMsg = document.createElement("div");
  successMsg.style.cssText = `
    position: fixed;
    top: 30px;
    right: 30px;
    background: var(--accent-mint);
    color: var(--dark-brown);
    padding: 1.2rem 2rem;
    border-radius: var(--element-radius);
    box-shadow: var(--shadow-hover);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-weight: 600;
    font-size: 1rem;
    animation: slideIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), fadeOut 0.6s ease 3s forwards;
    border-radius: var(--card-radius);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.8);
  `;

  successMsg.innerHTML = `
    <i class="fas fa-check-circle" style="color: var(--accent-lavender); font-size: 1.6rem;"></i>
    <div>${message}</div>
  `;

  document.body.appendChild(successMsg);

  // Se remueve animación después de 3.6 segundos
  setTimeout(() => {
    if (successMsg.parentNode === document.body) {
      document.body.removeChild(successMsg);
    }
  }, 3600);
}

/* ============ Ciclos: leer de localStorage o cargar ejemplo ============ */

/* ============ Offline-first: carga inicial de ciclos ============ */
const stored = localStorage.getItem("ciclos");
if (stored) {
  // 1) Ya hay ciclos guardados, cargarlos (tanto reales como ejemplos previos)
  ciclos = JSON.parse(stored);
  // Si *todos* los ciclos tienen example=true,
  //     se sigue en modo “precargados”
  ciclosPrecargados = ciclos.every((c) => c.example === true);
} else {
  //  No hay nada en LS: inyectar solo ejemplos marcados como "syncados"
  ciclos = [
    {
      id: 1,
      fecha: "2025-01-01",
      duracion: 5,
      sintomas: "Dolor abdominal, Hinchazón, Fatiga",
      synced: true, // así nunca se envían al servidor
      example: true,
    },
    {
      id: 2,
      fecha: "2025-01-28",
      duracion: 6,
      sintomas: "Dolor de cabeza, Cólicos, Dolor de espalda",
      synced: true,
      example: true,
    },
  ];
  ciclosPrecargados = true;
  // Guardar ejemplos en LS para poder mostrarlos, pero ya vienen "synced"
  localStorage.setItem("ciclos", JSON.stringify(ciclos));
}

/* ===== Sincronización Offline-First de Ciclos ===== */
async function syncPendingCycles() {
  // 1) Salir si estamos offline
  if (!navigator.onLine) return;
  const userId = getCurrentUserId();
  if (!userId) return; // nada que sincronizar si no hay login

  // 2) Leer array desde LS
  const storedArr = JSON.parse(localStorage.getItem("ciclos") || "[]");
  let changed = false;

  // 3) Por cada ciclo con synced === false → POST al backend
  for (const ciclo of storedArr) {
    if (ciclo.synced === false) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/cycles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            startDate: ciclo.fecha,
            duration: ciclo.duracion,
            symptoms: ciclo.sintomas,
          }),
        });

        if (res.ok) {
          ciclo.synced = true;
          changed = true;
        } else if (res.status === 400) {
          // Ciclo duplicado: ya existe en servidor, lo marcamos como “synced”
          console.warn(
            `Ciclo ${ciclo.id} ya existe en API, lo marcamos como syncado.`
          );
          ciclo.synced = true;
          changed = true;
        } else {
          // Otros errores los logueamos para investigar
          const errorText = await res.text();
          console.error(
            `Sync falló ciclo ${ciclo.id}: HTTP ${res.status}`,
            errorText
          );
        }
      } catch (err) {
        console.error(`Error de red al sync ciclo ${ciclo.id}:`, err);
      }
    }
  }

  // 4) Si hubo cambios, actualizar LS y la variable runtime
  if (changed) {
    localStorage.setItem("ciclos", JSON.stringify(storedArr));
    ciclos = storedArr;
    console.log("Ciclos sincronizados con la API");
    // Dispara predicciones actualizadas
    fetchPredictions();
  }
}

// 5) Listener de reconexión
window.addEventListener("online", syncPendingCycles);

/* ==================== Mostrar las predicciones  ========================
  Solo si hay al menos 2 ciclos reales */
async function fetchPredictions() {
  // 1) Verificar prerrequisitos
  const userId = getCurrentUserId();
  if (!userId) return;

  // Filtrar **solo** ciclos sincronizados y **no** de ejemplo
  const reales = ciclos.filter((c) => c.synced === true && !c.example);
  const realesCount = reales.length;

  const container = document.getElementById("predictions-stats-container");

  if (realesCount < 2) {
    if (container) {
      container.innerHTML = `
        <div class="notice-msg">
          <img src="../assets/img/alerta.png" alt="Alerta" class="icon-img">
          <h3>Tenés que cargar al menos dos ciclos consecutivos</h3>
          <p>Registrá tus ciclos para poder ver tus estadísticas y predicciones</p>
        </div>
      `;
    }
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/cycles/predictions/${encodeURIComponent(userId)}`
    );
    if (!res.ok) throw new Error(`Status ${res.status}`);

    const data = await res.json();

    // **Guard**: sólo mostrar si el objeto contiene la clave ovulacion
    if (!data.ovulacion) {
      console.warn("Predicciones incompletas:", data);
      if (container)
        container.innerHTML = `<p class="notice-msg">No se pudieron obtener predicciones.</p>`;
      return;
    }

    showPredictions(data);
  } catch (err) {
    console.error("Error al obtener predicciones:", err);
    if (container) {
      container.innerHTML = `<p class="notice-msg">Error al cargar predicciones.</p>`;
    }
  }
}

/*======================== RenderizaR la respuesta de predicciones dentro de #predictions ===========*/
function showPredictions(data) {
  const container = document.getElementById("predictions-stats-container");
  if (!container) return;

  const {
    proximoPeriodo,
    ovulacion,
    fertilidad,
    faseActual,
    estadisticas,
    insights,
  } = data;

  // Función para formatear fechas
  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "long" };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  // Determinar qué mostrar
  const showOvulation = ovulacion.diasHastaOvulacion > 0;
  const validPhase =
    faseActual.diaDelCiclo > 0 &&
    faseActual.diaDelCiclo <= faseActual.duracionCiclo;

  // Crear las 6 tarjetas
  container.innerHTML = `
    <!-- 1. Próximo período -->
    <div class="status-card card-period">
      <div class="status-header">
        <div class="status-icon">
          <img src="../assets/img/prob_prox_ciclo.png" alt="Próximo período">
        </div>
        <div class="status-title">Próximo período</div>
      </div>
      <div class="status-content">
        <div class="status-value">${
          proximoPeriodo.diasRestantes === 0
            ? "¡Hoy!"
            : formatDate(proximoPeriodo.fecha)
        }</div>
        <div class="status-message">${
          proximoPeriodo.diasRestantes === 0
            ? "Tu período comienza hoy"
            : `Comienza en ${proximoPeriodo.diasRestantes} días`
        }</div>
      </div>
    </div>
    
    <!-- 2. Fase actual -->
    <div class="status-card card-phase">
      <div class="status-header">
        <div class="status-icon">
          <img src="../assets/img/fase_actual.png" alt="Fase actual">
        </div>
        <div class="status-title">Fase actual</div>
      </div>
      <div class="status-content">
        <div class="status-value">${faseActual.nombre}</div>
        <div class="status-message">Día ${
          faseActual.diaDelCiclo
        } de tu ciclo</div>
      </div>
    </div>
    
      <!-- 3. Fertilidad -->
<div class="status-card card-fertility">
  <div class="status-header">
    <div class="status-icon">
      <img src="../assets/img/prob_fertilidad.png" alt="Fertilidad">
    </div>
    <div class="status-title">Fertilidad</div>
  </div>
  <div class="status-content">
    <div class="status-value">
      ${fertilidad.mensaje || "Estado actual de tu fertilidad"}
    </div>
    <p class="status-detail">
      ${
        ovulacion.ventanaFertil
          ? "Estás en tu ventana fértil"
          : "No estás en tu ventana fértil"
      }
    </p>
  </div>
</div>

    
    <!-- 4. Ovulación -->
<div class="status-card card-ovulation">
  <div class="status-header">
    <div class="status-icon">
      <img src="../assets/img/ovulacion.png" alt="Ovulación">
    </div>
    <div class="status-title">Ovulación</div>
  </div>
  <div class="status-content">
    <div class="status-value">
      ${ovulacion.mensaje || "Sin datos disponibles"}
    </div>
    <div class="status-message">
      Fecha estimada: ${ovulacion.fechaAmigable || "—"}
    </div>
  </div>
</div>


    
    <!-- 5. Duración promedio -->
    <div class="status-card card-duration">
      <div class="status-header">
        <div class="status-icon">
          <img src="../assets/img/reloj.png" alt="Duración promedio">
        </div>
        <div class="status-title">Duración promedio</div>
      </div>
      <div class="status-content">
        <div class="status-value">${
          estadisticas.ciclo.duracionPromedio
        } días</div>
        <div class="status-message">De tu ciclo menstrual</div>
      </div>
    </div>
    
    <!-- 6. Último período -->
    <div class="status-card card-last-period">
      <div class="status-header">
        <div class="status-icon">
          <img src="../assets/img/ultimo_periodo.png" alt="Último período">
        </div>
        <div class="status-title">Último período</div>
      </div>
      <div class="status-content">
        <div class="status-value">${formatDate(
          estadisticas.ciclo.ultimoPeriodo
        )}</div>
      </div>
    </div>
  `;

  function getFertilityMessage(level, fallbackMsg) {
    const map = {
      low: "baja",
      moderate: "moderada",
      high: "alta",
    };

    const mappedLevel = map[level.toLowerCase()];
    const messages = {
      baja: "Baja probabilidad de embarazo",
      moderada: "Posibilidades moderadas de embarazo",
      alta: "Alta probabilidad de embarazo",
    };

    return (
      fallbackMsg || messages[mappedLevel] || "Estado de fertilidad actual"
    );
  }

  /* function getOvulationMessage(days) {
    if (days === 0) return "¡Podrías estar ovulando hoy!";
    if (days === 1) return "¡Mañana es tu día más fértil!";
    return `Tu ventana fértil ${days <= 5 ? "se acerca" : "está próxima"}`;
  } */

  // Insights completos
  const insightsCont = document.getElementById("insights-content");
  if (insightsCont) {
    insightsCont.innerHTML = `
      <div class="insight-card important">
        <div class="insight-title">
          <img src="../assets/img/corazon_lavender.png" alt="Síntomas físicos" class="icon-img">
          <h3>Consejo de bienestar</h3>
        </div>
        <div class="insight-content">
          <p>${insights.consejo}</p>
        </div>
      </div>
      
      <div class="insight-card">
        <div class="insight-title">
          <img src="../assets/img/fugaz.png" alt="Síntomas físicos" class="icon-img">
          <h3>Tu estado emocional</h3>
        </div>
        <div class="insight-content">
          <p>${insights.mensaje}</p>
          <ul>
            ${insights.sintomas.emocionales
              .map((s) => `<li>${s}</li>`)
              .join("")}
          </ul>
        </div>
      </div>
      
      <div class="insight-card">
        <div class="insight-title">
          <img src="../assets/img/sintomas_fisicos.png" alt="Síntomas físicos" class="icon-img">
          <h3>Síntomas físicos que podés experimentar</h3>
        </div>
        <div class="insight-content">
          <ul>
            ${insights.sintomas.fisicos.map((s) => `<li>${s}</li>`).join("")}
          </ul>
        </div>
      </div>
      
      <div class="insight-card">
        <div class="insight-title">
          <img src="../assets/img/recomendaciones.png" alt="Recomendaciones" class="icon-img">
          <h3>Estas recomendaciones pueden ayudarte</h3>
        </div>
        <div class="insight-content">
          <ul>
            ${insights.sintomas.consejos.map((c) => `<li>${c}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;
  }
}

/* =========================== DOM  ============================ */

document.addEventListener("DOMContentLoaded", async function () {
  // Leer credenciales actuales
  const userId = getCurrentUserId(); // función que ya definiste
  const userName = localStorage.getItem("userName");
  // Elementos del DOM relacionados al formulario por pasos
  const form = document.getElementById("form-ciclo");
  const formCards = document.querySelectorAll(".form-card"); // Tarjetas del form
  const nextButtons = document.querySelectorAll(".next-btn"); // Botones siguiente
  const prevButtons = document.querySelectorAll(".prev-btn"); // Botones Anterior
  const indicatorDots = document.querySelectorAll(".indicator-dot"); // Puntos para pasar de tarjeta
  cycleList = document.getElementById("lista-ciclos"); // Lista donde se muestran los ciclos
  //emptyState = document.querySelector(".empty-state"); // Tarjeta que indica que no se han ingresado ciclos ( de estado vacío)
  emptyTemplate = document.getElementById("template-empty-state");

  await loadCycles(); // Lee del servidor o LocalStorage
  mostrarCiclos(); // Muestra la lista
  syncPendingCycles(); // Envía pendientes a la  API
  fetchPredictions(); // Obtiene estadísticas

  // —— MENÚ DE USUARIO (TODO este bloque) ——
  const userMenu = document.querySelector(".user-menu");
  const userIcon = document.querySelector(".user-icon");
  const userDropdown = document.querySelector(".user-dropdown");
  const logoutBtn = document.getElementById("logout-btn");

  if (userIcon && userDropdown && logoutBtn) {
    // Mostrar/ocultar menú
    userIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.hidden = !userDropdown.hidden;
    });

    // Cerrar sesión (nuevo)
    logoutBtn.addEventListener("click", () => {
      // 1) Limpiar credenciales y datos de usuario
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("ciclos");

      // 2) Ocultar menú desplegable
      userDropdown.hidden = true;
      userMenu.style.display = "none";

      // 3) Mostrar modal de login/registro
      authModal.classList.add("active");

      // 4) Resetear saludo al estado genérico
      greetingText.innerHTML = `
       <span class="icon">
         <img src="../assets/img/luna.png" alt="Luna" class="icon-img">
       </span>
       ¡Hola! ¿Cómo te sentís hoy?
     `;
    });

    // Ocultar menú al hacer clic fuera
    document.addEventListener("click", (e) => {
      if (!userMenu.contains(e.target)) {
        userDropdown.hidden = true;
      }
    });

    // Función para actualizar visibilidad del menú
    function updateAuthStateUI() {
      if (localStorage.getItem("userId")) {
        userMenu.style.display = "block";
        userDropdown.hidden = true;
      } else {
        userMenu.style.display = "none";
      }
    }

    // Ensamblamos updateAuthStateUI dentro de los estados
    const origShowAuth = showAuthenticatedState;
    showAuthenticatedState = () => {
      origShowAuth();
      updateAuthStateUI();
    };

    const origShowUnauth = showUnauthenticatedState;
    showUnauthenticatedState = () => {
      origShowUnauth();
      updateAuthStateUI();
    };

    // Mostrar/Ocultar al cargar
    updateAuthStateUI();
  }

  // Al cargar la página
  if (userId && userName) {
    showAuthenticatedState();
    // Si la usuaria ya está logueada, se cargan sus ciclos reales o de ejemplo
    await loadCycles();
    // Se muestra la lista de ciclos y se piden predicciones
    mostrarCiclos();
    fetchPredictions();
  } else {
    showUnauthenticatedState();
    // Eliminar nombre anterior si existe
    localStorage.removeItem("nombre");
    // En no‐login también se cargan ejemplos
    await loadCycles();
    mostrarCiclos();
  }

  // Función para mostrar errores
  function showError(form, message) {
    // Eliminar errores anteriores en este formulario
    const existingError = form.querySelector(".error-message");
    if (existingError) existingError.remove();

    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent = message;

    // Insertar después del último elemento del formulario
    form.appendChild(errorElement);
  }

  let currentStep = 0; // Paso actual del formulario

  // Función para cambiar de tarjeta en el formulario por pasos
  function updateStep(newStep) {
    // Se oculta tarjeta actual
    formCards[currentStep].classList.remove("active");
    indicatorDots[currentStep].classList.remove("active");

    // Se muestra una tarjeta nueva
    currentStep = newStep;
    formCards[currentStep].classList.add("active");
    indicatorDots[currentStep].classList.add("active");
  }

  // Event listeners para cambiar de tarjeta al hacer click en botones Siguiente
  nextButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (currentStep < formCards.length - 1) {
        updateStep(currentStep + 1);
      }
    });
  });

  // Event listeners para volver atrás al hacer click en botones Anterior
  prevButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (currentStep > 0) {
        updateStep(currentStep - 1);
      }
    });
  });

  /* ========== Registro de datos ingresados mediante el formulario ========== */
  /* 
// Se obtiene la información ingresada (fecha, duración, síntomas)
// Se crea un nuevo objeto y se agrega al array ciclos
// Se eliminan los ciclos de de ejemplo y se actualiza la lista con los nuevos datos
*/

  // Envío del formulario
  form.addEventListener("submit", async function (e) {
    e.preventDefault(); // Evita que se recargue la página

    // Se obtienen los valores ingresados por la usuaria en el formulario
    const fecha = document.getElementById("fecha").value;
    const duracion = parseInt(document.getElementById("duracion").value);
    const sintomas = document.getElementById("sintomas").value;

    // Validación simple: si no se ingresó fecha o duración, se muestra un mensaje de error
    if (!fecha || isNaN(duracion) || duracion <= 0) {
      alert("Por favor, completa todos los campos correctamente.");
      return; // Detiene la ejecución si hay error
    }

    // Se eliminan los ciclos de muestra al agregar el primer ciclo real
    if (ciclosPrecargados) {
      localStorage.removeItem("ciclos");
      ciclosPrecargados = false; // Evita que esto vuelva a ejecutarse
      ciclos = []; // Se eliminan todos los ciclos actuales (los de ejemplo)
    }

    // Se crea un nuevo objeto con los nuevos datos ingresados del ciclo
    const nuevoCiclo = {
      id: ciclos[ciclos.length - 1]?.id + 1 || 1, // ID autoincremental
      fecha,
      duracion,
      sintomas,
      synced: false, // marca como “pendiente” de enviar al servidor
      example: false,
    };

    // Se agrega el nuevo ciclo al array
    ciclos.push(nuevoCiclo);

    localStorage.setItem("ciclos", JSON.stringify(ciclos));

    // Intentar sincronizar inmediatamente los ciclos pendientes
    //syncPendingCycles();

    // Se actualiza la lista de ciclos en pantalla
    //mostrarCiclos();

    // Se actualiza ciclosPrecargados para avisar que ya no deben mostrarse solo los ciclos de prueba
    //ciclosPrecargados = false;

    // Se vuelve a mostrar la lista actualizada
    //mostrarCiclos();

    // Esperar a que ambos ciclos (1º y 2º) se suban al backend
    await syncPendingCycles();
    // Refrescar UI y estadísticas inmediatamente
    ciclosPrecargados = false;
    mostrarCiclos();
    fetchPredictions();

    // Se resetea el formulario y se vuelve al primer paso
    form.reset();
    updateStep(0);

    // Se muestra animación de éxito de carga de datos
    showSuccessAnimation();
  });

  /* ========== Mostrar notificación animada al guardar un ciclo ========== */
  /* 
  - Se crea una notificación (toast) con estilos
  - Se elimina automáticamente después de unos segundos  */

  // Se muestra animación cuando se guarda un ciclo con éxito
  function showSuccessAnimation() {
    const successMsg = document.createElement("div");
    successMsg.style.cssText = `
      position: fixed;
      top: 30px;
      right: 30px;
      background: var(--accent-mint);
      color: var(--dark-brown);
      padding: 1.2rem 2rem;
      border-radius: var(--element-radius);
      box-shadow: var(--shadow-hover);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 1rem;
      font-weight: 600;
      font-size: 1rem;
      animation: slideIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), fadeOut 0.6s ease 3s forwards;
      border-radius: var(--card-radius);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.8);
    `;

    successMsg.innerHTML = `
      <i class="fas fa-check-circle" style="color: var(--accent-lavender); font-size: 1.6rem;"></i>
      <div>Ciclo registrado exitosamente</div>
    `;

    document.body.appendChild(successMsg);

    // Se remueve animación después de 3.6 segundos
    setTimeout(() => {
      if (successMsg.parentNode === document.body) {
        document.body.removeChild(successMsg);
      }
    }, 3600);
  }

  // Se agregan estilos de animación para el mensaje de éxito de carga de de ciclo
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%) translateY(20px); opacity: 0; }
      to { transform: translateX(0) translateY(0); opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-20px); }
    }
  `;
  document.head.appendChild(style);
});
