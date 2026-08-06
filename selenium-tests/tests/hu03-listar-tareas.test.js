const { Builder, By, until } = require('selenium-webdriver');
const {
  entrarAutenticado,
  crearTarea,
  contarTareas,
  titulosDeTareas,
  capturar,
  ESPERA
} = require('../helpers/app');

describe('HU-03 Listar tareas', function () {
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

  it('Camino feliz: todas las tareas creadas se muestran en la lista', async function () {
    await entrarAutenticado(driver);
    await crearTarea(driver, 'Lavar los platos');
    await crearTarea(driver, 'Sacar la basura');
    await crearTarea(driver, 'Estudiar para el examen');

    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.css('.task')), ESPERA);

    expect(await contarTareas(driver)).toBe(3);
    const titulos = await titulosDeTareas(driver);
    expect(titulos).toContain('Lavar los platos');
    expect(titulos).toContain('Sacar la basura');
    expect(titulos).toContain('Estudiar para el examen');
  });
});
