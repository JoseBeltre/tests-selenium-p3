const { Builder, By, until } = require('selenium-webdriver');
const {
  entrarAutenticado,
  crearTarea,
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
});
