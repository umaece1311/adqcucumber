// type definitions for custom commands like "createDefaultTodos"
/// <reference path="../support/index.d.ts" />
// or via tsconfig.json -> compilerOptions -> lib
/// <reference lib="es2017.object" />

const dayjs = require('dayjs');


Cypress.Commands.add('createWorkspaceManually', (templateCategory, templateName) =>{
  const todaysDate = dayjs().format('MMM DD, YYYY hh mm');
  cy.createBlankWorkspace()
  cy.selectTemplate(templateCategory,templateName);
});

Cypress.Commands.add('editWsUserCheck', (user, workspaceName, todaysDate) =>{
  //Set the dynamic interceptors to avoid overwriting of intercepts
  cy.intercept('PUT', '/api/workspace/*', req => {
    if (req.body.lastModifiedByEmail === 'qa+writer@ardoq.com') {
      req.alias = 'Alice';
    } else {
      req.alias = 'Admin';
    }
  });
  console.log(user);

  //Open Sidebar menu and workspace properties
  cy.openWorkspaceProperties();

  //Change workspace name
  cy.enterInWorkspaceName(workspaceName, todaysDate)

  //Dynamic interceptors to avoid overwriting of intercepts
  cy.wait('@' + user).then(interception => {
    const workspaceId = JSON.parse(
      JSON.stringify(interception.response.body)
    )._id;
    Cypress.env({ testWorkspaceId: workspaceId });
  });

});



Cypress.Commands.add('createComponent', (componentName) =>{
  cy.get('[data-click-id="sidebar-action-save-create"]', {timeout:5000}). should('be.disabled', {timeout:5000})
  cy.get('[data-click-id="editor-input-name"]')
  .should('be.visible')
  .clear()
  .type(componentName, {timeout:3000}); //Add component Name

//To verify whether the component has been added
cy.intercept(Cypress.config().baseUrl + '/api/component').as('component');
cy.intercept(Cypress.config().baseUrl + '/api/field/global/all').as(
  'global'
);
cy.get('[data-click-id="sidebar-action-save-create"]').as('btn').should('be.enabled', {timeout: 3000}).click();
cy.wait('@component').its('response.statusCode').should('eq', 201, {timeout: 5000}); //checking whether api response has been received
cy.wait('@global').its('response.statusCode').should('eq', 200);

})

Cypress.Commands.add('createReference', (numberOfSource, numberOfTarget, referenceName) =>{
  cy.get('i:contains("link")', {timeout: 3000}).eq(numberOfSource).click()
  cy.get('.component-name').eq(numberOfTarget).should('be.visible').click(); // Select the component which needs to be referenced
  cy.wait(3000);// you can not remove this
  cy.get('[data-click-id="editor-input-displayText"]', {timeout: 5000})
    .first()
    .click()
    .type(referenceName); //Add the name of reference
  cy.get('[data-click-id="sidebar-action-save-create"]').as('btn').should('be.enabled', {timeout: 3000}).click(); //Save the reference
})

Cypress.Commands.add('addFieldToTestWs', 
(targetComponents, 
  fieldName, 
  fieldType, 
  setDefaultValue, 
  storedValue
  ) => {
    //Get the ComponentModel from the test Workspace
    cy.request('GET', '/api/workspace/'+ Cypress.env('testWorkspaceId'))
    .then(({body}) => {
      return body;
    }).then(response => {
      const modelId = response.componentModel;
      //Get the names, IDs and versions for the test Workspace Components
      cy.request('GET', '/api/workspace/'+ Cypress.env('testWorkspaceId') + '/component')
        .then(response => {
          const workspaceComponentData = response.body;

          if (targetComponents != "all") {
            //Assign the new field and value to only the first Component found in the Workspace
            //Add a custom field to the Workspace and assign to the Component type of the first Component used in the test Workspace 
            cy.request('POST', '/api/field', {
              label: fieldName,
              model: modelId,
              _order: 10000,
              type: fieldType,
              global: false,
              componentType: [workspaceComponentData[0].typeId],
              referenceType: [],
              description: 'This Field is created via API',
              defaultValue: setDefaultValue
            }).then(response => {
              const fieldData = response.body;
              //Update the Component to use the field from above
              cy.request('PUT', '/api/component/'+ workspaceComponentData[0]._id, {
                rootWorkspace: Cypress.env('testWorkspaceId'),
                model: fieldData.model,
                name: workspaceComponentData[0].name,
                _id: workspaceComponentData[0]._id,
                [fieldData.name] : storedValue[0],
                _version: workspaceComponentData[0]._version
              });
            });
          }
        else {
          //Assign the same value to all Components found in the Workspace
            //Add a custom field to the Workspace and assign to the Component type of the first Component used in the test Workspace
            cy.request('POST', '/api/field', {
              label: fieldName,
              model: modelId,
              _order: 10000,
              type: fieldType,
              global: false,
              componentType: [workspaceComponentData[0].typeId],
              referenceType: [],
              description: 'This Field is created via API',
              defaultValue: setDefaultValue
            }).then(response => {
              const fieldData = response.body;
            workspaceComponentData.forEach((component, index) => {
              //Update the Component to use the field from above
              cy.request('PUT', '/api/component/'+ component._id, {
                rootWorkspace: Cypress.env('testWorkspaceId'),
                model: fieldData.model,
                name: component.name,
                _id: component._id,
                [fieldData.name] : storedValue[index],
                _version: component._version
              });
            });
          });
        }
      });
    });
});

  //Create scenario
Cypress.Commands.add('createScenario', (scenarioName) => {
  cy.intercept(Cypress.config().baseUrl + '/api/scenario/create').as(
    'createscenario'
  );
  cy.intercept(
    Cypress.config().baseUrl + '/api/scenario/*/aggregated/branch'
  ).as('scope');
  cy.get('[data-tooltip-text=Scenario]').first().should('be.visible').click(); // Click on Create Scenario
  cy.contains('Create scenario from view').click(); //Create a new scenario
  cy.wait(1500);
  cy.get('[data-click-id=add-scenario-name-here]', { timeout: 10000 })
    .click()
    .type(scenarioName);
  cy.get('[data-click-id=create-scenario-confirm-button]').click();
  cy.wait('@createscenario').then(interception => {
    const scenarioId = JSON.parse(JSON.stringify(interception.response.body))
      .scenario._id;
    console.log(scenarioId);
    Cypress.env({ testScenarioId: scenarioId });
  });
  cy.get('[data-click-id=open-scenario]').click();
  cy.wait('@scope').its('response.statusCode').should('eq', 200);
});

//addComponentScenario
Cypress.Commands.add('addComponent', (componentName, type) => {
  cy.enableBlockDiagram()
  cy.wait(1000);
  cy.get('[id="ardoqAppContainer"]', {timeout: 5000}).then(body => {
    if (body.find('[data-tooltip-text="Create a component"]').length <= 0) {
      cy.get('[data-tooltip-text="Sidebar Menu"]', {timeout: 10000}).click();
      cy.wait(1000)
      cy.get('[data-tooltip-text="Sidebar Menu"]', {timeout: 5000}).click();
      cy.wait(1000);
      if (body.find('[data-tooltip-text="Create a component"]', {timeout: 5000}).length <= 0){
        cy.visit('/')
        cy.openWorkspaceOrScenario('Scenario', 'ScenarioAutomated');
      }
    }
  });
  
  cy.get('[data-tooltip-text="Create a component"]', { timeout: 10000 })
    .should('be.visible')
    .click({force:true})
    .then(() => {
      cy.get('[data-click-id="editor-input-name"]')
        .should('be.visible')
        .type(componentName + '_' + 1); //Add component Name

      //To verify whether the component has been added
      cy.get('[data-click-id="sidebar-action-save-create"]').click();

      //Minimize Relative Components and Perspective
      if (type == 'Scenario') {
        cy.get('[data-click-id=related-components-toggle]').click();
      }

      cy.get('[data-click-id=perspectives-toggle]').click();

      //Add reference to a component
      cy.contains('link').last().click(); //Click on link to add the reference
      cy.get('.component-name').first().click(); // Select the component which needs to be referenced
      cy.wait(2000);
      cy.get('[data-click-id="editor-input-displayText"]', {timeout: 5000}).click().type('Reference 2'); //Add the name of reference
      cy.get('[data-click-id="sidebar-action-save-create"]').click();
    });
});

Cypress.Commands.add('enableBlockDiagram', () => {
  cy.wait(2000);
  //This will check whether Block Diagram is visible on the screen
  cy.get('[id="ardoqAppContainer"]', {timeout: 5000}).then(body => {
    if (body.find('[data-click-id="blockDiagram"]').length > 0) {
      cy.get('[data-click-id="blockDiagram"]')
        .first()
        .should('be.visible')
        .click();
    } else {
      //If the button is not visible
      cy.get('button:contains("More")')
        .click()
        .then(() => {
          cy.get('[data-click-id="blockDiagram"]')
            .first()
            .should('be.visible')
            .click();
        });
    }
  });
});

  //Workspace&Scenario Permission
Cypress.Commands.add(
  'providePermissionToUser',
  (userId, workspace, accessType, operation) => {
    if (workspace === 'Workspace') {
      cy.reload() //reload so that the relevant workspace appears
      cy.get('[data-click-id="app-main-sidebar-workspace-button"]',{timeout: 20000}).should("be.visible").click()
      cy.get('[data-click-id="clear-filters-chip"]').click({ force: true });
      cy.get('[data-click-id="type-to-filter"]')
        .click()
        .clear()
        .type('ImpactWorkspace_')
        .then(() => {
          cy.get('[data-test-row-id=' + Cypress.env('testWorkspaceId') + ']', {
            timeout: 10000,
          })
            .first()
            .click({force:true});
        });
      cy.get('.workspace-name').last().rightclick();
      cy.get('[data-intercom-target="Permissions"]').should('be.visible').click();
      cy.contains("Manage Workspace Permissions").dblclick()
      cy.wait(2000)
    } else {
      cy.reload() 
      cy.get('[data-click-id="app-main-sidebar-workspace-button"]', {timeout: 20000}).should("be.visible").click()
      cy.get('[data-click-id="clear-filters-chip"]').click({ force: true });
      cy.get('[data-click-id="type-to-filter"]')
        .click()
        .clear()
        .type('ImpactWorkspace')
        .then(() => {
          cy.get('[data-test-row-id=' + Cypress.env('testScenarioId') + ']', {
            timeout: 10000,
          })
            .first()
            .click();
        });
        // cy.contains('Close').click()
      cy.wait(2000)
      cy.get('.scenario-name', {timeout: 5000}).rightclick();
      cy.get('[data-intercom-target="Permissions"]').click();
      cy.contains("Manage Scenario Permissions").dblclick()
    }
    cy.get('[data-click-id=manage-single-permissions-select-users]').should('be.visible').click({force:true});
    cy.wait(1000)
    if (operation == 'edit') {
      if (accessType == 'Writing permissions') {
        //Click on Permission dropdown
        cy.get('[data-click-id=permission-access-level-select]').click({force:true}); //Fix
        cy.contains("Writing permissions").click({force:true});
      }
      if (accessType == 'Read-only permissions') {
        //Click on Permission dropdown
        cy.get('[data-click-id=permission-access-level-select]').click({force: true}); //Fix
        cy.wait(1000)
        cy.get('[data-intercom-target="Read-only permissions"]', {timeout: 5000}).click();
      }
      if (accessType == 'No default access') {
        //Click on Permission dropdown
        cy.get('[data-click-id=permission-access-level-select]').click({force:true}); //Fix
        cy.get('[data-intercom-target="No default access"]').click();
      }
      if (accessType == 'Administrator') {
        //Click on Permission dropdown
        cy.get('[data-click-id=permission-access-level-select]').click({force:true}); //Fix
        cy.contains('Administrator').click();
      }
    }
    if (operation == 'add') {
      //Enter the email id
      cy.get('.select-container', { timeout: 10000 })
        .contains('Type to filter user or group')
        .click({force:true})
        .type(userId + '{downarrow}{enter}', { delay: 100 }, {force: true});
      if (accessType == 'Writing permissions') {
        //Click on Permission dropdown
        cy.get('[data-click-id=permission-access-level-select]').click({force:true}); //Fix
        cy.contains('Writing permissions').click({force:true});
      }
      if (accessType == 'Administrator') {
        //Click on Permission dropdown
        cy.get('[data-click-id=permission-access-level-select]').click({force:true}).type('{downarrow}{enter}', { delay: 100 }, {force: true}); //Fix
      }
    }
    // cy.contains('Close', { timeout: 10000 }).click({force:true});
    cy.get('[type="button"]:contains("Close")', { timeout: 10000 }).click({force:true});

  }
);

