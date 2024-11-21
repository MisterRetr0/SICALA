// Definimos la URL del backend directamente en el código
const BACKEND_URL = 'https://sicalaback.onrender.com';  // URL de tu backend

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

function showLoading() {
  loadingDiv.classList.remove('hidden');
  updateLoadingMessage();  // Mostrar el primer mensaje de carga
}

function hideLoading() {
  loadingDiv.classList.add('hidden');
  clearInterval(loadingInterval); // Detener la animación de puntos
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
  const isValid = validateForm(e);
  if (!isValid) return;

  const email = emailInput.value;
  const password = passwordInput.value;

  // Mostrar el cargando
  showLoading();

  try {
    // Enviar solicitud de login al backend
    const response = await fetch(`${BACKEND_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const data = await response.json();

    if (response.ok && data.showPostLogin) {
      // Si el login fue exitoso, mostramos la página post-login
      postLoginContainer.classList.remove('hidden');
      accessButton.classList.remove('hidden');
      logoutButton.classList.remove('hidden');
      loginContainer.classList.add('hidden');  // Ocultar el login
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
