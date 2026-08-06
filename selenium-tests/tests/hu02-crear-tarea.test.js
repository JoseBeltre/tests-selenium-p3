const { Builder, By, until } = require('selenium-webdriver');
const {
  entrarAutenticado,
  crearTarea,
  abrirModalTarea,
  existeElemento,
  contarTareas,
  titulosDeTareas,
  tareasGuardadas,
  capturar,
  ESPERA
} = require('../helpers/app');

describe('HU-02 Crear tarea', function () {
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

  it('Camino feliz: la tarea se agrega a la lista y persiste tras recargar', async function () {
    await entrarAutenticado(driver);
    await crearTarea(driver, 'Comprar pan', 'Ir al colmado de la esquina');

    expect(await contarTareas(driver)).toBe(1);
    expect(await titulosDeTareas(driver)).toContain('Comprar pan');

    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.css('.task')), ESPERA);

    expect(await titulosDeTareas(driver)).toContain('Comprar pan');
    const guardadas = await tareasGuardadas(driver);
    expect(guardadas.length).toBe(1);
    expect(guardadas[0].title).toBe('Comprar pan');
  });

  it('Prueba negativa: con el titulo vacio no se agrega la tarea', async function () {
    await entrarAutenticado(driver);
    await abrirModalTarea(driver);
    await driver.findElement(By.id('task-submit-btn')).click();

    const error = await driver.wait(until.elementLocated(By.id('task-error-msg')), ESPERA);
    expect(await error.isDisplayed()).toBe(true);
    expect(await existeElemento(driver, By.id('title'))).toBe(true);

    const guardadas = await tareasGuardadas(driver);
    expect(guardadas.length).toBe(0);
  });

  it('Prueba de limites: con el titulo en el largo maximo permitido la tarea se agrega', async function () {
    const tituloLargo = 'A'.repeat(50);

    await entrarAutenticado(driver);
    await crearTarea(driver, tituloLargo);

    expect(await contarTareas(driver)).toBe(1);
    expect(await existeElemento(driver, By.id('task-error-msg'))).toBe(false);

    const guardadas = await tareasGuardadas(driver);
    expect(guardadas[0].title).toHaveLength(50);
  });
});
