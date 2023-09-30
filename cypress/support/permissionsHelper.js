// type definitions for custom commands like "createDefaultTodos"

// or via tsconfig.json -> compilerOptions -> lib
/// <reference lib="es2017.object" />
// check this file using TypeScript if available

import 'cypress-wait-until';

const dayjs = require('dayjs');
const todaysDate = dayjs().format('MMM DD, YYYY hh mm');

Cypress.Commands.add('openLocalWorkspace', name => {
  cy.get('#ardoqAppContainer').then(body => {
    if (body.find('#ardoqLogo').length > 0) {
      cy.get('#ardoqLogo').click(); //Go back to homepage
      cy.wait(1000);
    }
  });
  cy.get('.SelectAssetTypeBar__ClearChip-eeVOIZ', { timeout: 10000 }).click();
  cy.get('[data-click-id=last-modified]').dblclick();
  cy.get('[data-click-id="filter-workspaces-chip"]').click();
  cy.get('[data-click-id="type-to-filter"]')
    .click()
    .clear()
    .type(name)
    .then(() => {
      cy.get('[data-test-row-id=' + Cypress.env('testWorkspaceId') + ']', {
        timeout: 10000,
      })
        .first()
        .click();
    });
});

Cypress.Commands.add('fetchPolicy', workspaceId => {
  cy.request('api/policy/').then(response => {
    const fetchPolicy = JSON.parse(JSON.stringify(response.body));
    return fetchPolicy;
  });
});

Cypress.Commands.add('updateWorkspace', () => {
  cy.openWorkspaceOrScenario('Mainline','ImpactWorkspace')

  //Edit the name of a recently added component
  cy.get('.component-name', { timeout: 10000 })
    .should('be.visible')
    .last()
    .click(); //Select the component added last in a Scenario
  cy.wait(1000);
  cy.updateLastAddedComponent();
});

Cypress.Commands.add('readWorkspace', () => {
  cy.openWorkspaceOrScenario('Mainline','ImpactWorkspace')

  //Try to edit the name of a recently added component
  cy.wait(1000);
  cy.get('.component-name', { timeout: 10000 })
    .should('be.visible')
    .last()
    .rightclick(); //Select the component added last in a Scenario
  cy.wait(1000);
  cy.get('.dropdown-submenu').should('not.have.length.above', 2);
});

Cypress.Commands.add('deleteWorkspace', () => {
  cy.intercept(Cypress.config().baseUrl + '/api/workspace').as(
    'deleteWorkspace'
  );

  //Way around to enable Delete button
  cy.updateWorkspace();
  cy.get('#ardoqLogo').click();

  //Select the workspace and delete
  cy.get('[data-test-row-id=' + Cypress.env('testWorkspaceId') + ']', {
    timeout: 10000,
  }).rightclick();
  cy.get('[data-intercom-target=Delete]').click();
  cy.get('.sc-fznyYp').should('be.visible').click().type('yes'); //Enter yes
  cy.get('[data-click-id=confirm-delete]').click(); //Confirm delete
  cy.wait('@deleteWorkspace').its('response.statusCode').should('eq', 204);
});

Cypress.Commands.add('deleteWorkspaceApi', () => {
  cy.request({
    method: 'DELETE',
    url: 'api/workspace',
    failOnStatusCode: false,
    body: {
      workspaces: [Cypress.env('testWorkspaceId')],
    },
  }).then(resp => {
    //User with read access will have status as 403
    expect(resp.status).to.eq(403);
  });
});

Cypress.Commands.add('manageWorkspace', () => {
  cy.openWorkspaceOrScenario('Mainline','ImpactWorkspace')
  cy.wait(1000)
  cy.get('.ardoq-icon').then(body => {
    cy.get('#navbar').then(body => {
      if (body.find(':nth-child(4) > li > .FlatWhiteButton-fkEQs > .ardoq-icon').length > 0) {
        cy.get(':nth-child(4) > li > .btn-material > .ardoq-icon')
            .should('be.visible')
            .click();
      } else {
        cy.get(':nth-child(3) > li > .btn-material > .ardoq-icon')
            .should('be.visible')
            .click();
      }
    });
    cy.contains('Edit workspace properties').should('be.visible').click()
    cy.intercept(Cypress.config().baseUrl + '/api/workspace/*').as('work');
    cy.get('.srch')
        .first()
        .should('be.visible')
        .clear()
        .click()
        .type('AutomationPropertyManage_ ' + todaysDate); //Change the name of workspace
    cy.contains('Save').click(); //Click on Save button
    cy.wait('@work').its('response.statusCode').should('eq', 200); //checking whether api response has been received
  })
})

