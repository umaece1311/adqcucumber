import 'cypress-iframe';
import 'cypress-wait-until';
import 'cypress-file-upload';
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';

import {
  deleteAllAssetsAndFolders,
  loginUser,
  logoutUser,
  createFolder,
  createWorkspace,
} from './apiRequests';

import { createWorkspaceForBroadcast } from './engagementHelper';

addMatchImageSnapshotCommand();

Cypress.Commands.add('logout', logoutUser);
Cypress.Commands.add('createFolder', createFolder);
Cypress.Commands.add('createWorkspace', createWorkspace);
Cypress.Commands.add(
  'createWorkspaceForBroadcast',
  createWorkspaceForBroadcast
);

Cypress.Commands.add(
  'getUserCredentials',
  () => Cypress.env(Cypress.env('APP_ENV')).users
);

Cypress.Commands.add('login', userType => {
  cy.logout(); // just to make sure we don't end up logged in as someone else
  cy.wait(3000)
  cy.getUserCredentials().then(users => {
    loginUser({
      email: users[userType].email,
      password: users[userType].password,
    });
    cy.wait(5000)
  });
});

Cypress.Commands.add('resetAppState', () => {
  const currentFilePath = Cypress.spec.name
  const excludedFeatureFiles2 = 'cypress\e2e\Cucumber\team-impact-cucumber\Dashboards.feature';
  const excludedFeatureFiles3 = 'cypress\e2e\team-impact\Workspaces.js';
  const excludedFeatureFiles4 = 'cypress\e2e\smoke-test\SmokeTest.js';
  cy.login('admin'); // login as admin so we are sure we have the right permissions
  cy.visit('/?delay=2000&renderDelay=1500')
  const applnUrl = Cypress.config().baseUrl;
  if (
    applnUrl.includes('prodtest') ||
    applnUrl.includes('securityscann.uae')
  ) {
    if (!excludedFeatureFiles2.includes(currentFilePath) &&
    !excludedFeatureFiles3.includes(currentFilePath) &&
    !excludedFeatureFiles4.includes(currentFilePath)) {
      cy.log('$$ DELETE EVERYTHING $$')
      cy.log(currentFilePath)
      deleteAllAssetsAndFolders();
  }
  cy.log('$$$ DO NOT DO THE APP RESET $$$')
}
});


Cypress.Commands.add('loginWithDifferentUser', user => {
  //This method is used for login using different user. If the same user is already logged in, then it will take the user to the home page
  cy.wait(2000);
  //cy.failSafeToHomePage(); //Go to homepage

  let loggedInEmail = null;
  cy.request('api/user/current_user').then(response => {
    const result = JSON.parse(JSON.stringify(response.body));
    loggedInEmail = result.email;
  });
  if (user === 'Bob') {
    cy.getUserCredentials().then(users => {
      if (loggedInEmail !== users['writer'].email) {
        cy.login('writer');
        cy.visit('/?delay=5000&renderDelay=5000')
      }
    });
  }
  if (user === 'Alice') {
    cy.getUserCredentials().then(users => {
      if (loggedInEmail !== users['writer2'].email) {
        cy.login('writer2');
        cy.visit('/?delay=5000&renderDelay=5000')
      }
    });
  }
  if (user === 'Admin') {
    cy.getUserCredentials().then(users => {
      if (loggedInEmail !== users['admin'].email) {
        cy.login('admin');
        cy.visit('/?delay=5000&renderDelay=5000')
      }
    });
  }
  if (user === 'Charlie') {
    cy.getUserCredentials().then(users => {
      if (loggedInEmail !== users['reader'].email) {
        cy.login('reader');
        cy.visit('/?delay=5000&renderDelay=5000')
      }
    });
  }
});

Cypress.Commands.add('generateExceltoJson', (file, sheet) => {

  return cy.task('generateExceltoJson', { fileName: file, sheetName: sheet })

});

before(() => {
    //cy.resetAppState() 
});