Cypress.Commands.add('updateLastAddedComponent', () => {
  cy.wait(1000);
  //Edit the name of a recently added component
  cy.get('.component-name', { timeout: 10000 })
    .should('be.visible')
    .last()
    .rightclick(); //Select the component added last in a Scenario
  cy.wait(1000);
  cy.get('[data-intercom-target="Edit properties"]', {timeout: 5000}).click();
  cy.get('[data-click-id="editor-input-name"]').clear().type('Component-Edited ');
  cy.wait(2000)
  cy.get('[data-click-id="sidebar-action-save-create"]').click();
});

Cypress.Commands.add('createModelOrContent', (type, source) => {
  //Create a new component model
  const uuid = () => Cypress._.random(0, 1);
  const id = uuid();
  cy.intercept(Cypress.config().baseUrl + '/api/model/*').as('updatedModel');
  cy.intercept(Cypress.config().baseUrl + '/api/field').as('updatedField');
  cy.intercept(Cypress.config().baseUrl + '/api/attachment/workspace/*').as(
    'attachment'
  );
  cy.intercept(Cypress.config().baseUrl + '/api/tag').as('tag');
  cy.intercept(Cypress.config().baseUrl + '/api/scenario/*/tag').as(
    'scenarioTag'
  );
  cy.intercept(Cypress.config().baseUrl + '/api/component/*').as(
    'saveComponent'
  );
  cy.intercept(Cypress.config().baseUrl + '/api/scenario/*/component/*').as(
    'saveComponentInScenario'
  );
  if (type === 'component instance') {
    //Add Component to Scenario
    cy.get('[data-tooltip-text="Create a component"]', { timeout: 20000 })
      .should('be.visible')
      .click({force:true})
      .then(() => {
        cy.get('[data-click-id="editor-input-name"]')
          .should('be.visible')
          .type('NewComponent_ ' + 1); //Add component Name

        //To verify whether the component has been added
        cy.intercept(Cypress.config().baseUrl + 'api/scenario/*/component').as(
          'component'
        );
        cy.get('[data-click-id="sidebar-action-save-create"]').click();
        cy.wait('@component').its('response.statusCode').should('eq', 201);
      });
  }
  if (type == 'component type') {
    cy.get('.workspace-name').first().rightclick(); //Select the 3 dots
    cy.wait(1000);
    cy.get('[data-intercom-target="Edit metamodel"]', {timeout: 5000}).click();
    cy.get('[data-test-id="metamodel-editor-add-child-node"]>button').click();
    cy.get('[placeholder="Component type"]').last().click().type('New Component Model{enter}');
    cy.get('button:contains("Save")').click()
    cy.wait(3000);
    cy.wait('@updatedModel', {timeout: 20000}).its('response.statusCode').should('eq', 200);
    cy.get('[tabindex="-1"]').eq([1]).click({force:true});
    cy.get(':nth-child(4) > li > .btn-material', { timeout: 10000 }).click();
  }
  //Create a new reference instance
  if (type == 'reference instance') {                                                                //
    cy.wait(2000);
    //Add reference to a component
    cy.contains('link', {timeout: 5000}).last().click(); //Click on link to add the reference
    // cy.get('i:contains("link")').first().click()
    cy.get('.component-name').first().click(); // Select the component which needs to be referenced
    cy.wait(2000);
    cy.get('[data-click-id="editor-input-displayText"]', {timeout: 5000}).click().type('Reference 2'); //Add the name of reference
    //Select a different reference type
    cy.get('[data-click-id="editor-input-type"]').click();
    cy.wait(2000)
    cy.get('[data-intercom-target="Supports"]', {timeout: 5000}).click();
    cy.get('[data-click-id="sidebar-action-save-create"]').click();
  }
  //Create a new reference type
  if (type == 'reference type') {

    //Condition to check whether sidebar editor is open
    cy.sidebarFindAndClickButtonUnderWorkspace('manage-reference-types')

    //Click on Create
    cy.get('button:contains("Add reference type")').click()
    // cy.contains('Add reference type').click();
    cy.get('[data-click-id="editor-input-name"]', { timeout: 10000 })
      .clear()
      .type('New Reference Model{enter}');
    cy.get('[data-click-id="sidebar-action-save-create"]').should('be.enabled').click()
    cy.wait('@updatedModel').its('response.statusCode').should('eq', 200);
  }
  if (type == 'field type') {
    //Condition to check whether sidebar editor is open
    cy.sidebarFindAndClickButtonUnderWorkspace('manage-field-types')

    // cy.contains('Add field').click(); //Click on Add field
    cy.get('button:contains("Add field")').click()
    cy.get('[data-click-id="editor-input-add-field-to-workspace"]').click().type('New_Field_F2{downarrow}{enter}');
    // cy.get('.css-f3fgeq').click().type('New_Field_F2{downarrow}{enter}'); //Enter the name of the field
    cy.wait(1000);
    cy.get('[data-click-id="sidebar-action-save-create"]', {timeout: 5000}).click(); //Save the field
    cy.wait('@updatedField').its('response.statusCode').should('eq', 201);
  }
  if (type == 'field instance') {
    cy.createField('New_Created_Field_Instance');
  }
  if (type == 'tag instance') {
    cy.wait(1000);
    cy.get('.component-name', { timeout: 10000 })
      .should('be.visible')
      .first()
      .rightclick(); //Select the component added last
    cy.wait(1000);
    cy.get('[data-intercom-target="Edit properties"]', {timeout: 5000}).click();
    cy.get('[data-click-id="editor-input-parent"]').should('be.visible')
    cy.get('[data-click-id="editor-input-tags"]')
      .click({ force: true })
      .type('NewTag{enter}');
    cy.get('[data-click-id="sidebar-action-save-create"]').click();
    if (source == 'Scenario') {
      cy.wait('@saveComponentInScenario')
        .its('response.statusCode')
        .should('eq', 200);
      cy.wait('@scenarioTag').its('response.statusCode').should('eq', 201);
    }
    if (source == 'Mainline') {
      cy.wait('@saveComponent').its('response.statusCode').should('eq', 200);
      cy.wait('@tag').its('response.statusCode').should('eq', 201);
    }
  }
});

Cypress.Commands.add('updateModelOrContent', (type, source) => {
  cy.intercept(Cypress.config().baseUrl + '/api/model/*').as('updatedModel');
  cy.intercept(Cypress.config().baseUrl + '/api/field/*').as('updatedField');
  cy.intercept(Cypress.config().baseUrl + '/api/scenario/*/reference/*').as(
    'updatedReference'
  );
  cy.intercept(Cypress.config().baseUrl + 'api/tag/*').as('updatedTag');
  cy.intercept(Cypress.config().baseUrl + 'api/attachment/workspace/*').as(
    'attachment'
  );
  cy.intercept(Cypress.config().baseUrl + 'api/scenario/*/tag/*').as(
    'updatedTagInScenario'
  );

  if (type == 'component type') {
    cy.get('.workspace-name').first().rightclick(); //Select the 3 dots
    cy.wait(1000);
    cy.get('[data-intercom-target="Edit metamodel"]').click();
    cy.get('[value="Application"]').clear().type('Model-Edited');
    cy.get('button:contains("Save")').click()
    cy.wait('@updatedModel', {timeout: 20000}).its('response.statusCode').should('eq', 200);
    cy.wait(2000)
    cy.get('[tabindex="-1"]').eq([1]).click({force:true});
  }
  //Edit the name of a reference model
  if (type == 'reference type') {
    //Condition to check whether sidebar editor is open
    // @ts-ignore
    cy.sidebarFindAndClickButtonUnderWorkspace('manage-reference-types')
    //Click on Edit
    // cy.get('.property-card').eq(1).as('referenceProperties').within(() => {
    // cy.get('[type=button]').first().click()
    // })
    cy.get('[type="button"]').contains('Edit').click()
    cy.wait(2000)
    cy.get('[data-click-id="editor-input-name"]', { timeout: 10000 }).clear().type('Supports-Edited ');
    cy.get('[data-click-id="sidebar-action-save-create"]').click();
    cy.wait('@updatedModel').its('response.statusCode').should('eq', 200);
  }
  if (type == 'field type') {
    //Changing the field default value
    //Condition to check whether sidebar editor is open
    cy.sidebarFindAndClickButtonUnderWorkspace('manage-field-types')
    cy.wait(1000);
    //Click on Edit
    // cy.get('.property-card').eq(0).as('fieldProperties').within(() => {
    //   cy.get('[type=button]').first().click()
    // })
    cy.get('[type="button"]', {timeout: 5000}).contains('Edit').click()
    cy.get('[data-click-id="editor-input-defaultValue"]', { timeout: 10000 })
      .click()
      .type('Field-Default-Value');
    cy.get('[data-click-id="sidebar-action-save-create"]').click();
    cy.wait('@updatedField').its('response.statusCode').should('eq', 200);
  }
  if (type == 'component instance') {
    cy.updateLastAddedComponent();
  }
  if (type == 'reference instance') {
    cy.wait(2000);
    cy.wait('@attachment').its('response.statusCode').should('eq', 200, {timeout: 5000});
    //Edit the display text of the reference
    if (source == 'Scenario'){
      cy.get('.component-name', { timeout: 10000 }).first().click();
    }
    else{
    cy.get('.component-name', { timeout: 10000 }).last().click(); //Select the component added last in a Scenario
    }
    cy.wait(1000);
    cy.get('#ardoqAppContainer', {timeout: 5000}).then(body => {
      if (body.find('[data-tooltip-text="Sidebar Menu"]', {timeout: 10000}).length > 0) {
        cy.wait(1000)
        cy.get('[data-tooltip-text="Sidebar Menu"]', {timeout: 5000})
          .should('be.visible')
          .click();
      } else {
        cy.get('[data-tooltip-text="Sidebar Menu"]')
          .should('be.visible')
          .click();
      }
    });
    cy.wait(1000);
    cy.get('[data-tab-id="reference"]', {timeout: 5000}).click()
    // cy.get('a:Contains("AutoComponent2")').click();
    cy.get('[data-click-id^="select-reference"]').first().click()
    cy.wait(1000);
    cy.contains('Edit reference properties', {timeout: 5000}).click(); //Selector to select Edit reference
    cy.get('[data-click-id="editor-input-displayText"]').click().type('ReferenceEdited'); //Edit the Display Text
    cy.wait(2000)
    cy.get('[data-click-id="sidebar-action-save-create"]', {timeout: 5000}).click(); //Click on Save
    cy.wait('@updatedReference').its('response.statusCode').should('eq', 200);
  }
  if (type == 'tag instance') {
    cy.wait(1000);
    cy.get('.component-name', { timeout: 10000 })
      .should('be.visible')
      .first()
      .rightclick(); //Select the component added last
    cy.wait(1000);
    cy.get('[data-intercom-target="Edit properties"]', {timeout: 5000}).click();
    // cy.get('i').contains('close').eq(2).click()
    // cy.wait(2000)
    cy.get('[data-click-id="editor-input-parent"]').should('be.visible')
    cy.get('[data-click-id="editor-input-tags"]').scrollIntoView().clear()
    cy.get('[data-click-id="editor-input-tags"]').click({force:true}).type('NewTagEdited{enter}'); //Edited the name of Tag
    cy.get('[data-click-id="sidebar-action-save-create"]').click();
    if (source == 'Scenario') {
      cy.wait('@updatedTagInScenario')
        .its('response.statusCode')
        .should('eq', 200);
    }
    if (source == 'Mainline') {
      cy.wait('@updatedTag').its('response.statusCode').should('eq', 200);
    }
    cy.enableBlockDiagram()
  }
});