Cypress.Commands.add('unavailableManageWorkspace', () => {
  //Reader should not be able to see Manage Workspaces options
  cy.openWorkspaceOrScenario('Mainline','AutomationPropertyManage')
  cy.wait(1000);
  cy.get('#navbar').then(body => {
    if (body.find(':nth-child(4) > li > .btn-material > .ardoq-icon').length > 0) {
      cy.get(':nth-child(4) > li > .btn-material > .ardoq-icon')
          .should('be.visible')
          .click();
    } else {
      cy.get(':nth-child(3) > li > .btn-material > .ardoq-icon')
          .should('be.visible')
          .click();
    }
  });
  cy.contains('Edit workspace properties').should('not.exist')
})

Cypress.Commands.add('unavailableManageModels', () => {
  //Reader should not be able to see Manage Workspaces options
  cy.openWorkspaceOrScenario('Mainline','ImpactWorkspace')
  cy.wait(1000);
  cy.get('#navbar').then(body => {
    if (body.find(':nth-child(4) > li > .FlatWhiteButton-fkEQs > .ardoq-icon').length > 0) {
      cy.get(':nth-child(4) > li > .btn-material > .ardoq-icon')
          .should('be.visible')
          .click();
    } else {
      cy.get(':nth-child(3) > li > .btn-material > .ardoq-icon')
          .should('be.visible')
          .click();
    }
  });
  cy.contains('Manage component types and metamodel').should('not.exist')
})

Cypress.Commands.add('readableManagePermissions', () => {
  //Reader should not be able to see Manage Workspaces options
      cy.openWorkspaceOrScenario('Mainline','ImpactWorkspace')
  cy.get('.workspace-name').last().rightclick();
  cy.get('[data-click-id=permissions]').click();
  cy.get('.css-1dnvt03-singleValue').should('not.exist') //Editable field which should not exist if user does not have the permission
  cy.contains('Close', { timeout: 10000 }).click();
}
)

Cypress.Commands.add('editableManagePermissions', () => {
  cy.openWorkspaceOrScenario('Mainline','ImpactWorkspace')
      cy.get('.workspace-name').last().rightclick();
      cy.get('[data-click-id=permissions]').click();
      cy.get('[data-click-id=permission-access-level-select]').should('exist') //Editable field which should not exist if user does not have the permission
      cy.contains('Close', { timeout: 10000 }).click();
    }
)

Cypress.Commands.add('unavailableManagePermissions', () => {
  //Reader should not be able to see Manage Workspaces options
  cy.openWorkspaceOrScenario('Mainline','ImpactWorkspace')
  cy.get('.workspace-name').last().rightclick();
  cy.get('[data-click-id=permissions]').should('not.exist');
})

Cypress.Commands.add('manageModels', () => {
  //Reader should not be able to see Manage Workspaces options
  cy.openWorkspaceOrScenario('Mainline','ImpactWorkspace')
  cy.wait(1000);
  cy.createModelOrContent('component type','')
})

Cypress.Commands.add('manageDefaultPermission', () => {
  //Reader should not be able to see Manage Workspaces options
  cy.openWorkspaceOrScenario('Mainline','ImpactWorkspace')
  cy.wait(1000);
  cy.createModelOrContent('component type','')
})

Cypress.Commands.add('lockUnlockComponents', (user) => {
  //Reader should not be able to see Manage Workspaces options
  cy.openWorkspaceOrScenario('Mainline','ImpactWorkspace')
  cy.wait(1000);
  cy.get('.component-name', { timeout: 10000 })
      .should('be.visible')
      .last()
      .rightclick(); //Select the component added last in a Scenario
  cy.wait(1000);
  if(user=='Alice') {
    cy.get('[data-click-id=toggle-lock]').should('be.visible').click()
  }
  if(user=='Charlie'){
    cy.get('[data-click-id=toggle-lock]').should('not.exist')
  }
})

Cypress.Commands.add('createFolder', (user) => {
  //Reader should not be able to see Create Folder options
    if(user=='Alice') {
      cy.get('[data-click-id=open-create-dropdown]', { timeout: 15000 })
          .should('be.visible')
          .click();
      cy.get('[data-click-id=open-create-folder-modal]').should('be.visible').click()
      cy.get('.sc-qPlga > .sc-pIjat > .sc-pQdCa').click().type('New Folder Auto{enter}')
      }
  if(user=='Charlie'){
    cy.get('[data-click-id=open-create-dropdown]').should('not.exist')
  }
})


