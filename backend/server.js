const express = require('express');
const puppeteer = require('puppeteer');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const robot = require('robotjs');  // Importar robotjs para obtener el tamaño de la pantalla

app.use(express.json());
app.use(cookieParser());

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:5500',  // URL del frontend
  methods: ['GET', 'POST'],
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
      headless: true,  // Modo invisible
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
      headless: true,  // Modo invisible
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
      headless: false,  // Modo visible
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    page = await browser.newPage();

    // Obtener las dimensiones de la pantalla completa usando robotjs
    const screenSize = robot.getScreenSize();  // Obtener el tamaño de la pantalla
    const { width, height } = screenSize;      // Extraer ancho y alto

    // Establecer el viewport al tamaño máximo de la pantalla
    await page.setViewport({ width, height });

    // Restaurar cookies
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
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});