Cypress.Commands.add('deleteModelOrContent', (type, source) => {
  cy.intercept(Cypress.config().baseUrl + '/api/model/*').as('updatedModel');
  cy.intercept(Cypress.config().baseUrl + '/api/field/*').as('updatedField');
  cy.intercept(Cypress.config().baseUrl + '/api/component/*').as(
    'updatedComponent'
  );
  cy.intercept(Cypress.config().baseUrl + '/api/scenario/*/reference/*').as(
    'updatedReference'
  );
  cy.intercept(Cypress.config().baseUrl + 'api/attachment/workspace/*').as(
    'attachment'
  );
  cy.intercept(Cypress.config().baseUrl + '/api/scenario/*/tag/*').as(
    'deletedTagInScenario'
  );
  cy.intercept(Cypress.config().baseUrl + '/api/tag/*').as('deletedTag');

  //Delete recently added component model
  if (type == 'component type') {
    cy.get('.workspace-name').first().rightclick(); //Select the 3 dots
    cy.get('[data-intercom-target="Edit metamodel"]').click();
    //cy.get('button:contains("close")').eq(1).click(); 
    cy.get('[data-testid="delete-model-type"]').click();
    cy.get('button:contains("Save")').click();
    cy.wait(2000)
    //cy.get('.delete-component-type').last().click();
    cy.wait('@updatedModel', {timeout: 20000}).its('response.statusCode').should('eq', 200);
    cy.get('[tabindex="-1"]').eq([1]).click();
  }

  //Delete reference model
  if (type == 'reference type') {
    cy.sidebarFindAndClickButtonUnderWorkspace('manage-reference-types')
       //Click on Delete
    // cy.get('.property-card').eq(2).as('referenceProperties').within(() => {
    //   cy.get('[type=button]').last().click()
    // })
    cy.get('[type="button"]').contains('Delete').click()
    cy.wait('@updatedModel').its('response.statusCode').should('eq', 200);
  }
  //Delete field model
  if (type == 'field type') {
    //Delete the field
    cy.sidebarFindAndClickButtonUnderWorkspace('manage-field-types')
    // cy.get('.property-card').eq(0).as('fieldProperties').within(() => {
    //   cy.get('[type=button]').last().click()
    // }) //Click on Delete
    cy.get('[type="button"]').contains('Delete').click()
    cy.get('[data-click-id="confirm-delete-field"]').click(); //Confirm delete
    cy.wait('@updatedField').its('response.statusCode').should('eq', 204);
  }
  //Delete recently added component
  if (type == 'component instance') {
    cy.wait(1000);
    cy.wait('@attachment').its('response.statusCode').should('eq', 200, {timeout: 5000});
    cy.get('.component-name', { timeout: 10000 })
      .should('be.visible')
      .last()
      .rightclick(); //Select the component added last
    cy.get('[data-test-id="delete-component-item"]').click();
    cy.get('[data-click-id="confirm-delete-components-references"]').last().click();
  }
  if (type == 'reference instance') {
    cy.wait(1000);
    cy.wait('@attachment').its('response.statusCode').should('eq', 200, {timeout: 5000});
    //Edit the display text of the reference
    if (source == 'Scenario'){
      cy.get('.component-name', { timeout: 10000 }).first().click();
    }
    else{
    cy.get('.component-name', { timeout: 10000 }).last().click(); //Select the component added last in a Scenario
    }
    cy.wait(1000);
    cy.get('[data-tooltip-text="Sidebar Menu"]', {timeout: 5000}).click(); //Open Sidebar Menu
    cy.wait(1000);
    cy.get('[data-tab-id="reference"]', {timeout: 5000}).click()
    cy.get('[data-click-id^="select-reference"]').first().click()
    cy.wait(1000);
    cy.get('[data-click-id="delete-reference-menu-item"]', {timeout: 5000}).click()
    // cy.contains('Delete reference').click(); //Selector to Delete reference
    cy.get('[data-click-id="confirm-delete-components-references"]').click();
    //   cy.wait('@updatedReference').its('response.statusCode').should('eq', 204);
  }
  if (type == 'tag instance') {
    cy.wait(1000);
    cy.get('.component-name', { timeout: 10000 })
      .should('be.visible')
      .first()
      .rightclick(); //Select the component added last
    cy.wait(1000);
    cy.get('[data-intercom-target="Edit properties"]').click();
    // cy.get('tabindex="-1" > i').contains('close').click()
    // cy.wait(2000)
    cy.get('[data-click-id="editor-input-parent"]').should('be.visible')
    cy.get('[data-click-id="editor-input-tags"]').scrollIntoView().clear()
    cy.get('[data-click-id="sidebar-action-save-create"]').click();
    if (source == 'Scenario') {
      cy.wait('@deletedTagInScenario')
        .its('response.statusCode')
        .should('eq', 200);
    }
    if (source == 'Mainline') {
      cy.wait('@deletedTag').its('response.statusCode').should('eq', 200);
    }
    cy.enableBlockDiagram()
  }
});

Cypress.Commands.add('createField', name => {
  cy.wait(1000);
  //Click on sidebar menu
  cy.get('#ardoqAppContainer', {timeout: 5000}).then(body => {
        if (body.find('[data-click-id="manage-field-types-menu-item"]').length > 0) {
      cy.wait(1000)
          
    } else {
      cy.get('[data-tooltip-text="Sidebar Menu"]', {timeout: 20000})
          .should('be.visible')
          .click();
    }
  })
  cy.wait(2000);
  cy.get('[data-click-id="manage-field-types-menu-item"]', { timeout: 10000 }).scrollIntoView().click();
  // cy.contains('Manage field types', { timeout: 10000 }).should('be.visible').click();
  cy.get('button:contains("Add field")').click();
  // cy.contains('Add field').click(); //Click on Add field
  // cy.get('.css-f3fgeq')
  cy.get('[data-click-id="editor-input-add-field-to-workspace"]')
    .click()
    .type(name + '{downarrow}{enter}'); //Enter the name of the field
  cy.get('[data-click-id="sidebar-action-save-create"]').click(); //Save the field
  cy.get('[data-tooltip-text="Sidebar Menu"]').click(); //Close the Manage Fields window
  cy.wait(2000);
  cy.get('[data-tooltip-text="Sidebar Menu"]', {
    timeout: 10000,
  }).click();
});

Cypress.Commands.add('assertCountOfOperation', operation => {
  if (operation === 'deleted') {
  }
  if (operation === 'created') {
  }
  if (operation === 'updated') {
    //cy.get('.kpwBNl').contains('update (1)');
  } else {
  }
});

Cypress.Commands.add('createScenarioUsingApi', (workspaceName, scenarioName) => {
  cy.get('[data-click-id="app-main-sidebar-workspace-button"]', {timeout: 20000}).should("be.visible").click()
  cy.get('[data-click-id="clear-filters-chip"]').click({ force: true });
  cy.get('[data-click-id=last-modified]').dblclick();
  cy.get('[data-click-id="filter-workspaces-chip"]').click();
  cy.get('[data-click-id="type-to-filter"]')
    .click()
    .clear()
    .type(workspaceName)
    .then(() => {
      cy.get('[data-test-row-id=' + Cypress.env('testWorkspaceId') + ']', {
        timeout: 10000,
      })
        .first()
        .click();
    });
  //Fetch the component Ids and Reference Id for a workspace
  cy.request(
    'api/workspace/' + Cypress.env('testWorkspaceId') + '/aggregated'
  ).then(response => {
    const aggregateResult = JSON.parse(JSON.stringify(response.body));
    cy.request('POST', 'api/scenario/create', {
      name: scenarioName,
      componentIds: [
        aggregateResult.components[0]._id,
        aggregateResult.components[1]._id,
        aggregateResult.components[2]._id,
      ],
      referenceIds: [aggregateResult.references[0]._id],
    }).then(response => {
      const scenarioId = JSON.parse(JSON.stringify(response.body)).scenario._id;
      Cypress.env({ testScenarioId: scenarioId });
    });
  });
});

Cypress.Commands.add('updateModelOfComponents', () => {
  // //Change the model of component
  // //First component
  cy.get('.component-name').should('be.visible').first().rightclick();
  cy.get('[data-intercom-target="Edit properties"]').click();
  cy.wait(2000);
  cy.get('[data-click-id="editor-input-a_new_field"]').click();
  cy.get('#react-select-type-field-option-1').last().click();
  cy.get('.eKSzBw').click();
  cy.wait('@updatedComponent').its('response.statusCode').should('eq', 200);
});

