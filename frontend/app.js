// Variables de elementos HTML
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loadingDiv = document.getElementById('loading');
const loginContainer = document.getElementById('loginContainer');
const postLoginContainer = document.getElementById('postLoginContainer');
const accessButton = document.getElementById('accessButton');
const logoutButton = document.getElementById('logoutButton');
const chamiLoadingMessage = document.getElementById('chamiLoadingMessage');

// Inicialmente, el contenedor post-login y el botón "Acceder a Chami" deben estar ocultos
postLoginContainer.classList.add('hidden');
accessButton.classList.add('hidden');
chamiLoadingMessage.classList.add('hidden');

// Al enviar el formulario de login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value;
  const password = passwordInput.value;

  // Mostrar el cargando
  loadingDiv.classList.remove('hidden');
  postLoginContainer.classList.add('hidden');
  accessButton.classList.add('hidden');

  try {
    console.log('Enviando solicitud de login...');
    // Enviar solicitud de login al backend
    const response = await fetch('http://localhost:3000/login', {
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
    loadingDiv.classList.add('hidden');
  }
});

// Función para realizar el autologin a Chami y mostrar la página post-login
async function accessChami() {
  console.log('Intentando acceder a Chami...');
  chamiLoadingMessage.classList.remove('hidden');  // Mostrar mensaje de carga

  try {
    // Solicitar al backend que realice el autologin
    const response = await fetch('http://localhost:3000/autologin', {
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
    chamiLoadingMessage.classList.add('hidden');
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
  const response = await fetch('http://localhost:3000/logout', {
    method: 'POST',
    credentials: 'include',
  });

  const data = await response.json();
  alert(data.message);

  // Volver a mostrar el formulario de login
  postLoginContainer.classList.add('hidden');
  accessButton.classList.add('hidden');
  loginContainer.classList.remove('hidden');
});
