const { Builder, By, until } = require('selenium-webdriver');
const {
  abrirApp,
  registrarse,
  iniciarSesion,
  cerrarSesion,
  capturar,
  existeElemento,
  USUARIO,
  ESPERA
} = require('../helpers/app');

describe('HU-01 Inicio de sesion', function () {
  let driver;

  beforeAll(async function () {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().setRect({ width: 1280, height: 900 });
  });

  afterEach(async function () {
    await capturar(driver, expect.getState().currentTestName);
  });

  afterAll(async function () {
    await driver.quit();
  });

  it('Camino feliz: con credenciales validas el sistema muestra la vista de tareas', async function () {
    await abrirApp(driver);
    await registrarse(driver);
    await cerrarSesion(driver);
    await iniciarSesion(driver, USUARIO.correo, USUARIO.clave);

    const titulo = await driver.wait(until.elementLocated(By.css('h1.tasks-title')), ESPERA);
    expect(await titulo.isDisplayed()).toBe(true);
  });

  it('Prueba negativa: con la contrasena incorrecta muestra un error y no permite entrar', async function () {
    await abrirApp(driver);
    await registrarse(driver);
    await cerrarSesion(driver);
    await iniciarSesion(driver, USUARIO.correo, 'claveIncorrecta9');

    const error = await driver.wait(until.elementLocated(By.id('login-error-msg')), ESPERA);
    expect(await error.isDisplayed()).toBe(true);
    expect(await error.getText()).toBe('Correo o contraseña incorrectos.');
    expect(await existeElemento(driver, By.css('h1.tasks-title'))).toBe(false);
  });
});