Cypress.Commands.add('openWorkspaceOrScenario', (source, name) => {
  if (source == 'Mainline') {
    cy.get('[data-click-id="app-main-sidebar-workspace-button"]',{timeout: 20000}).should("be.visible").click()
    cy.get('[data-click-id=last-modified]').dblclick({ force: true });
    cy.get('[data-click-id="filter-workspaces-chip"]').click({ force: true });
    cy.get('[data-click-id="type-to-filter"]')
      .click()
      .clear()
      .type(name)
      .then(() => {
        cy.get('[data-test-row-id=' + Cypress.env('testWorkspaceId') + ']', {
          timeout: 10000,
        })
          .first()
            .click({ force: true });
      });
  }
  if (source == 'Scenario') {
    //Go back to Home Screen
    cy.get('[data-click-id="app-main-sidebar-workspace-button"]', {timeout: 20000}).should("be.visible").click()
    cy.get('[data-click-id="clear-filters-chip"]').click({ force: true });
    cy.get('[data-click-id="type-to-filter"]')
      .click()
      .clear()
      .type(name)
      .then(() => {
        cy.get('[data-test-row-id=' + Cypress.env('testScenarioId') + ']', {
          timeout: 10000,
        })
          .first()
          .click({force:true});
      });
  }
});

Cypress.Commands.add('convertRigidToFlexible', () => {
  cy.intercept(Cypress.config().baseUrl + '/api/model/*').as('changedModel');
  cy.get('.workspace-name').first().rightclick(); //Select the 3 dots
  cy.wait(1000);
  cy.get('[data-intercom-target="Edit metamodel"]', {timeout: 5000}).click(); //Go to Model page
  cy.get('button:contains("Transform to Flexible")').should('be.visible').click(); //Convert the model to Flexible
  cy.get('[data-test-id*="confirm-convert-to-flexible"]').click();
  cy.get('button:contains("Save")').click()
  cy.wait('@changedModel').its('response.statusCode').should('eq', 200);
  cy.wait(2000);
  cy.get('[tabindex="-1"]', {timeout: 5000}).eq([1]).click({force:true}); //Close the Model page
});

Cypress.Commands.add(
  'componentVisibilityEnabler',
  (componentOption1, componentOption2) => {
    cy.get('#ardoqAppContainer').then(body => {
      if (body.find('' + componentOption1).length) {
        cy.get(componentOption1).should('be.visible').click();
      } else {
        cy.get('' + componentOption2)
          .should('be.visible')
          .click();
        cy.get(componentOption1).should('be.visible').click();
      }
    });
  }
);

Cypress.Commands.add('failSafeToHomePage', () => {
  cy.get('#ardoqAppContainer').then(body => {
    if (body.find('Document Archive').length>0){
      cy.visit('/');
      cy.wait(2000);
    }
    else if (body.find('#ardoqLogo').length > 0) {
      cy.get('#ardoqLogo').click(); //Go back to homepage
      cy.wait(1000);
    }
    else {
      cy.visit('/');
      cy.wait(2000);
    }
  });
});

Cypress.Commands.add('addComponentInScenario', () => {
  cy.request(
      'api/scenario/' + Cypress.env('testScenarioId') + '/aggregated/branch'
  ).then(response => {
    const aggregateResult = JSON.parse(JSON.stringify(response.body));
    cy.request('POST', '/api/scenario/' + Cypress.env('testScenarioId') + '/component', {
          name: "ScenarioComponent",
          model: aggregateResult.models._id,
          description: '',
          parent: null,
          typeId: aggregateResult.components[0].typeId,
          rootWorkspace: aggregateResult.components[0].rootWorkspace,
          type: 'Application',
          _order: 1,
        })
  })
})

Cypress.Commands.add('sidebarFindAndClickButtonUnderWorkspace', (buttonName) => {
//Condition to check whether sidebar editor is open
  cy.contains('button', buttonName)
      .should((_) => {})
      .then(($button) => {
        if (!$button.length) {
          // there is no button
          cy.wait(1000)
          cy.get('[data-tooltip-text="Sidebar Menu"]', {timeout:2000}).click();
          cy.get('[data-click-id^="' +buttonName+ '"]').scrollIntoView().should('be.visible').click()
          return
        } else {
          cy.window().then((win) => {
            cy.spy(win.console, 'log').as('log')
          })
          cy.get('[data-click-id^=' +buttonName+ ']').should('be.visible').click()
                 }
      })
})

Cypress.Commands.add('createReport', (reportType, reportName, workspaceName) =>{
  const todaysDate = dayjs().format('MMM DD, YYYY hh mm');
    cy.intercept(Cypress.config().baseUrl + '/api/report/create-query-and-report').as('createQuery');

    cy.get('[data-click-id="app-main-sidebar-workspace-button"]', {timeout:50000}).should("be.visible").click({force:true}) //Go back to homepage
    cy.get('[data-click-id=open-create-dropdown]').should('be.visible').click({force:true});
    cy.get('[data-click-id="open-new-report"]').should('be.visible').click()
    //Step 1- Enter the name
    cy.get('[name=name]')
        .click().type(reportName)
    //Data Selection
    cy.get('[data-click-id="report-builder-workspace-selector"]').click()
    cy.get('[data-intercom-target="'+workspaceName+'"]').last().click({force:true})

    if (reportType == 'Advanced Search for all components'){
      cy.get('[data-click-id="report-builder-advanced-query-builder-select-field"]').click({force:true}).type("Name{enter}")
      cy.get('[data-click-id="report-builder-advanced-query-builder-select-operator"]').click({force:true}).type("not equal to{enter}")
      cy.get('[data-test-id="autocomplete-async-input"]').click({force:true}).type("test{enter}")
    }
    if (reportType == 'Gremlin Search for all references'){
      cy.get('[data-click-id="report-builder-datasource-graphSearch"]').click()
      cy.get('[id="ace-editor"]').click().type('g.E()')
    }

    cy.get('[data-click-id="report-builder-search"]').should("be.visible").click({force:true})

    //Choose column for each report and aggregate
     //Sort by Type and Median as Aggregate
    if (reportType == 'Advanced Search for all components'){
      cy.get('[data-click-id="add-all-report-columns-button"]', {timeout:5000}).click()
      cy.get('[data-test-id="report-builder-select-default-column"]', {timeout:5000}).find('input').first().click({force:true}).type('Name')
      cy.get('[data-intercom-target="Name"]').click()
      cy.get('[data-test-id="report-builder-select-default-aggregate"]').find('input').first().click({force:true}).type('Count')
      cy.get('[data-intercom-target="Count"]').click()
        }
    //Sorting by currency number and Average for only set values as aggregate
    if (reportType == 'Gremlin Search for all references'){
      cy.wait(2000)
      cy.get('[data-click-id="add-all-report-columns-button"]', {timeout:5000}).should('have.text', 'addAdd all')
      cy.get('[data-click-id="add-all-report-columns-button"]').click()
      cy.wait(2000)
      cy.get('[data-click-id="add-all-report-columns-button"]').should('be.disabled', {timeout:5000})
      cy.get('[data-test-id="report-builder-select-default-column"]', {timeout:5000}).find('input').first().click({force:true}).type('Number field')
      cy.get('[data-intercom-target="Number field"]').click()
    }

    //Save the report
    cy.get('[data-click-id="report-builder-save-button"]', {timeout:5000}).should("be.visible").click()
    cy.wait('@createQuery').its('response.statusCode').should('eq', 201);

})

Cypress.Commands.add('createWidgetCustomField', (CustomField, reportName, CustomChart) =>{
  cy.get('[data-test-id="add-new-chart-button"]').click({force:true})
  cy.get('[data-test-id="dashboard-data-source-select"]', {timeout:5000}).should('be.visible').find('input').click().type(reportName, {force:true})
  cy.get('[data-intercom-target*="'+reportName+'"', {timeout:5000}).last().click()
  cy.get('[data-test-id="dashboard-field-select"]', {timeout:5000}).click()
  cy.get('[data-intercom-target^="'+CustomField+'"]', {timeout:5000}).contains(CustomField).click()
  cy.get('[data-test-id="dashboard-chart-title-input"]').find('input').click({force:true}).type(CustomField + "widget")
  cy.get('[data-test-id="dashboard-chart-type-select"]').click()
  cy.get('[data-intercom-target^="'+CustomChart+'"]', {timeout:5000}).click()
})

Cypress.Commands.add('addTitleAndDescriptionDashboard', (dashboardName, customDescription) => {
  cy.get('[data-tooltip-text="Edit title and description"]').click({force:true})
  cy.get('[data-test-id="dashboard-name-input"]').click().type(dashboardName)
  cy.get('[class="te-editor-section"]').click().type(customDescription)
})

Cypress. Commands.add('addHeaderDashboard', (customHeader) =>{
  cy.get('[data-test-id="add-new-header-button"]').click()
  cy.get('[data-test-id="dashboard-header-name-input"]').find('input').click().type(customHeader)
})

Cypress.Commands.add('addAggregate', (customAggregate) => {
  cy.get('[data-test-id="dashboard-aggregate-select"]').click()
  cy.get('[data-intercom-target="'+customAggregate+'"]').click()
  cy.get('[data-test-id="dashboard-result-label-input"]').click().type(customAggregate)

})

Cypress.Commands.add('addConditionalFormatin', (customName, customValue, numberOfColor) =>{
  cy.get('[data-test-id="dashboard-add-new-limit-button"]').click()
  cy.get('[data-test-id="dashboard-cond-format-color-button"]').first().click()
  cy.get('[data-testid="color-swatch"]').eq(numberOfColor).click() // Needs to customize
  cy.get('[data-test-id="dashboard-cond-format-name-input"]').find('input').first().click().clear().type(customName)
  cy.get('[data-testid="conditional-formatting-value-input"]').first().click().clear().type(customValue)
})

Cypress.Commands.add('addDataColors', (numberOfColor, numberOfBar) =>{
  cy.get('[data-test-id="dashboard-data-color-button"]').eq(numberOfBar).click()
  cy.get('[data-testid="color-swatch"]').eq(numberOfColor). click()
})

