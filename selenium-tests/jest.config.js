const config = {
  testEnvironment: 'node',
  testTimeout: 60000,
  maxWorkers: 1,
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './reporte',
      filename: 'index.html',
      pageTitle: 'Pruebas Automatizadas - ChoresFlow',
      expand: true
    }]
  ]
}

module.exports = config
