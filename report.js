// Prepare folder structure
const fs = require('fs-extra');
const dir = './cucumber-report/html';

if (fs.existsSync(dir)) {
  fs.removeSync(dir);
}
fs.mkdirSync(dir);

// Report configuration
const reporter = require('cucumber-html-reporter');
const options = {
  theme: 'bootstrap',
  jsonDir: 'cucumber-report',
  output: 'cucumber-report/html/cucumber-report.html',
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: false,
  metadata: {
    'App Version': '1.0.0',
    'Test Environment': 'Production',
  },
};

// Generate report
reporter.generate(options);