Cypress.Commands.add('createDashboard', (customWidget) => {
  const todaysDate = dayjs().format('MMM DD, YYYY hh mm');
  cy.get('[data-click-id="app-main-sidebar-workspace-button"]', {timeout:50000}).should("be.visible").click({force:true})
  cy.get('[data-click-id=open-create-dropdown]').should('be.visible').click({force:true});
  cy.get('[data-click-id="open-new-dashboard"]').should('be.visible').click()

  if (customWidget == "component report"){
    cy.addTitleAndDescriptionDashboard('Dashboard for Components for different chart type', 'Testing data for the dashboard when the Advance search is used as a source.')
    cy.addHeaderDashboard('Table widget')
    cy.createWidgetCustomField('Name', 'Advance search for all component', 'Table')
    cy.createWidgetCustomField('Checkbox field', 'Advance search for all component', 'Table')
    cy.addHeaderDashboard('Number widget')
    cy.createWidgetCustomField('Number field', 'Advance search for all component', 'Number chart')
    cy.addAggregate('Median')
    cy.addConditionalFormatin('Maximum', 2, 1)
    cy.createWidgetCustomField('Text', 'Advance search for all component', 'Number chart')
    cy.addConditionalFormatin('Minimum', 1, 2)
    cy.addHeaderDashboard('Pie widget')
    cy.createWidgetCustomField('List field', 'Advance search for all component', 'Pie chart')
    cy.createWidgetCustomField('Checkbox field', 'Advance search for all component', 'Pie chart')
    cy.contains('Data colors').click()
    cy.addDataColors(7, 1)
    cy.addDataColors(3, 0)
    cy.addHeaderDashboard('Line widget')
    cy.createWidgetCustomField('Number field', 'Advance search for all component', 'Line chart')
    cy.get('[data-test-id="dashboard-aggregate-select"]').click()
    cy.get('[data-intercom-target="Sum"]').click()
    cy.addHeaderDashboard('Stacked bar widget')
    cy.createWidgetCustomField('Type', 'Advance search for all component', 'Stacked bar chart')
    cy.contains('Data colors').click()
    cy.addDataColors(3, 0)
    cy.addHeaderDashboard('Bar widget')
    cy.createWidgetCustomField('Parent', 'Advance search for all component', 'Bar chart')
  }

  if (customWidget == "reference report"){
    cy.addTitleAndDescriptionDashboard('Dashboard for References for different chart type', 'Testing data for the dashboard when the Gremlin search is used as a source.')
    cy.addHeaderDashboard('Table widget')
    cy.createWidgetCustomField('Source Component', 'Gremlin search for all references', 'Table')
    cy.createWidgetCustomField('Checkbox field', 'Gremlin search for all references', 'Table')
    cy.addHeaderDashboard('Number widget')
    cy.createWidgetCustomField('Number field', 'Gremlin search for all references', 'Number chart')
    cy.addAggregate('Median')
    cy.addConditionalFormatin('Maximum', -1, 0)
    cy.createWidgetCustomField('Text', 'Gremlin search for all references', 'Number chart')
    cy.addConditionalFormatin('Minimum', -2, 1)
    cy.addHeaderDashboard('Pie widget')
    cy.createWidgetCustomField('List field', 'Gremlin search for all references', 'Pie chart')
    cy.createWidgetCustomField('Target Component', 'Gremlin search for all references', 'Pie chart')
    cy.contains('Data colors').click()
    cy.addDataColors(8, 1)
    cy.addDataColors(9, 0)
    cy.addHeaderDashboard('Line widget')
    cy.createWidgetCustomField('Ardoq OID', 'Gremlin search for all references', 'Line chart')
    cy.addHeaderDashboard('Stacked bar widget')
    cy.createWidgetCustomField('Type', 'Gremlin search for all references', 'Stacked bar chart')
    cy.contains('Data colors').click()
    cy.addDataColors(3, 0)
    cy.addHeaderDashboard('Bar widget')
    cy.createWidgetCustomField('Target Component', 'Gremlin search for all references', 'Bar chart')
  }

  if (customWidget == "one widget survey"){
    cy.addTitleAndDescriptionDashboard('Dashboard for Survey for different chart type', 'Testing data for the dashboard when the survey is used as a source.')
    cy.addHeaderDashboard('Pie chart widget')
    cy.createWidgetCustomField('Show valid/invalid', 'Basic Survey Test', 'Pie chart')
    cy.addHeaderDashboard('Stacked bar chart widget')
    cy.createWidgetCustomField('List field', 'Basic Survey Test', 'Stacked bar chart')
    cy.addHeaderDashboard('Line chart widget')
    cy.createWidgetCustomField('Checkbox field', 'Basic Survey Test', 'Stacked bar chart')
    cy.addHeaderDashboard('Bar chart widget')
    cy.createWidgetCustomField('Number field', 'Basic Survey Test', 'Bar chart')
  }
    cy.get('button:contains("Save")').first().click()
    cy.wait(2000)
    cy.get('button:contains("Dashboard overview")', {timeout:5000}).first().click()
    cy.url().should('eq', 'https://prodtest.ardoq.com/app/dashboard/')
})


Cypress.Commands.add('chooseMenuOption', (menuOptions, assetName, asset) => {
  cy.intercept(Cypress.config().baseUrl + '/api/dashboard/v3/).as(‘saveDashboard');
  if(menuOptions == 'copy the widget'){
    cy.get('[data-test-id="go-to-dashboard-overview-button"]', {timeout:50000}).should('be.visible').click()
  }
  if(menuOptions == 'delete the dashboard'){
    cy.get('[data-click-id="app-main-sidebar-analytics-button"]', {timeout:50000}).should('be.visible').click()
    cy.contains('Dashboards Overview').should('be.visible').click()
  }
  cy.get('[data-click-id="app-main-sidebar-workspace-button"]', {timeout:90000}).click()
  cy.get('[data-click-id="type-to-filter"]', {timeout:90000}).should('be.visible').clear().type(assetName)
  cy.get('[data-click-id="asset-manager-name-click"]', {timeout:5000}).last().should('contain.text',assetName).rightclick()
  //Edit option
  if(menuOptions == 'edit the dashboard'){
    cy.get('[data-intercom-target="Edit"]').click()
    cy.get('[data-tooltip-text="Edit chart"]').as('btn').last().click({force:true})
    cy.get('[data-test-id="dashboard-chart-title-input"]', {timeout:5000}).find('input').type('{selectall}{backspace}').type('Updated Name for this widget') //Edit widget title
    cy.get('[data-test-id="dashboard-chart-type-select"]', {timeout:5000}).click()
    cy.get('[data-intercom-target="Line chart"]', {timeout:5000}).click()
    cy.get('[data-tooltip-text="Edit title and description"]').click({force:true})
    cy.get('[data-test-id="dashboard-name-input"]').find('input').type('updated')
    cy.get('[data-test-id="save-dashboard-button"]').click({force:true})
    cy.get('[data-test-id="go-to-dashboard-overview-button"]', {timeout:5000}).as('btn').click({force:true})
  }
//Delete the widget
 if(menuOptions == 'delete the widget'){
    cy.get('[data-intercom-target="Edit"]').click()
    cy.get('[data-click-id="widget-options-button"]').eq(3).click({force:true})
    cy.wait(2000)
    cy.get('[data-intercom-target="Delete"]', {timeout:5000}).click({force:true})
    cy.wait(2000)
    cy.get('[data-test-id="save-dashboard-button"]', {timeout:5000}).click({force:true})
    cy.wait(2000)
    cy.get('[data-test-id="go-to-dashboard-overview-button"]', {timeout:5000}).click({force:true})
  }
 // Copy the widget
  if(menuOptions == 'copy the widget'){
    cy.get('[data-intercom-target="Edit"]').click()
    cy.get('[data-tooltip-text="More options"]').eq(2).click({force:true})
    cy.get('[data-intercom-target="Copy"]', {timeout:5000}).click({force:true})
    cy.get('[data-test-id="save-dashboard-button"]', {timeout:5000}).click({force:true})
    cy.wait(3000)
    cy.get('[data-test-id="go-to-dashboard-overview-button"]', {timeout:5000}).as('btn').click({force:true})
  }
  //Add to presentation the dashboard and report
  if(menuOptions == 'add to presentation'){
    cy.get('[data-intercom-target="Add to presentation"]', {timeout:5000}).click()
    cy.contains('Add Slide to presentation').should('be.visible')
    cy.get('[data-click-id="confirm button"]').should('be.disabled')
    cy.get('.select-container').last().find('input').click().type('NewPresentatio', {force:true})
    cy.get('[data-intercom-target^="NewPresentatio"]', {timeout:5000}).last().click()
    cy.get('[data-click-id="confirm button"]').should('be.enabled').click()
  }
  //Rename and delete the dashboard
  if(menuOptions == 'delete the dashboard'){
    cy.get('[data-intercom-target="Delete"]').click()
    cy.contains('Delete dashboard').should('be.visible')
    cy.get('[data-click-id="confirm-delete"]').should('be.disabled')
    cy.get('input').last().type('yeap')
    cy.get('[data-click-id="confirm-delete"]').should('be.disabled')
    cy.get('input').last().clear().type('yes')
    cy.get('[data-click-id="confirm-delete"]').should('be.enabled').click()
  }
  //Copy the dashboard
  if(menuOptions == 'copy the dashboard'){
    cy.get('[data-intercom-target="Copy"]').click({force:true})
    cy.contains('Create copy').click()
  }
  //Edit the report
  if(menuOptions == 'edit report'){
    cy.get('[data-intercom-target="Edit"]', {timeout:2000}).click()
    cy.get('[data-click-id="report-builder-save-button"]').should('be.disabled')
    if (assetName == 'Advance search for all component (copy)'){
    cy.get('[data-click-id="report-builder-datasource-advancedSearchPostgres"]', {timeout:2000}).scrollIntoView().should('be.visible').click()
    cy.get('[data-test-id="select-operator"]').should('be.visible').click()
    cy.get('[data-intercom-target="does not contain substring"]').click()
    cy.get('[data-click-id="report-builder-search"]').click()
    }
    else if (assetName == 'Gremlin search for all references (copy)'){
      cy.get('[data-placeholder="What is this report about?"]').should('be.visible').click().type('Test')
      cy.get('[data-test-id="report-builder-select-default-aggregate"]').click()
      cy.get('[data-intercom-target="Count"]').should('be.visible').click() 
    }

    cy.get('[data-click-id="report-builder-save-button"]').should('be.enabled').click()
    cy.get('[data-click-id="report-builder-view-button"]').should('be.enabled', {timeout:50000})
    cy.get('[data-click-id="report-builder-back-button"]').should('be.visible').click()
  }
  //Copy the report
  if(menuOptions == 'copy report'){
    cy.get('[data-intercom-target="Copy"]', {timeout:2000}).click()
    cy.get('[data-click-id="confirm-create-copy"]', {timeout:20000}).should('be.enabled').click()
    cy.get('[data-click-id="confirm-open-copy"]', {timeout:20000}).should('be.enabled')
    cy.get('[data-click-id="cancel-open-copy"]').should('be.enabled').click()
  }
  //Delete the report
  if(menuOptions == 'delete report'){
    cy.get('[data-intercom-target="Delete"]', {timeout:2000}).click()
    cy.get('[data-click-id="confirm-delete"]', {timeout:20000}).should('be.disabled')
    cy.get('input[id^=":"]').should('be.visible').last().click().type('yed')
    cy.get('[data-click-id="confirm-delete"]', {timeout:20000}).should('be.disabled')
    cy.get('input[id^=":"]').last().clear().type('yes')
    cy.get('[data-click-id="confirm-delete"]').should('be.enabled').click()
  }
  //Create broadcast from Report viewer
  if(menuOptions == 'create broadcast'){
    cy.intercept(Cypress.config().baseUrl + '/api/broadcast/*').as('broadcastResponse');
    cy.get('[data-intercom-target="Create broadcast"]', {timeout:2000}).click()
    //select content
    cy.get('[data-test-id="report-select"]').should('contain.text', 'Advance search for all componentexpand_more')
    cy.contains('Name').should('be.visible')
    cy.contains('Select aggregate').should('be.visible').click()
    cy.get('[data-intercom-target="Count (all)"]').should('be.visible').click()
    cy.contains('Select...').should('be.visible').click()
    cy.get('[data-intercom-target="Is higher than"]').click()
    cy.get('input[placeholder="Enter value"]').should('be.visible').click().type('2')
    //select audience
    cy.get('[data-test-id="audience-select"]').should('be.visible').click()
    cy.get('[data-intercom-target="From group or individual email"]').click()
    cy.contains('Add to audience list (0)', {timeout:30000}).should('be.disabled')
    cy.get('textarea[placeholder="Email addresses"]').should('be.visible').click().type('qa@ardoq.com')
    cy.contains('Add to audience list (1)').should('be.enabled').click()
    cy.contains('Email', {timeout:30000}).scrollIntoView().should('be.visible')
    //select schedule and reminder
    cy.contains('Run a single broadcast').scrollIntoView().should('be.visible').click()
    //launch boradcast
    cy.get('[data-test-id="launch-button"]').should('be.enabled').click()
    cy.get('[data-click-id="save-broadcast-dialog-box-before-launching"]', {timeout:30000}).should('be.disabled')
    cy.get('[id="enter-broadcast-name"]').click().type('BroadcastFromReport_Impact')
    cy.get('[data-click-id="save-broadcast-dialog-box-before-launching"]').should('be.enabled').click()
    cy.wait('@broadcastResponse').its('response.statusCode').should('eq', 200)
    //review broadcast
    cy.contains('The broadcast will be automatically sent to your audience when the Count (all) of Name is greater than the threshold of 2').should('be.visible')
    cy.contains('Launch now').should('be.enabled').click()
    cy.wait('@broadcastResponse').its('response.statusCode').should('eq', 200)
    cy.contains('Broadcast scheduled').should('be.visible')
    cy.get('[role="modal"]')  
    .should('be.visible')
    .then(cy.wrap).contains('Close')
        .click({force:true})
  }
  //Permission for dashboard and report
  if(menuOptions == 'add read permission'){
    cy.get('[data-intercom-target="Permissions"]').should('be.visible').click()
    cy.contains('Manage '+asset.charAt(0).toUpperCase()+asset.slice(1)+' Permissions').should('be.visible')
    cy.contains('All organization members').should('be.visible')
    cy.get('[data-click-id="permission-access-level-select"]').last().click()
    if(cy.get('[data-intercom-target="No default access"]').should('have.css', 'background-color', 'rgb(241, 247, 254)')){
    cy.get('[data-intercom-target="Read-only permissions"]').should('have.css', 'background-color', 'rgba(0, 0, 0, 0)').click()
    }
    cy.get('[role="modal"]')  
    .should('be.visible')
    .then(cy.wrap).contains('Close')
        .click({force:true})
  }
})

