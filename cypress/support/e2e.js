import './commands';
import './integrationsHelper';
import './impactHelper';
import './permissionsHelper';
import './apiRequests';
import './insightHelper';
import './coreHelper';
require('cypress-grep')
require('cypress-xpath');
require('cy-verify-downloads').addCustomCommand();
//https://stackoverflow.com/questions/62980435/the-following-error-originated-from-your-application-code-not-from-cypress
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});

afterEach(() => {
  cy.window().then(win => {
    // window.gc is enabled with --js-flags=--expose-gc chrome flag
    if (typeof win.gc === 'function') {
      // run gc multiple times in an attempt to force a major GC between tests
      win.gc();
      win.gc();
      win.gc();
      win.gc();
      win.gc();
    }
  });
});
