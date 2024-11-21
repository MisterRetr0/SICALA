// Variables de elementos HTML
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loadingDiv = document.getElementById('loading');
const loadingText = document.getElementById('loadingText');
const loginContainer = document.getElementById('loginContainer');
const postLoginContainer = document.getElementById('postLoginContainer');
const accessButton = document.getElementById('accessButton');
const logoutButton = document.getElementById('logoutButton');
const chamiLoadingMessage = document.getElementById('chamiLoadingMessage');

// Inicialmente, el contenedor post-login y el botón "Acceder a Chami" deben estar ocultos
postLoginContainer.classList.add('hidden');
accessButton.classList.add('hidden');
chamiLoadingMessage.classList.add('hidden');

// Variables para controlar el estado de carga
let loadingInterval;
let loadingMessageIndex = 0;
const loadingMessages = [
  'Cargando...',
  'Ve por un café :D',
  'Gracias por preferirnos',
];

// Función para mostrar el mensaje de carga
function showLoading() {
  loadingDiv.classList.remove('hidden');
  updateLoadingMessage();  // Mostrar el primer mensaje de carga
}

// Función para ocultar el mensaje de carga
function hideLoading() {
  loadingDiv.classList.add('hidden');
  clearInterval(loadingInterval); // Detener la animación de puntos
}

// Función para actualizar el mensaje de carga con animación de puntos
function updateLoadingMessage() {
  loadingText.textContent = loadingMessages[loadingMessageIndex];
  loadingMessageIndex = (loadingMessageIndex + 1) % loadingMessages.length;

  // Cambio dinámico de los puntos suspensivos
  let dotsCount = 0;
  loadingInterval = setInterval(() => {
    loadingText.textContent = `${loadingMessages[loadingMessageIndex]}${'.'.repeat(dotsCount)}`;
    dotsCount = (dotsCount + 1) % 4; // Controla el número de puntos (1, 2, 3, 4)
  }, 500);  // Cambiar el texto cada 500ms
}

// Función de validación
function validateForm(event) {
  event.preventDefault(); // Evita que el formulario se envíe mientras validamos

  // Obtener los valores de los campos
  const email = emailInput.value;
  const password = passwordInput.value;
  const errorMessage = document.getElementById('errorMessage'); // Aquí está el acceso al errorMessage
  
  // Limpiar mensaje de error
  errorMessage.style.display = 'none'; // Se asegura de que el mensaje se oculte antes de validar

  // Expresión regular para validar el email (básica)
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  // Verificar si el email es válido
  if (!emailRegex.test(email)) {
    errorMessage.textContent = 'Por favor, ingresa un email válido.';
    errorMessage.style.display = 'block';
    return false; // No continuar con el envío del formulario
  }

  // Validar si el password es seguro
  const unsafeCharsRegex = /[;'\\"<>{}]/; // Caracteres comunes para inyecciones SQL/XSS

  if (unsafeCharsRegex.test(password)) {
    errorMessage.textContent = 'La contraseña contiene caracteres no permitidos.';
    errorMessage.innerHTML += '<br>Por favor no usar ninguno de los siguientes caracteres: <br>&#47;&#59;&quot;&apos;&lt;&gt;{ }';
    errorMessage.style.display = 'block';
    return false; // No continuar con el envío del formulario
  }

  return true; // Si todo está bien, se puede continuar
}

// Al enviar el formulario de login
loginForm.addEventListener('submit', async (e) => {
  // Primero, validamos el formulario
  const isValid = validateForm(e);
  if (!isValid) return; // Si la validación falla, no continuamos

  // Si la validación es exitosa, procedemos con el envío
  const email = emailInput.value;
  const password = passwordInput.value;

  // Mostrar el cargando
  showLoading();
  postLoginContainer.classList.add('hidden');
  accessButton.classList.add('hidden');

  try {
    console.log('Enviando solicitud de login...');
    // Enviar solicitud de login al backend
    const response = await fetch('https://sicalaback.onrender.com/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const data = await response.json();

    if (response.ok && !data.showPostLogin) {
      // Si el login fue exitoso, mostramos el contenedor post-login
      postLoginContainer.classList.remove('hidden');
      accessButton.classList.remove('hidden');
      logoutButton.classList.remove('hidden');

      // Ocultar el formulario de login después del login exitoso
      loginContainer.classList.add('hidden');
    } else {
      alert('Error al realizar login: ' + data.message);
    }
  } catch (error) {
    console.error('Error de red:', error);
    alert('Error al realizar login');
  } finally {
    // Ocultar el cargando
    hideLoading();
  }
});

// Función para realizar el autologin a Chami y mostrar la página post-login
async function accessChami() {
  console.log('Intentando acceder a Chami...');
  showLoading();  // Mostrar mensaje de carga

  try {
    // Solicitar al backend que realice el autologin
    const response = await fetch('https://sicalaback.onrender.com/autologin', {
      method: 'POST',
      credentials: 'include',  // Asegura que las cookies de sesión se envíen
    });

    const data = await response.json();
    console.log('Respuesta del backend:', data); // Ver la respuesta que llega del backend

    if (response.ok && data.showPostLogin) {
      // Si el login fue exitoso, mostramos el contenido post-login en la nueva ventana
      alert('Acceso a Chami exitoso');
    } else {
      alert('Error al realizar el autologin');
    }
  } catch (error) {
    console.error('Error de red al acceder a Chami:', error);
    alert('Error al acceder a Chami');
  } finally {
    hideLoading();
  }
}

// Cargar el evento al hacer click en el botón de acceder a Chami
accessButton.addEventListener('click', async () => {
  console.log('Botón de acceso a Chami presionado...');
  await accessChami();  // Llamar a la función accessChami
});

// Cerrar sesión
logoutButton.addEventListener('click', async () => {
  console.log('Cerrando sesión...');
  showLoading(); // Mostrar pantalla de carga durante el cierre de sesión

  const response = await fetch('https://sicalaback.onrender.com/logout', {
    method: 'POST',
    credentials: 'include',
  });

  const data = await response.json();
  alert(data.message);

  // Volver a mostrar el formulario de login
  postLoginContainer.classList.add('hidden');
  accessButton.classList.add('hidden');
  loginContainer.classList.remove('hidden');

  hideLoading(); // Ocultar la pantalla de carga después de cerrar sesión
});
