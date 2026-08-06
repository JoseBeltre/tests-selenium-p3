const { Builder, By, until } = require('selenium-webdriver');
const {
  entrarAutenticado,
  crearTarea,
  buscarTarea,
  esperarTarea,
  escribirEnCampo,
  existeElemento,
  titulosDeTareas,
  tareasGuardadas,
  capturar,
  ESPERA
} = require('../helpers/app');

describe('HU-04 Actualizar tarea', function () {
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

  async function abrirEdicion (titulo) {
    const tarea = await buscarTarea(driver, titulo);
    await tarea.findElement(By.css('.expand-task-btn')).click();
    await tarea.findElement(By.css('.edit-task-btn')).click();
    await driver.wait(until.elementLocated(By.id('title')), ESPERA);
  }

  it('Camino feliz: al editar y guardar el cambio se refleja en la lista y persiste', async function () {
    await entrarAutenticado(driver);
    await crearTarea(driver, 'Titulo original');

    await abrirEdicion('Titulo original');
    await escribirEnCampo(driver, 'title', 'Titulo editado');
    const boton = await driver.findElement(By.id('task-submit-btn'));
    await boton.click();
    await driver.wait(until.stalenessOf(boton), ESPERA);

    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.css('.task')), ESPERA);

    const titulos = await titulosDeTareas(driver);
    expect(titulos).toContain('Titulo editado');
    expect(titulos).not.toContain('Titulo original');

    const guardadas = await tareasGuardadas(driver);
    expect(guardadas[0].title).toBe('Titulo editado');
  });

  it('Prueba negativa: no se permite guardar una edicion con el titulo vacio', async function () {
    await entrarAutenticado(driver);
    await crearTarea(driver, 'Tarea sin cambios');

    await abrirEdicion('Tarea sin cambios');
    await escribirEnCampo(driver, 'title', '');
    await driver.findElement(By.id('task-submit-btn')).click();

    const error = await driver.wait(until.elementLocated(By.id('task-error-msg')), ESPERA);
    expect(await error.isDisplayed()).toBe(true);
    expect(await existeElemento(driver, By.id('title'))).toBe(true);

    const guardadas = await tareasGuardadas(driver);
    expect(guardadas[0].title).toBe('Tarea sin cambios');
  });

  it('Prueba de limites: se puede editar hasta el largo maximo permitido sin errores', async function () {
    const tituloLargo = 'B'.repeat(50);

    await entrarAutenticado(driver);
    await crearTarea(driver, 'Titulo corto');

    await abrirEdicion('Titulo corto');
    await escribirEnCampo(driver, 'title', tituloLargo);
    const boton = await driver.findElement(By.id('task-submit-btn'));
    await boton.click();
    await driver.wait(until.stalenessOf(boton), ESPERA);
    await esperarTarea(driver, tituloLargo);

    expect(await existeElemento(driver, By.id('task-error-msg'))).toBe(false);

    const guardadas = await tareasGuardadas(driver);
    expect(guardadas[0].title).toHaveLength(50);
    expect(await titulosDeTareas(driver)).toContain(tituloLargo);
  });
});
