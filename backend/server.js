const express = require('express');
const puppeteer = require('puppeteer');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();

// Definimos las URLs directamente en el código
const FRONTEND_URL = 'https://sicala-8qlk.onrender.com';  
const BACKEND_URL = 'https://sicalaback.onrender.com';   

const PORT = 3000;  // Puerto donde corre el backend

app.use(express.json());
app.use(cookieParser());

// Configuración de CORS: Usamos la URL del frontend directamente
app.use(cors({
  origin: FRONTEND_URL,  // URL del frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // Permite que las cookies se envíen y reciban
}));

let browser;  // Variable global para el navegador Puppeteer
let page;      // Página activa en Puppeteer
let credentials = null;  // Variable para guardar las credenciales del usuario

// Ruta para hacer login invisible
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  try {
    // Lanzamos Puppeteer en modo invisible (headless)
    browser = await puppeteer.launch({
      executablePath: '/opt/render/.cache/puppeteer/chrome/linux-xxxx/', 
      headless: false,  // Modo invisible
      args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--headless',
      '--disable-dev-shm-usage'
      ]
    });

    page = await browser.newPage();
    await page.goto('https://chami.ucp.edu.co/login'); // URL de login

    // Llenamos los campos de login
    await page.waitForSelector('#mail');
    await page.type('#mail', email);

    await page.waitForSelector('#password');
    await page.type('#password', password);

    await page.click('#btnSession'); // Hacer click en el botón de login

    // Esperamos a que se complete el login y redirija a la página post-login
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

    // Verificamos que llegamos a la página post-login (por ejemplo, comprobando que un elemento está presente)
    await page.waitForSelector('.section-container');  // Asegúrate de que este selector es el correcto para la página post-login

    // Guardamos las credenciales para el autologin
    credentials = { email, password };

    // Respondemos al frontend con la confirmación de login
    res.status(200).json({
      showPostLogin: false,  // El frontend solo recibe un éxito en el login
    });
  } catch (error) {
    console.error('Error al realizar login:', error);
    res.status(500).json({ message: 'Error al realizar login', error: error.message });
  }
});

// Ruta para acceder a la página post-login con navegador visible
app.post('/autologin', async (req, res) => {
  console.log('Iniciando solicitud de autologin...');

  if (!credentials) {
    console.log('No hay credenciales guardadas');
    return res.status(400).json({ message: 'No se ha realizado login previamente' });
  }

  try {
    // Lanzamos Puppeteer en modo headless (invisible) sin desactivar la seguridad
    browser = await puppeteer.launch({
      executablePath: '/opt/render/.cache/puppeteer/chrome/linux-xxxx/',
      headless: true,  // Modo invisible
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--headless',
        '--disable-dev-shm-usage'
      ]
    });

    page = await browser.newPage();
    await page.goto('https://chami.ucp.edu.co/login'); // URL de login

    // Llenamos los campos de login con las credenciales guardadas
    await page.waitForSelector('#mail');
    await page.type('#mail', credentials.email);

    await page.waitForSelector('#password');
    await page.type('#password', credentials.password);

    await page.click('#btnSession'); // Hacer click en el botón de login

    // Esperamos a que se complete el login y redirija a la página post-login
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

    // Verificamos que llegamos a la página post-login (por ejemplo, comprobando que un elemento está presente)
    await page.waitForSelector('.section-container');  // Asegúrate de que este selector es el correcto para la página post-login

    // Guardamos las cookies antes de cerrar el navegador
    const cookies = await page.cookies();

    // Navegar al dashboard (post-login)
    const postLoginUrl = 'https://chami.ucp.edu.co/dashboard';
    await page.goto(postLoginUrl, { waitUntil: 'domcontentloaded' });

    // Esperar el selector del dashboard para asegurarnos de que la página se cargó correctamente
    await page.waitForSelector('.topnavbar-wrapper', { timeout: 60000 });

    console.log('Página post-login cargada correctamente.');

    // Cerramos el navegador invisible
    await browser.close();

    // Lanzamos Puppeteer en modo visible (ahora con dimensiones personalizadas)
    browser = await puppeteer.launch({
      executablePath: '/opt/render/.cache/puppeteer/chrome/linux-xxxx/',
      headless: false,  // Modo visible
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--headless',
        '--disable-dev-shm-usage'
      ]
    });

    page = await browser.newPage();

    // Establecer un viewport de tamaño predeterminado (ejemplo: 1920x1080)
    await page.setViewport({ width: 1920, height: 1080 });

    // Restaurar las cookies
    await page.setCookie(...cookies);

    // Ahora que hemos restaurado las cookies, podemos acceder a la URL post-login
    await page.goto(postLoginUrl, { waitUntil: 'domcontentloaded' });

    // Respondemos al frontend para indicar que el autologin se completó exitosamente
    res.status(200).json({
      showPostLogin: true,  // Se puede mostrar la página post-login al frontend
    });

  } catch (error) {
    console.error('Error al acceder a la página post-login:', error);
    res.status(500).json({ message: 'Error al acceder a Chami', error: error.message });
  }
});

// Ruta para cerrar sesión
app.post('/logout', async (req, res) => {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
    credentials = null;  // Limpiar las credenciales cuando se cierre sesión
  }
  res.status(200).json({ message: 'Sesión cerrada exitosamente' });
});

// Iniciamos el servidor
app.listen(PORT, () => {
  console.log(`Backend corriendo en ${BACKEND_URL}`);
});
