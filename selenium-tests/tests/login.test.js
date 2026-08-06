const { Builder, By, until } = require('selenium-webdriver');

describe('Tests de Login', function () {
  let driver;

  beforeAll(async function () {
    driver = await new Builder().forBrowser('chrome').build();
  });

  it('Camino feliz: con credenciales válidas, el sistema redirige a la vista de tareas.', async function () {
    await driver.get('http://localhost:5173/todo-app/');

    await driver.executeScript('window.localStorage.clear();');
    await driver.navigate().refresh();

    await driver.findElement(By.name('tab-register')).click();
    await driver.findElement(By.id('register-name')).sendKeys('Test123');
    await driver.findElement(By.id('register-email')).sendKeys('test123@example.com');
    await driver.findElement(By.id('register-password')).sendKeys('clave123');
    await driver.findElement(By.id('register-confirm-password')).sendKeys('clave123');
    await driver.findElement(By.id('register-btn')).click();
    await driver.wait(until.elementLocated(By.css('h1.tasks-title')), 5000);
    await driver.findElement(By.name('logout')).click();

    await driver.findElement(By.name('tab-login')).click();
    await driver.findElement(By.id('login-email')).sendKeys('test123@example.com');
    await driver.findElement(By.id('login-password')).sendKeys('clave123');
    await driver.findElement(By.id('login-btn')).click();

    const heading = await driver.wait(
      until.elementLocated(By.css('h1.tasks-title')), 5000
    );
    expect(await heading.isDisplayed()).toBe(true);
  });

  it('Camino alternativo: con credenciales inválidas, el sistema muestra un mensaje de error.', async function () {
    await driver.get('http://localhost:5173/todo-app/');

    await driver.findElement(By.name('logout')).click();
    await driver.findElement(By.name('tab-login')).click();
    await driver.findElement(By.id('login-email')).sendKeys('invalid@example.com');
    await driver.findElement(By.id('login-password')).sendKeys('invalidpassword');
    await driver.findElement(By.id('login-btn')).click();

    const errorMessage = await driver.wait(
      until.elementLocated(By.id('login-error-msg')), 5000
    );
    expect(await errorMessage.isDisplayed()).toBe(true);
  });

  it('Camino alternativo: con campos vacíos, el sistema muestra un mensaje de error.', async function () {
    await driver.get('http://localhost:5173/todo-app/');

    await driver.findElement(By.name('tab-login')).click();
    await driver.findElement(By.id('login-btn')).click();

    const errorMessage = await driver.wait(
      until.elementLocated(By.id('login-error-msg')), 5000
    );
    expect(await errorMessage.isDisplayed()).toBe(true);
  });

  afterAll(async function () {
    await driver.quit();
  });
});