Cypress.Commands.add('editPrivilegeForRole', (privilege, role, editOption)=>{
  //Select the role
  cy.get('[tabindex="0"]:contains("'+role+'")', {timeout: 20000}).should('be.visible').click();
  //Assign privilege 
  //0= Privilege currently off. Turn on scenario privilege 
  if(editOption === 'remove'){
  let toggle=0;
  cy.get('[tabindex="'+toggle+'"]:contains("'+privilege+'")').click({force:true});
  cy.log('$$$$$ REMOVE BOOY $$$$$')
  }
  else if(editOption === 'assign'){
  //-1 == Privilege is enabled. Turn off scenario privilege
  toggle = -1;
  cy.get('[tabindex="'+toggle+'"]:contains("'+privilege+'")').click({force:true});
  cy.log('$$$ Turn on boooy $$$')
  }
  //Click save
  cy.get('[type="button"]:contains("Save")').click();
});

Cypress.Commands.add('editPrivilege', (privilege,user, selectedPrivilegeOption)=>{
  //Search for specific user
  cy.getUserCredentials().then(usersCredentials =>{
  cy.get('input[placeholder="Search table..."]',{timeout: 10000}).clear().type(usersCredentials[user].email);   
  });
  //Open Assign privilege modal 
  cy.get('[data-test-id="cell-with-dropdown"]').click();
  //Either "Assign" or "Remove" privilege
  cy.get('[data-intercom-target="'+selectedPrivilegeOption+ ' privileges "]').click();
  //Assign privilege
  cy.contains('Type and select privileges').click(); //Fix
  cy.get('[data-intercom-target="'+privilege+'"]').click();
  cy.get('[data-click-id="save-privileges-click-id"]').click();
  //Verify that the edit privileges modal is gone
  cy.wait(2000)
  cy.get('[role="modal"]', {timeout: 20000}).should('not.exist');
});

Cypress.Commands.add('waitForRolePrivilegeChange', ()=>{
  //Wait for change to happen on API level
  cy.intercept(Cypress.config().baseUrl+'api/role').as('changeRolePrivilege');
  cy.wait('@changeRolePrivilege', {timeout: 80000}).its('response.statusCode').should('eq', 200);
});

Cypress.Commands.add('waitForUserPrivilegeChange', ()=>{
  //Wait for user privilege change
  // cy.intercept('POST', Cypress.config().baseUrl+'api/user/bulk-operation/submit').as('changeUserPrivilege');
  // cy.wait('@changeUserPrivilege').its('response.statusCode').should('eq', 200);
});


//Copy testdata -> Workspace ID, URL for org, Your token, and Source Org 
Cypress.Commands.add('createTestDataCopy', (id, url, token, org) => {
  //Copy workspaces from different org ("Applications")
  cy.request({
    method: 'POST',
    url: 'https://'+url+'/api/workspace/copy',
    headers:{authorization: "Bearer"+" "+token,
             'X-org': org},
    body: {
      "target-org":"prodtest",
      "workspaces":[id]
    }
  }).then((response) => {
    expect(response.status).to.eq(201);
  })
});


Cypress.Commands.add('openManageWsPermissionsModal', () => {
      cy.get('.workspace-name').last().rightclick();
      cy.get('[data-test-id="permissions-item"]').click();
});

Cypress.Commands.add('changeOrgSettingsForWs', (permissionSelected)=>{
    cy.get('[data-click-id=permission-access-level-select]', {timeout: 20000}).click();
    cy.get('[data-intercom-target="'+permissionSelected+'"]').click();
    cy.get('[type="button"]:contains("Close")').click();
    cy.wait(1000);
});

Cypress.Commands.add('verifyNoDefaultAccessForWs', (wsName)=>{
    cy.get('[data-click-id="type-to-filter"]', {timeout: 20000}).type(wsName);
    cy.contains('No results found').should('be.visible');
    cy.contains('There is no item with name matching "'+wsName+'" ').should('be.visible')
});

Cypress.Commands.add('verifySomeSpecificTextIsDisplayed', (text)=>{
    cy.contains(text, {timeout: 20000}).should('be.visible');
})

Cypress.Commands.add('openManageScenarioPermissionsModal', () => {
  cy.get('.scenario-name').last().rightclick();
  cy.get('[data-test-id="scenario-permissions-item"]').click();
});

Cypress.Commands.add('getScenarioIdFromURl', ()=>{
  // Get the current URL
  // Use regular expressions or string manipulation to extract the ID from the URL
  return cy.url().then((url) => {
    const id = url.match(/\/scenario\/([^?]+)/)[1];
    Cypress.env('storeId', id); // Store the ID in a Cypress environment variable
  })
});

