import { defineConfig } from 'cypress'
const { verifyDownloadTasks } = require('cy-verify-downloads');
const xlsx=require("xlsx")
const fs=require("fs")
export default defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'mochawesome',
    mochawesomeReporterOptions: {
      reportDir: 'cypress/reports/mocha',
      quite: true,
      overwrite: false,
      html: false,
      json: true,
    },
  },
  filterSpecs:true,
  viewportWidth: 1440,
  viewportHeight: 900,
  modifyObstructiveCode: false,
  experimentalSourceRewriting: false,
  numTestsKeptInMemory: 1,
  chromeWebSecurity: false,
  retries: 2,
  env: {
  
  },
  projectId: 'dw6fjn',
  e2e: {
    testIsolation: false,
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      on('task', verifyDownloadTasks); 
      on('task',{generateExceltoJson({fileName,sheetName})
      {
        const wb=xlsx.readFile(fileName,{cellDates: true})
        const ws=wb.Sheets[sheetName]
        const data=xlsx.utils.sheet_to_json(ws,{raw:true})
        return data
      }
    })
      return require('./cypress/plugins/index.js')(on, config)
    },
    specPattern: ['cypress/e2e/Cucumber/features/team_core/**/**/*.feature'],
    baseUrl: 'https://rahulshettyacademy.com',
    hosts : { '*.localhost' : '127.0.0.1'},
    excludeSpecPattern: [
      '**/PermissionsInScenario.js',
      '**/EntityMerge.js',
      '**/Merge.js',
      '**/PermissionsInArdoq.js',
      '**/CommandsTests.js',
      '**/Login.js',
      '**/HappyCases.js',
      '**/PermissionsInDashboard.js',
      '**/PermissionsInDashboard.feature',
      '**/SidebarEditor.js',
      '**/PermissionsInArdoqDiscover.js',
      '**/Dashboards.js',
      '**/Advance&GremlinReports.js',
      '**/impactEnums.js',
      '**/AdPicturesImport.js',
      '**/Pages',
      '**/step_definition',
      '**/features',
      '**/CreateScenarioPrivilege.js'
    ],
  },
})
