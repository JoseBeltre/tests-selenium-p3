const { Builder, By, until } = require('selenium-webdriver');
const {
  entrarAutenticado,
  crearTarea,
  buscarTarea,
  contarTareas,
  titulosDeTareas,
  tareasGuardadas,
  capturar,
  ESPERA
} = require('../helpers/app');

describe('HU-05 Eliminar tarea', function () {
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

  async function abrirModalEliminar (titulo) {
    const tarea = await buscarTarea(driver, titulo);
    await tarea.findElement(By.css('.delete-task-btn')).click();
    await driver.wait(until.elementLocated(By.id('confirm-delete-btn')), ESPERA);
  }

  it('Camino feliz: al confirmar la tarea desaparece y el resto queda intacto', async function () {
    await entrarAutenticado(driver);
    await crearTarea(driver, 'Tarea a eliminar');
    await crearTarea(driver, 'Tarea que se queda');

    await abrirModalEliminar('Tarea a eliminar');
    const boton = await driver.findElement(By.id('confirm-delete-btn'));
    await boton.click();
    await driver.wait(until.stalenessOf(boton), ESPERA);

    await driver.wait(async function () {
      return await contarTareas(driver) === 1;
    }, ESPERA);

    const titulos = await titulosDeTareas(driver);
    expect(titulos).not.toContain('Tarea a eliminar');
    expect(titulos).toContain('Tarea que se queda');

    const guardadas = await tareasGuardadas(driver);
    expect(guardadas.length).toBe(1);
    expect(guardadas[0].title).toBe('Tarea que se queda');
  });

  it('Prueba negativa: al cancelar la eliminacion la tarea se mantiene', async function () {
    await entrarAutenticado(driver);
    await crearTarea(driver, 'Tarea protegida');

    await abrirModalEliminar('Tarea protegida');
    const boton = await driver.findElement(By.id('cancel-delete-btn'));
    await boton.click();
    await driver.wait(until.stalenessOf(boton), ESPERA);

    expect(await contarTareas(driver)).toBe(1);
    expect(await titulosDeTareas(driver)).toContain('Tarea protegida');

    const guardadas = await tareasGuardadas(driver);
    expect(guardadas.length).toBe(1);
  });

  it('Prueba de limites: al eliminar la ultima tarea queda el estado vacio sin errores', async function () {
    await entrarAutenticado(driver);
    await crearTarea(driver, 'Unica tarea');

    await abrirModalEliminar('Unica tarea');
    const boton = await driver.findElement(By.id('confirm-delete-btn'));
    await boton.click();
    await driver.wait(until.stalenessOf(boton), ESPERA);

    const mensaje = await driver.wait(until.elementLocated(By.id('empty-tasks-msg')), ESPERA);
    expect(await mensaje.isDisplayed()).toBe(true);
    expect(await contarTareas(driver)).toBe(0);

    const guardadas = await tareasGuardadas(driver);
    expect(guardadas.length).toBe(0);
  });
});
