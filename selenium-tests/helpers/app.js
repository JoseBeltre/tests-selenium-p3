const fs = require('fs');
const path = require('path');
const { By, until, Key } = require('selenium-webdriver');
const { addAttach } = require('jest-html-reporters/helper');

const URL_APP = 'http://localhost:5173/todo-app/';
const ESPERA = 10000;
const CARPETA_CAPTURAS = path.join(__dirname, '..', 'capturas');

const USUARIO = {
  nombre: 'Jose Test',
  correo: 'jose.test@example.com',
  clave: 'clave1234'
};

async function abrirApp (driver) {
  await driver.get(URL_APP);
  await driver.executeScript('window.localStorage.clear();');
  await driver.navigate().refresh();
  await driver.wait(until.elementLocated(By.id('login-email')), ESPERA);
}

async function registrarse (driver) {
  await driver.findElement(By.name('tab-register')).click();
  await driver.findElement(By.id('register-name')).sendKeys(USUARIO.nombre);
  await driver.findElement(By.id('register-email')).sendKeys(USUARIO.correo);
  await driver.findElement(By.id('register-password')).sendKeys(USUARIO.clave);
  await driver.findElement(By.id('register-confirm-password')).sendKeys(USUARIO.clave);
  await driver.findElement(By.id('register-btn')).click();
  await driver.wait(until.elementLocated(By.css('h1.tasks-title')), ESPERA);
}

async function iniciarSesion (driver, correo, clave) {
  await driver.findElement(By.name('tab-login')).click();
  await driver.findElement(By.id('login-email')).sendKeys(correo);
  await driver.findElement(By.id('login-password')).sendKeys(clave);
  await driver.findElement(By.id('login-btn')).click();
}

async function cerrarSesion (driver) {
  await driver.findElement(By.name('logout')).click();
  await driver.wait(until.elementLocated(By.id('login-email')), ESPERA);
}

async function entrarAutenticado (driver) {
  await abrirApp(driver);
  await registrarse(driver);
}

async function abrirModalTarea (driver) {
  await driver.findElement(By.id('new-task-btn')).click();
  await driver.wait(until.elementLocated(By.id('title')), ESPERA);
}

async function crearTarea (driver, titulo, descripcion) {
  await abrirModalTarea(driver);
  await driver.findElement(By.id('title')).sendKeys(titulo);
  if (descripcion) {
    await driver.findElement(By.id('description')).sendKeys(descripcion);
  }
  const boton = await driver.findElement(By.id('task-submit-btn'));
  await boton.click();
  await driver.wait(until.stalenessOf(boton), ESPERA);
  await esperarTarea(driver, titulo);
}

async function esperarTarea (driver, titulo) {
  await driver.wait(async function () {
    const titulos = await titulosDeTareas(driver);
    return titulos.includes(titulo);
  }, ESPERA);
}

async function escribirEnCampo (driver, id, texto) {
  const campo = await driver.findElement(By.id(id));
  await campo.sendKeys(Key.chord(Key.CONTROL, 'a'), Key.BACK_SPACE);
  if (texto) {
    await campo.sendKeys(texto);
  }
}

async function contarTareas (driver) {
  const tareas = await driver.findElements(By.css('.task'));
  return tareas.length;
}

async function buscarTarea (driver, titulo) {
  const tareas = await driver.findElements(By.css('.task'));
  for (const tarea of tareas) {
    const texto = await tarea.findElement(By.css('.task-title')).getText();
    if (texto === titulo) {
      return tarea;
    }
  }
  return null;
}

async function titulosDeTareas (driver) {
  const titulos = await driver.findElements(By.css('.task-title'));
  const textos = [];
  for (const titulo of titulos) {
    textos.push(await titulo.getText());
  }
  return textos;
}

async function tareasGuardadas (driver) {
  return driver.executeScript(
    "const llave = Object.keys(window.localStorage).find(k => k.startsWith('tasks:'));" +
    'return llave ? JSON.parse(window.localStorage.getItem(llave)) : [];'
  );
}

async function existeElemento (driver, localizador) {
  const elementos = await driver.findElements(localizador);
  return elementos.length > 0;
}

async function capturar (driver, nombre) {
  const imagen = await driver.takeScreenshot();
  if (!fs.existsSync(CARPETA_CAPTURAS)) {
    fs.mkdirSync(CARPETA_CAPTURAS, { recursive: true });
  }
  const archivo = nombre.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase() + '.png';
  fs.writeFileSync(path.join(CARPETA_CAPTURAS, archivo), imagen, 'base64');
  await addAttach({
    attach: Buffer.from(imagen, 'base64'),
    description: nombre,
    bufferFormat: 'png'
  });
}

module.exports = {
  URL_APP,
  ESPERA,
  USUARIO,
  abrirApp,
  registrarse,
  iniciarSesion,
  cerrarSesion,
  entrarAutenticado,
  abrirModalTarea,
  crearTarea,
  esperarTarea,
  escribirEnCampo,
  contarTareas,
  buscarTarea,
  titulosDeTareas,
  tareasGuardadas,
  existeElemento,
  capturar
};