Cypress.Commands.add('sendBroadcastNow', () =>{
  cy.get('[data-click-id="type-to-filter"]').should('be.visible').clear().type('BroadcastFromReport_Impact')
  cy.get('button[data-is-active="false"]', {timeout:30000}).contains('more_vert').click()
  cy.get('[data-intercom-target="Send now"]').click()
})

Cypress.Commands.add('editWorkspaceProperties', ()=>{
  cy.wait(2000)
  cy.get('[data-tooltip-text="Sidebar Menu"]', {timeout:5000}).should('be.visible').click();
  cy.contains('Edit workspace properties', {timeout:5000}).click();
})

Cypress.Commands.add('permissionDashboard', (userPermission, dashboardName) =>{
  if (dashboardName == 'Dashboard for References for different chart type (copy)'){
    cy.get('[data-click-id="app-main-sidebar-analytics-button"]').click()
    cy.contains('Dashboards Overview').click()
  }
  cy.get('[data-click-id="type-to-filter"]', {timeout:5000}).should('be.visible').clear().type(dashboardName, {delay:20})
 
  //Admin user
  if (userPermission == 'dashboard can be read'){
  cy.get('[data-click-id="asset-manager-name-click"]', {timeout:5000}).should('contain.text',dashboardName).should('be.visible')
  }
})

Cypress.Commands.add('confirmUpdatedName', (customText) =>{
  cy.url().should('eq', 'https://prodtest.ardoq.com/app/dashboard/')
  cy.wait(2000)
  cy.get('[data-click-id="type-to-filter"]', {timeout:50000}).should('be.visible').click().type('{selectall}{backspace}')
  cy.get('[data-click-id="type-to-filter"]').click().type(customText)
  cy.get('[data-click-id="asset-manager-name-click"]', {timeout:50000}).last().should('contain.text',customText)
})

Cypress.Commands.add('confirmDeletedWidget', () => {
  cy.get('[data-click-id="type-to-filter"]', {timeout:50000}).should('be.visible').click().type('{selectall}{backspace}').type('Dashboard for Components for different chart type')
  cy.get('[data-click-id="asset-manager-name-click"]', {timeout:5000}).last().should('contain.text','Dashboard for Components for different chart type').click()
  cy.contains('Number widget').should('not.exist')
  cy.contains('Go to Dashboard overview').as('btn').click({force:true})
})

Cypress.Commands.add('confirmCopiedWidget', () => {
  cy.get('[data-click-id="type-to-filter"]', {timeout:50000}).should('be.visible').click().type('{selectall}{backspace}').type('Dashboard for References for different chart type')
  cy.get('[data-click-id="asset-manager-name-click"]', {timeout:5000}).last().should('contain.text','Dashboard for References for different chart type').click()
  cy.contains('(copy)').scrollIntoView().should('be.visible')
  cy.contains('Go to Dashboard overview').as('btn').click({force:true})
})

Cypress.Commands.add('checkEmptyDashboard', () =>{
  cy.contains('Nothing here yet ...').should('be.visible')
  cy.contains('Start adding to your dashboard').should('be.visible')
  cy.contains('Add dashboard widgets').then($button =>{
    if ($button.is(':visible')){
      cy.wrap($button).click()
      cy.get('[data-intercom-target="add widget"]').should('be.visible')
    }
    else {
      cy.log(console.error())
    }
    })
  })

  Cypress.Commands.add('openAssetInDiscover', (asset,assetName) =>{
    cy.get('[data-click-id="app-main-sidebar-workspace-button"]', {timeout:50000}).click()
    cy.get('[data-click-id="type-to-filter"]').clear().type(assetName)
    cy.get('[data-click-id="asset-manager-name-click"]', {timeout:20000}).contains(assetName).click()
    cy.url().should('contain', '/'+asset+'/', {timeout:50000})
    cy.get('[data-tooltip-text="Copy '+asset+' URL"]').should('be.visible').click()
    cy.wait(2000)
    cy.get('[data-intercom-target="Copy Discover '+asset+' URL"]').should('be.visible').realClick()
    cy.pasteFromClipboard();
    cy.window().then((win) => {
    return win.navigator.clipboard.readText();
    })
    .then((urlFromClipboard) => {
    cy.request(urlFromClipboard).then((response) => {
      expect(response.status).to.eq(200);
    });
    cy.visit(urlFromClipboard)
  });
  })

  Cypress.Commands.add('confirmActionsReport', (menuOptions) =>{
    cy.get('[data-click-id="app-main-sidebar-analytics-button"]').should('be.visible').click()
    cy.contains('Reports Overview').click()
    if (menuOptions == 'copy report'){
      cy.get('[data-click-id="type-to-filter"]').should('be.visible').clear().type('Gremlin search for all references(copy)')
      cy.get('[data-click-id="asset-manager-name-click"]').contains('Gremlin search for all references(copy)').should('be.visible')
    }
    if (menuOptions == 'edit report'){
      cy.get('[data-click-id="type-to-filter"]').should('be.visible').clear().type('Gremlin search for all references(copy)')
      cy.get('[data-click-id="asset-manager-name-click"]').contains('Gremlin search for all references(copy)').click()
      cy.get('[data-click-id="report-builder-aggregate-select-button"]').should('contain.text', 'Count')
    }
    if (menuOptions == 'delete report'){
      cy.get('[data-click-id="type-to-filter"]').should('be.visible').clear().type('Advance search for all component(copy)')
      cy.contains('No results found').should('be.visible')
      cy.contains('There is no item with name matching "Advance search for all component(copy)" ').should('be.visible')
    }
  })

Cypress.Commands.add('readOnlyPermissionAsset', (assetName, asset) =>{
  cy.get('[data-click-id="app-main-sidebar-analytics-button"]', {timeout:50000}).click()
  cy.get('[data-click-id="type-to-filter"]').should('be.visible').clear().type(assetName)
  cy.get('[data-click-id="asset-manager-name-click"]').last().should('contain.text',assetName).rightclick()
  cy.get('[data-intercom-target="Permissions"]').should('be.visible').click()
  cy.contains('Manage '+asset.charAt(0).toUpperCase()+asset.slice(1)+' Permissions').should('be.visible')
  cy.contains('All organization members').should('be.visible')
  cy.get('[data-click-id="permission-access-level-select"]').last().click()
  cy.get('[data-intercom-target="Read-only permissions"]').should('have.css', 'background-color', 'rgb(241, 247, 254)')
  cy.get('[data-intercom-target="No default access"]').should('have.css', 'background-color', 'rgba(0, 0, 0, 0)')
  cy.contains('Close').click({force:true})
})

Cypress.Commands.add('verifyPermission', (user,permissionStatus, assetName, asset) =>{
  // cy.wait(5000)
  cy.get('[data-click-id="app-main-sidebar-analytics-button"]', {timeout:90000}).click()
  cy.contains(asset.charAt(0).toUpperCase()+asset.slice(1)+'s Overview').should('be.visible').click()
  cy.url().should('be.equal', 'https://prodtest.ardoq.com/app/'+asset+'/', {timeout:20000})
  cy.get('[data-click-id="type-to-filter"]').should('be.visible').type(assetName)
  if(permissionStatus == 'asset can not be read'){
    cy.contains('No results found', {timeout:30000}).should('be.visible')
    cy.contains('There is no item with name matching "'+assetName+'" ')

    if (asset == 'dashboard'){
      cy.get('button:contains("Create new")').should('be.disabled')
    }
    if (asset == 'report' && user === 'Bob' ){
      cy.get('button:contains("Create new")', {timeout:90000}).should('be.enabled')
    }
    if (asset == 'report' && user === 'Charlie' ){
      cy.get('button:contains("Create new")', {timeout:9000}).should('be.disabled')
    }
  }
  if(permissionStatus == 'asset can be read'){
    cy.get('[data-click-id="asset-manager-name-click"]', {timeout:5000}).should('contain.text', assetName).should('be.visible')
  }
})

Cypress.Commands.add('readerPermissionAsset', (user, assetName, asset) => {
  cy.get('[data-click-id="asset-manager-name-click"]').last().should('contain.text',assetName).rightclick()
  cy.get('[data-intercom-target="Open"]').should('be.visible').click()
  if (asset == 'dashboard'){
  cy.get('button:contains("Edit")', {timeout:50000}).first().should('be.disabled')
  cy.contains('Add to presentation').should('be.visible').should('be.enabled')
  }
  //writer user
  if (asset == 'report' && user === "Bob"){
    cy.get('button:contains("Edit")', {timeout:50000}).first().should('be.disabled')
    cy.contains('Add to presentation').should('be.visible').should('be.enabled')
  }
  //reader user
  if (asset == 'report' && user === "Charlie"){
    cy.get('button:contains("Edit")', {timeout:5000}).first().should('be.disabled')
    cy.contains('Add to presentation').should('be.visible').should('be.disabled')
  }
  cy.contains('Go to '+asset.charAt(0).toUpperCase()+asset.slice(1)+' overview').should('be.visible').click()
  cy.url().should('eq', 'https://prodtest.ardoq.com/app/'+asset+'/')
  
})

Cypress.Commands.add('createPresentation', () =>{
  const todaysDate = dayjs().format('MMM DD, YYYY hh mm');
  cy.get('[data-click-id="app-main-sidebar-workspace-button"]', {timeout:20000}).should('be.visible').click()
 
  cy.get('[data-click-id="open-create-dropdown"]').should('be.visible').click()
  cy.get('[data-intercom-target="Presentation"]').should('be.visible').click()
  cy.url().should('eq', 'https://prodtest.ardoq.com/app/presentation-admin')
  cy.get('.right-pane-fab').click({force:true})
  cy.contains('New presentation').should('be.visible')
  cy.get('button:contains("Save")').should('be.disabled')
  cy.get('.form-control').first().type('NewPresentatio' + todaysDate)
  cy.get('button:contains("Save")').should('not.be.disabled').click()
  cy.get('[data-intercom-target="add view as slide"]').should('contain.text', 'Open presentation')
  cy.get('[data-click-id="app-main-sidebar-analytics-button"]').should('be.visible').click()
})

Cypress.Commands.add('checkPresentation', (assetName, asset) =>{
  cy.get('[data-click-id="app-main-sidebar-presentations-button"]', {timeout:5000}).should('be.visible').click()
  cy.wait(2000)
  cy.get('button', {timeout:50000}).contains('Edit').last().click()
  cy.url().should('contain', '/'+asset+'/', {timeout:50000})
  cy.contains(assetName, {timeout:90000}).should('be.visible')
  cy.contains('Go to '+asset.charAt(0).toUpperCase()+asset.slice(1) +' overview').should('be.visible').click()
  cy.url().should('eq','https://prodtest.ardoq.com/app/'+asset+'/')
})

Cypress.Commands.add('checkDeletedDashboard', (dashboardName) =>{
  cy.get('[data-click-id="type-to-filter"]', {timeout:5000}).should('be.visible').clear().type(dashboardName)
  cy.get('table tbody td:nth-child(2)', {timeout:5000}).should('have.length', 0)
  cy.contains('No results found').should('be.visible')
})

Cypress.Commands.add('reportInDiscover', ()=>{
  let discoverURL = '';
  let appURL = ''; 
  cy.url().should('contain', '/discover/report', {timeout:50000})
  cy.contains('Advance search for all component').should('be.visible')
  cy.contains('Automate C').should('be.visible')
  cy.get('[data-tooltip-text="Copy report URL"]').should('be.visible').click()
  cy.get('[data-intercom-target="Copy Discover report URL"]').should('be.visible')
  cy.pasteFromClipboard();
  cy.window().then((win) => {
  return win.navigator.clipboard.readText();
  })
  .then((textFromClipboard) => {
  discoverURL = textFromClipboard;
  appURL = discoverURL.replace('discover', 'app')
  cy.request(discoverURL).then((response1) => {
    cy.request(appURL).then((response2) => {
      // Check if the status codes of both responses are the same (e.g., 200 OK)
      expect(response1.status).to.eq(response2.status);
      });
  });
})
})

Cypress.Commands.add('pasteFromClipboard', () => {
  cy.window().then((win) => {
    win.document.execCommand('paste');
  });
});

Cypress.Commands.add('dashboardInDiscover', () =>{
  cy.contains('Dashboard data has been updated at').should('be.visible')
  cy.contains('Dashboard for References for different chart type').should('be.visible')
  cy.contains('Source Componentwidget').should('be.visible')
  cy.contains('Target Componentwidget').scrollIntoView().should('be.visible')
})


Cypress.Commands.add('navigateOrgSettingsPage' ,(tabOption, failSafe)=>{
  //Try clicking on the relevant settings page tab 
  cy.get('body').then(($tabBtn) =>{
    if($tabBtn.find('[data-tab-id="'+tabOption+'"]').length>0){
      //Tab option found. Click on it
      cy.get('[data-tab-id="'+tabOption+'"]').should('be.visible').click({force:true});
    }else{
      //Tab option not found. Just navigate to the page URL
      cy.visit(failSafe)
    }
  })
});


Cypress.Commands.add('verifyCreateBtnIsDisabled', ()=>{
  //Check that the "Create New" button is disabled in the home page
  cy.get('[data-click-id="open-create-dropdown"]', { timeout: 15000 }).should('be.disabled');
});

Cypress.Commands.add('openWorkspace', myWorkspace =>{
  let lastModifiedSelector = '[data-click-id=last-modified]';
  //Open workspace
  cy.get('[data-click-id="clear-filters-chip"]',{timeout: 20000}).click();
        //Using .dlbclick() for the last modified selector doesn't work. 
        cy.get(lastModifiedSelector).click();
        cy.get(lastModifiedSelector).click();
        cy.get('[data-click-id="filter-workspaces-chip"]').click();
        cy.get('[data-click-id="type-to-filter"]')
          .click()
          .clear()
          .type(myWorkspace)
          .then(() => {
            cy.contains(myWorkspace, {
              timeout: 10000,
          })
              .first()
              .click();
          });
});

Cypress.Commands.add('verifyScenarioBtnsAfterPrivChange', check =>{
  //Check that the workspace view is visible
  cy.get('[data-click-namespace="left visualization tabs"]').should('be.visible');
  //Click on the scenario dropdown
  cy.get('[data-tooltip-text="Scenario"]', {timeout: 50000}).should('be.visible').click();
  //There should be only one available option in the scenarios dropdown -> "Add selection to scenario"
  cy.get('[type="DROPDOWN_OPTION"]').contains('Add selection to scenario ').should('be.visible')
  //The options below should NOT be visible for a reader user or a user that does NOT have "create a scenario" privilege enabled
  cy.get('[type="DROPDOWN_OPTION"]').contains('Create scenario from view').should(check);
  cy.get('[type="DROPDOWN_OPTION"]').contains('Create scenario from selection').should(check);
});


Cypress.Commands.add('navigateHome', ()=>{
  //Click on the home button. 
  //If the home button is not visible for some reason then navigate to home page using URL
  cy.get('body').then(($homeBtn)=>{
    if($homeBtn.find('[id="ardoqLogo"]').length>0){
      cy.log('click on btn')
      cy.get('[id="ardoqLogo"]').click();
    }else{
      cy.log('navigate')
      cy.visit('app/home');
    }
  })

});

Cypress.Commands.add('closeDropdown', ()=>{
  //Close most dropdowns in Ardoq by pressing Escape key
  cy.get('body').type('{esc}');
});

Cypress.Commands.add('createScenarioFromSelection', (componentName, scenarioName) =>{
  //Select component in sidebar area 
  cy.get('[class="component-name component"]:contains("'+componentName+'")').click();
  cy.wait(1000);
  //Click on scenario dropdown 
  cy.get('[data-tooltip-text="Scenario"]', {timeout: 50000}).should('be.visible').click();
  //Click on create scenario from selection
  cy.get('[type="DROPDOWN_OPTION"]').contains('Add selection to scenario ').should('be.visible');
  cy.get('[type="DROPDOWN_OPTION"]').contains('Create scenario from selection').click();
  //Enter scenario name and confirm
  cy.get('[data-click-id="add-scenario-name-here"]').type(scenarioName);
  cy.get('[data-click-id="create-scenario-confirm-button"]').click();
  //Verify scenario created modal displayed 
  cy.wait(1000)
  cy.get('[data-click-id]:contains("The scenario has been created successfully")', {timeout: 8000}).should('be.visible')
});



//Copy workspace from org  
Cypress.Commands.add('copyWorkspaceFromViolaSandbox', id => {
  //Copy workspaces from different org ("Applications")
  cy.request({
    method: 'POST',
    url: 'https://violasandbox.ardoq.com/api/workspace/copy',
    headers:{authorization: "Bearer 3bd373bc91864d349b298851494d3fb0",
             'X-org': "violasandbox"},
    body: {
      "target-org":"prodtest",
      "workspaces":[id]
    }
  }).then((response) => {
    expect(response.status).to.eq(201);
  })
});


Cypress.Commands.add('toggleSidebarMenu', ()=>{
  //Open sidebar menu
  cy.get('[data-tooltip-text="Sidebar Menu"]')
  .should('be.visible')
  .click()
});

Cypress.Commands.add('toggleCreateComponentSbMenu', ()=>{
  cy.get('[data-tooltip-text="Create a component"]', {timeout: 30000}).click();
})

Cypress.Commands.add('verifySidebarMenuOptions', ()=>{
  cy.get('[data-click-id="edit-workspace-properties-menu-item"]').should('be.visible');
  cy.get('[data-click-id="view-workspace-history-menu-item"]').should('be.visible');
  cy.get('[data-click-id="restore-deleted-components-and-references-menu-item"]').should('be.visible');
  cy.get('[data-click-id="edit-collaborators-and-permissions-menu-item"]').should('be.visible');
  cy.get('[data-click-id="delete-workspace-menu-item"]').should('be.visible');
  cy.get('[data-click-id="export-workspace-to-excel-menu-item"]').should('be.visible')
})

Cypress.Commands.add('addComponentToWorkspace', (myComponentName, myComponentType) =>{
  //Enter component Name
  cy.get('[data-click-id="editor-input-name"]').should('be.visible').clear().type(myComponentName); 

  //Select component type AutoScriptCompType_2
  cy.get('[data-click-id="editor-input-typeId"]').should('be.visible').click(); 
  cy.get('[data-intercom-target="'+myComponentType+'"]').click(); 

  //Click save btn  
  cy.wait(1000);
  cy.get('[data-click-id="sidebar-action-save-create"]').click();    
})

Cypress.Commands.add('addCompAndAvoidErrorModal', (myComponentName, myComponentType)=>{
//Create new component
cy.addComponentToWorkspace(myComponentName,myComponentType)
cy.wait(2000)
//Sometimes if Cypress is creating components too quickly a "Could not connect to Ardoq servers" modal will appear
// Check if modal is present //[id="ardoqAppContainer"]
cy.get('body').then($body => {
  if ($body.find('[role="modal"]').length > 0) {
    //Close modal, and try create component again
    cy.get('[type="button"]:contains("Close")').click(); //Close modal
    cy.reload()
    cy.toggleCreateComponentSbMenu();
    //cy.addComponentToWorkspace(myComponentName,myComponentType)
  } else {
    //Don't do anything
    cy.log('Not Found')
 
    }
});
})

Cypress.Commands.add('createBlankWorkspace', ()=>{
  //Create blank template
  cy.get('[data-click-id=open-create-dropdown]', {timeout: 80000}).should('be.visible').click();
  cy.get('[data-click-id=open-create-workspace-wizard]').click();
});

Cypress.Commands.add('selectTemplate', (templateCategory,templateName)=>{
  //Select Template Category
  cy.get('[id="'+templateCategory+'"]').click();
  //Select template
  cy.get('[data-click-id="'+templateName+'"]').scrollIntoView().click();
});


Cypress.Commands.add('createThreeLevelMetamodel', (level_1, level_2, level_3, todaysDate)=>{
  //Enter in component type
  cy.get('[value = "Create your own structure"]')
  .clear()
  .type(level_1 + todaysDate)
  .type('{enter}');
  cy.wait(2000);

  //Add second level
  cy.get('[style="font-size: 16px;"]:contains("add")').click();

  //Type the name of child node
  cy.get('[placeholder="Component type"]').first().type(level_2 + '{enter}');
  cy.wait(2000);

  //Add third level
  cy.get('[style="font-size: 16px;"]:contains("add")').first().click({force:true});
  
  //Type the name of the grandchild node
  cy.get('[placeholder="Component type"]').first().type(level_3 + '{enter}');

  //Save and close the frame
  cy.get('button:contains("Save")').click();
  cy.wait(2000)
  cy.get('[tabindex="-1"]').eq([1]).click();
});

Cypress.Commands.add('enterInWorkspaceName',(workspaceName, todaysDate)=>{
  cy.intercept(Cypress.config().baseUrl + '/api/workspace/*').as('work');
  cy.get('[data-click-id="editor-input-name"]')
    .first()
    .should('be.visible')
    .clear()
    .click()
    .type(workspaceName + todaysDate); //Change the name of workspace
  cy.contains('Save').click(); //Click on Save button
  cy.wait('@work').its('response.statusCode').should('eq', 200); //checking whether api response has been received
  cy.wait(2000)
});

Cypress.Commands.add('clickOnSpecificViewInTab', (view)=>{
  cy.get('[data-click-id='+view+']').first().should('be.visible').click(); // Enable Block Diagram view
});

Cypress.Commands.add('addReferenceToWorkspace', referenceName =>{
  cy.contains('link').first().click(); //Click on link to add the reference
  cy.get('.component-name').last().click(); // Select the component which needs to be referenced
  cy.wait(2000);
  cy.get('[data-click-id="editor-input-displayText"]')
  .first()
  .should('be.visible')
  .click()
  .type(referenceName); //Add the name of reference
  cy.get('[data-click-id="sidebar-action-save-create"]').click(); //Save the reference
});

Cypress.Commands.add('addToPresentation', (myPresentation, todaysDate)=>{
  cy.intercept(Cypress.config().baseUrl + '/api/presentation/*').as('presentationSlide');
  cy.intercept(Cypress.config().baseUrl + '/api/presentation').as('presentation');
  cy.intercept(Cypress.config().baseUrl + '/api/slide').as('slide');
  
  //Close sidebar menu
  cy.toggleSidebarMenu()
  cy.wait(2000);
  // Click on export dropdown and add presentation
  cy.get('[data-tooltip-text=Export]').click(); 
  cy.get('[data-intercom-target="Add to presentation"]').last().click(); 
  cy.get('[role="modal"]')
    .find('input')
    .first()
    .type(myPresentation + todaysDate + '{enter}'); 
  cy.get('[data-click-id="confirm button"]').should('be.visible').click();
});

Cypress.Commands.add('verifyPresentationHasBeenCreated', (componentInPresentation)=>{
  //Verify whether presentation has been created
  cy.wait('@presentation').its('response.statusCode').should('eq', 201);
  cy.wait('@slide').its('response.statusCode').should('eq', 201);
  cy.wait('@presentationSlide').then(xhr => {
    expect(xhr.response.body).to.have.property('_id');
    const respBody = xhr.response.body;
    const id = respBody['_id'];
    cy.visit('/' + 'presentation/' + id); //Routing Cypress to Presentation window as Cypress does not support new Window/Tab
    cy.get('.step-indicator-container', { timeout: 20000 }).each(() => {
      cy.get('.next').should('not.be.disabled').click();
    });
    //cy.get('g.component>g>use').first().should('be.visible'); //Clicked on last added item
    cy.contains(componentInPresentation).should('be.visible') //Verify component is in presentation
    cy.get('.step-indicator-container').each(() => {
      cy.get('.previous').should('not.be.disabled').click();
      cy.wait(1000);
    });
  });
});

Cypress.Commands.add('openWorkspaceProperties', ()=>{
  cy.get('i[class="material-icons-round"]:contains("more_vert")', {timeout: 10000}).click();
  cy.get('[data-test-id="edit-workspace-item"]').click()
});

Cypress.Commands.add('minimizeRelatedCompsAndPerspective', ()=>{
  cy.get('[data-click-id=related-components-toggle]').click();
  cy.get('[data-click-id=perspectives-toggle]').click();
})

Cypress.Commands.add('openComponentProperties', (componentToEdit, componentMenuOption) => {
  cy.wait(1000);
  //Edit the name of a recently added component
  cy.get('.component-name:contains("'+componentToEdit+'")', { timeout: 10000 })
    .should('be.visible')
    .last()
    .rightclick(); //Select the component added last in a Scenario
  cy.wait(1000);
  cy.get('[data-intercom-target="'+componentMenuOption+'"]', {timeout: 5000}).click();
});

Cypress.Commands.add('updateComponentStyle', ()=>{
  cy.wait(2000);
  cy.intercept(Cypress.config().baseUrl + '/api/scenario/*/component/*').as(
    'addComponent'
  );
  //Edit the name of a recently added component
  cy.get('.component-name').last().rightclick(); //Select the component added last in a Scenario
  cy.wait(1000);
  cy.get('[data-intercom-target="Edit style"]').click();
  //To select random shapes and icons
  const uuid = () => Cypress._.random(0, 9);
  const uuidModule = () => Cypress._.random(0, 1);
  const id = uuid();
  const moduleId = uuidModule();

  //Edit the icon of component
  cy.get('[data-click-id="editor-input-icon"]').click();
  //cy.get('#react-select-' + moduleId + '-option-1-' + id).click(); //Select random icon //Fix later
  cy.get('[data-intercom-target="Wave"]').click();

  //Edit the style of component
  cy.get('[data-click-id="editor-input-shape"]').click();
  //cy.get('#react-select-shape-field-option-' + moduleId + '-' + id).click(); //Select random style  Fix later
  cy.get('[data-intercom-target="State"]').click()
  cy.contains('Save').click(); //Saves the new name
  cy.wait('@addComponent').its('response.statusCode').should('eq', 200);
  cy.get('.workspace-name').click();
});

Cypress.Commands.add('editIconOfComponent', (iconSelected)=>{
  //Open icon dropdown 
  cy.get('[data-click-id="editor-input-icon"]').click();
  //Select icon
  cy.get('[data-intercom-target="'+iconSelected+'"]').click();
});

Cypress.Commands.add('editStyleOfComponent', (styleSelected)=>{
  //Open style dropdown
  cy.get('[data-click-id="editor-input-shape"]').click();
  //Select style
  cy.get('[data-intercom-target="'+styleSelected+'"]').click()
});

Cypress.Commands.add('clickOnSaveStyleBtn', ()=>{
  //Click on Save style button
  cy.get('[data-click-id="sidebar-action-save-create"]').click();
});

Cypress.Commands.add('openScenario', myScenario =>{
  //Open workspace [Refactor later]
  cy.get('[data-click-id="clear-filters-chip"]',{timeout: 40000}).click();
        cy.get('[data-click-id=last-modified]').dblclick();
        cy.get('[data-click-id="filter-scenarios-chip"]').click();
        cy.get('[data-click-id="type-to-filter"]')
          .click()
          .clear()
          .type(myScenario)
          .then(() => {
            cy.contains(myScenario, {
              timeout: 10000,
          })
              .first()
              .click();
          });
});

Cypress.Commands.add('executeScenarioActionViaContextMenu', (selectedMenuOption, newScenarioName)=>{
  if(selectedMenuOption == 'Copy'){
  cy.intercept(Cypress.config().baseUrl + '/api/scenario/*/copy').as('copyScenario');
  //Copy Scenario
  cy.get('.scenario-name').should('be.visible').rightclick(); //Open the context menu
  cy.get('[data-intercom-target="Copy"]').should('be.visible').click(); //Click on Copy
  cy.get('#copy-name-input')
    .should('be.visible')
    .clear().type(newScenarioName); //Enter the new name

  cy.get('[data-click-id=confirm-create-copy]')
    .click()
    .then(() => {
        cy.wait('@copyScenario').then(interception => {
          testScenarioId = JSON.parse(JSON.stringify(interception.response.body))
              ._id;
        });
        cy.get('[data-click-id=confirm-open-copy]').should('be.visible').click();
      });
    }
  if(selectedMenuOption == 'Rename'){
    cy.get('.scenario-name').should('be.visible').rightclick(); //Open the context menu
    cy.get('[data-intercom-target="Rename"]').should('be.visible').click();
    cy.get('#enter-scenario-new-name').click().clear().type(newScenarioName);
    cy.contains('Ok').click();
  }
});

Cypress.Commands.add('deleteAsset', (asset)=>{

  //I don't know why but this @deleteScenario results in a 200 instead of a 204 response. 
  //This only happens during the first run in the platform1 job BUT during the uaeenv job
  //with the same test case everything passes for scenario.js. Anyway i'm commenting this out for now.

  // cy.intercept(Cypress.config().baseUrl + '/api/scenario/*').as(
  //   'deleteScenario'
  // );
  cy.wait(1000);
  cy.get('[data-click-id=app-main-sidebar-workspace-button]').click();
  //Delete Scenario
  cy.wait(1000);
  cy.get('[data-click-id="clear-filters-chip"]')
    .should('be.visible')
    .click({force:true});
  cy.get('[data-click-id="type-to-filter"]')
      .click()
      .clear()
      .type('Renamed - Scenario')
      .then(() => {
        cy.contains(asset)
            .should('be.visible')
            .first()
            .rightclick();
      });

  //Select delete option from rightclick options
  cy.get('[data-intercom-target="Delete"]').should('be.visible').click();
  cy.get('input').last().should('be.visible').click().type('yes'); //Enter yes
  cy.get('[data-click-id=confirm-delete]').click(); //Confirm delete
  cy.wait(1000)
  //cy.wait('@deleteScenario').its('response.statusCode').should('eq', 204);
  cy.contains('No results found').should('be.visible');
})