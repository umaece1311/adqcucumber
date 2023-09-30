// import { should } from 'chai';
// import cypress from 'cypress';

import 'cypress-iframe';
import 'cypress-wait-until';

const responseTimeout = 100000;
const pause = 1000;
const dropdownSelector = '[data-intercom-target=';
const dayjs = require('dayjs');
const todaysDate = dayjs().format('MMM DD, YYYY hh mm');
const oauthToken = Cypress.env("OAUTH_TOKEN");
//API requests for creating a workspace.
//A Test workspace will be needed prior to creating a Message broadcast
const createWorkspaceRequestForBroadcasts = ({
  name,
  views,
  model,
  description = '',
  startView = null,
}) =>
  cy .request('POST', '/api/workspace/create', {
      name: name || model.name,
      views: views || model.defaultViews,
      componentTemplate: model._id,
      description,
      startView: 'blockDiagram',
    })
    .then(response => {
      persistedWorkspaceResponse = response.body;
      return response.body;
    });

let persistedWorkspaceModels = null;
const fetchWorkspaceModels = ({ forceRequest = false } = {}) =>
  persistedWorkspaceModels && !forceRequest
    ? new Cypress.Promise(resolve => resolve(persistedWorkspaceModels))
    : cy.request('GET', '/api/model?includeCommon=true').then(({ body }) => {
        persistedWorkspaceModels = body;
        return body;
      });

const createComponents = ({ modelId, workspaceId, typeId, componentName }) =>
  cy
    .request('POST', '/api/component', {
      name: componentName,
      model: modelId,
      description: '',
      parent: null,
      typeId: typeId,
      rootWorkspace: workspaceId,
      type: 'Person',
      _order: 1,
    })
    .then(response => {
      persistedComponentResponse = response.body;
      return response.body;
    });

const createReference = (componentFrom, componentTo, workspaceId) =>
  cy
    .request('POST', '/api/reference', {
      source: componentFrom,
      target: componentTo,
      type: 24,
      order: 0,
      description: 'Ref1',
      rootWorkspace: workspaceId,
    })
    .then(response => {
      persistedComponentResponse = response.body;
      return response.body;
    });

let persistedWorkspaceId = null;
let persistedWorkspaceResponse = null;
let persistedComponentResponse = null;
let persistedComponentId = null;

export const createWorkspaceForBroadcast = (name, modelName) => {
  fetchWorkspaceModels().then(workspaceModels => {
    const model = workspaceModels.find(({ name }) => name === modelName);
    if (model) {
      createWorkspaceRequestForBroadcasts({ name, model }).then(
        workspaceResponse => {
          persistedWorkspaceId = JSON.parse(JSON.stringify(workspaceResponse));
          const workspaceId = persistedWorkspaceId.workspace._id;
          const modelId = workspaceResponse.workspace.componentModel;
          const typeId = workspaceResponse.model.root.id;
          createComponents({
            modelId,
            workspaceId,
            typeId,
            componentName: 'Person 1',
          }).then(componentResponse => {
            persistedComponentId = JSON.parse(
              JSON.stringify(componentResponse)
            );
            const componentFrom = persistedComponentId._id;
            createComponents({
              modelId,
              workspaceId,
              typeId,
              componentName: 'Person 2',
            }).then(componentResponse => {
              persistedComponentId = JSON.parse(
                JSON.stringify(componentResponse)
              );
              const componentTo = persistedComponentId._id;
              //   createReference(componentFrom, componentTo, workspaceId);
            });
          });
        }
      );
    } else {
      throw new Error(
        `Workspace template "${modelName}" not found. Please choose one of:
          \n${workspaceModels.map(({ name }) => `"${name}"`).join(',\n')}.`
      );
    }
  });
};

Cypress.Commands.add('editComponentModel', componentModelName => {
  //Find component model field box and enter in a new comp type name
  let componentTypeTextBox = cy
    .get('[value="Create your own structure"]', { timeout: 20000 })
    .should('be.visible');
  componentTypeTextBox.clear();
  componentTypeTextBox.type(componentModelName);
  componentTypeTextBox.type('{enter}');

  //Close component model page
  cy.get('button:contains("Save")').click();
  cy.wait(2000)
  cy.get('[tabindex="-1"]').eq([1]).click();
});

//Change component type for existing components
//Refactor at a later stage.
Cypress.Commands.add('changeComponentTypes', () => {
  //Click on the Component tab option
  cy.get('[data-tab-id="component"]', { timeout: 20000 })
    .should('be.visible')
    .click();

  //Change the existing components to the new component type
  cy.contains('Person 1', { timeout: 20000 }).click();
  cy.wait(1000);
  cy.contains('Edit component properties', { timeout: 20000 }).click();

  //Find save button for component properties
  //cy.get('.gqcVPv', { timeout: 20000 }).should('be.visible').click();
  cy.contains('Save', { timeout: 20000 }).should('be.visible').click();

  //Change the existing components to the new component type
  cy.contains('Person 2', { timeout: 20000 }).click();
  cy.wait(1000);
  cy.get('[data-tooltip-text="Sidebar Menu"]').click();
  cy.contains('Edit component properties', { timeout: 20000 })
    .should('be.visible')
    .click();
  //cy.get('.gqcVPv', { timeout: 20000 }).should('be.visible').click();
  cy.contains('Save', { timeout: 20000 }).should('be.visible').click();
});

Cypress.Commands.add('openCyberEditor', () => {
  cy.wait(1000);
  cy.get('[data-tooltip-text="Sidebar Menu"]').click();
})

Cypress.Commands.add('createWorkspaceField', (name, componentType) => {
  //Click on workspace tab
  cy.get('button:contains("Workspace")')
    .should('be.visible')
    .click();
  cy.get('li:Contains("Manage field types")', { timeout: 10000 }).click();
  //cy.get('.editor-actions > .sc-fzocqA').should('be.visible').click(); //Click on Add field
  cy.contains('Add field', { timeout: 20000 }).should('be.visible').click(); //Click on Add field
  cy.get('.css-f3fgeq')
    .click()
    .type(name + '{downarrow}{enter}'); //Enter the name of the field
  //Change field to Email
  cy.get('#type-field > .css-l2tfzn-control > .css-soj79q')
    .should('be.visible')
    .click();
  cy.contains(componentType, { timeout: 20000 }).scrollIntoView().click();

  //Enter default value for Contact email
  cy.get('#default-value-field', { timeout: 20000 })
    .should('be.visible')
    .clear()
    .type('isanda.notshe@ardoq.com');

  //Apply Field to all Component Type
  cy.contains('Applies to all components in this workspace', {
    timeout: 20000,
  }).click();
  // cy.get('.editor-actions > div > .sc-fzocqA', { timeout: 20000 }).click(); //Save the field
  cy.get('.editor-actions').contains('Create', { timeout: 20000 }).click(); //Save the field
  // cy.get(':nth-child(2) > .sc-AxheI > .material-icons-round').click(); //Close the Manage Fields window
  // cy.wait(2000);
  // cy.get(':nth-child(2) > .sc-AxheI > .material-icons-round').click();
  // cy.contains('close', {timeout: 20000}).click()
});

//
Cypress.Commands.add('OpenComponentTabOptions', () => {
  cy.wait(2000);
  //Check that the "save" button is not displayed. If it is then click on it. 
  cy.get('#ardoqAppContainer').then(body => {
  if (body.find('[data-click-id="create-save-component"]').length > 0){
    cy.get('[data-click-id="create-save-component"]')
    .click();
  }else{
  //Click on Component option tab
  cy.get('[data-tab-id="component"]', { timeout: 20000 })
    .should('be.visible')
    .click();
  }
  
  });
});

Cypress.Commands.add('OpenComponentProperties', () => {
  //Click on Open component properties
  cy.wait(1000);
  cy.contains('Edit component properties', { timeout: 20000 })
   .click();
  
});

//Enter in email value
Cypress.Commands.add('enterInEmailValue', (componentName, emailField) => {
  //Check component name in properties
  cy.get('#name-field', { timeout: 20000 }).clear().type(componentName);
  //Enter email value
  cy.get('#contact-email-field', { timeout: 20000 })
    .should('be.visible')
    .clear()
    .type(emailField);
  //Click Save button
  //cy.get('.gqcVPv', { timeout: 20000 }).should('be.visible').click();
  cy.contains('Save', { timeout: 20000 }).should('be.visible').click();
});

//Select specific component
Cypress.Commands.add('selectComponent', componentName => {
  cy.contains(componentName, { timeout: 20000 }).click();
});

//Open broadcast overview page
Cypress.Commands.add('openBroadcastOverviewPage', () => {
  cy.get('[data-click-id="app-main-sidebar-broadcasts-button"]', {
    timeout: 20000,
  }).trigger('mouseover', { force: true }, { cancelable: true });
  cy.contains('Broadcast Overview', { timeout: 20000 }).click();
  cy.get('[data-click-id="app-main-sidebar-broadcasts-button"]').trigger('mouseout', {
    force: true,
  }); //Stop hovering over Home menu item
});

//Select create new broadcast
Cypress.Commands.add('selectCreateNewBroadcastBtn', () => {
  // cy.get('.sc-fzoJus > .sc-fzocqA', { timeout: 20000 })
  //   .should('be.visible')
  //   .click();
  cy.contains('Create new', { timeout: 20000 }).should('exist').click();
});

//Select Message content type for broadcasts
Cypress.Commands.add('selectMessageContentType', () => {
  //Select message content type
  cy.get(
    '[style="flex-basis: 280px;"]',
    { timeout: 20000 }
  )
    .should('be.visible')
    .click();
  cy.get('[data-intercom-target="Message"]', { timeout: 20000 }).click();
  //Select workspace
  cy.contains(
    'Select workspace',
    { timeout: 20000 }
  )
    .should('be.visible')
    .click();
  cy.get('[data-intercom-target="Broadcast_Ws_Automated"]', { timeout: 20000 })
    .scrollIntoView()
    .should('exist')
    .click({ force: true });
  //Select component type
  cy.contains(
    'Select component type',
    { timeout: 20000 }
  )
    .scrollIntoView()
    .should('be.visible')
    .click();
  cy.get('[data-intercom-target="Person"]')
    .should('be.visible')
    .click({ force: true });
});

//Select Survey for broadcasts
Cypress.Commands.add('selectSurvey', () => {
  //Select survey drop-down
  cy.contains('Select a survey')
    .should('be.visible')
    .click();
  //Select survey created in precondition
  cy.get('[data-intercom-target="Automated Survey"]')
    .should('be.visible')
    .click();
});

Cypress.Commands.add('previewComponents', () => {
  //Preview components
  cy.wait(1000);
  cy.contains('Preview included components', { timeout: 20000 }).click();
  //Verify that the total amount of components is correct
  cy.wait(1000);
  cy.contains('Person 1', { timeout: 20000 }).should('exist');
  cy.wait(2000);
  //componentPreviewDialog.contains('Person 2').isVisible();
  //  cy.contains('Close').click();
  //cy.get('body > div:nth-child(13) > div > div > div.sc-fzqzEs.eVQcHf > div > div.sc-fznBMq.ekttti > div > button', {timeout:2000}).click();
  cy.get('button:contains("Close")', { timeout: 20000 }).eq(1).click();
});

//Workaround for error regarding "Parent has a css property: display: none"
// Access element whose parent is hidden
Cypress.Commands.add(
  'isVisible',
  {
    prevSubject: true,
  },
  subject => {
    const isVisible = elem =>
      !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
    expect(isVisible(subject[0])).to.be.true;
  }
);

//Select Target Audience for broadcast - By predefined query
Cypress.Commands.add('byPredefinedQuery_Audience', () => {
  //Select By predefined query option
  cy.get('[data-intercom-target="By predefined people query"]', {
    timeout: 20000,
  })
    .should('be.visible')
    .click();
  //Select the Created checkbox
  cy.contains('Created', { timeout: 20000 }).click();
  //Click confirm
  cy.get('button:contains("Add to audience list (1)")', {
    timeout: 20000,
  }).click();
  //Preview audience
  cy.get('button:contains("Preview audience")', { timeout: 20000 }).click();
  //Verify that the audience is visible
  cy.contains('qa@ardoq.com').should('be.visible');
  cy.wait(pause);
  cy.contains('Predefined query').should('exist');
  cy.wait(pause);
  cy.contains('2 components').should('be.visible');
  //Close audience preview
  cy.get('button:contains("Close")', { timeout: 20000 }).eq(1).click();
});

//Select Target Audience for broadcast - Gremlin query
Cypress.Commands.add('byGremlinQuery_Audience', () => {
  //Click on Gremlin query opiton
  cy.get('[data-intercom-target="By Gremlin people query"]', { timeout: 20000 })
    .should('be.visible')
    .click();
  //Edit gremlin query
  cy.wait(2000);
  //cy.get('#ace-editor').contains("g.V(ids).both().hasLabel('Person').path()").clear({ force: true });
  cy.get('#ace-editor > textarea').clear({force: true})
  cy.wait(pause);
  cy.get('[style="width: 500px; height: 150px; font-size: 13px;"] > .ace_scroller > .ace_content').type("g.V(ids).hasLabel('Person').path()");
  //Click on the Test Calculation button
  cy.get('button:contains("Test calculation")').click();
  //Verify gremlin results
  let gremlinResults = cy.get('.GremlinQueryResultsTable__Wrapper-fBgWFt');
  gremlinResults.contains('Person 1').should('be.visible');
  cy.wait(pause);
  //gremlinResults.contains('Person 2').should('be.visible');
  //Click on Audience tab
  cy.get('.hWSNcf').click();
  //verify Audience table
  cy.get('body:contains("Person 2")').should('be.visible');
  cy.wait(pause);
  cy.get('body:contains("2 components")').should('be.visible');
  cy.get('[style="display: flex;"] > div > .material-icons-round').click();
  //Add audience list
  cy.get('button:contains("Add to audience list (1)")', {
    timeout: 20000,
  }).click();
});

//Select General Audience for broadcast - Type in Email
Cypress.Commands.add('byEmail_Audience', () => {
  //Click on Enter email manually
  cy.get('[data-intercom-target="From group or individual email"]', {
    timeout: 20000,
  })
    .should('be.visible')
    .click();
  //Enter in new email
  cy.get('[placeholder="Email addresses"]', { timeout: 20000 })
    .should('be.visible')
    .clear()
    .type('isanda.notshe@ardoq.com');
  //Submit email
  cy.get('button:contains("Add to audience list (1)")', {
    timeout: 20000,
  }).click();
  //Preview audience
  cy.get('button:contains("Preview audience")', { timeout: 20000 }).click();
  //Verify that the audience is visible
  cy.contains('isanda.notshe@ardoq.com').should('be.visible');
  cy.wait(pause);
  cy.contains('Email').should('exist');
  cy.wait(pause);
  cy.contains('All components in the scope').should('be.visible');
  //Close audience preview
  cy.get('button:contains("Close")', { timeout: 20000 }).eq(1).click();
});

//Open the Add Audience dropdown
Cypress.Commands.add('openAddAudienceDropdown', () => {
  cy.wait(2000);
  //Open audience drop down
  cy.get('button:contains("Add audience")', { timeout: 20000 }).click();
});

//Select people workspace - Audience
Cypress.Commands.add('peopleWorkspace_Audience', () => {
  //Click on people workspace in Ardoq
  cy.get('[data-intercom-target="From people workspace in Ardoq"]', {
    timeout: 20000,
  })
    .should('be.visible')
    .click();
  //Select workspace
  cy.get(
    'span:contains("Select a people workspace")'
  ).click();
  cy.get('[data-intercom-target="Broadcast_Ws_Automated"]', { timeout: 20000 })
    .should('be.visible')
    .click();
  //Select Person checkbox

  //Fix this at a later stage when i have more time (Selecting Person checkbox)
  cy.get('tbody > tr > td:nth-child(1) >').click();

  //Add to audience
  cy.get('button:contains("Add to audience list (1)")', {
    timeout: 20000,
  }).click();
  //Preview audience
  cy.get('button:contains("Preview audience")', { timeout: 20000 }).click();

  //Verify that the audience is visible
  cy.contains('Person 2').should('exist');
  cy.wait(pause);
  cy.contains('People workspace').should('exist');
  cy.wait(pause);
  cy.contains('All components in the scope').should('be.visible');
  //Close audience preview
  cy.get('button:contains("Close")', { timeout: 20000 }).eq(1).click();
});

//Message section
Cypress.Commands.add('composeMessage', (Subject, Sender, MessageContent) => {
  //Edit Subject
  Subject = cy
    .get('[placeholder = "Subject"]', { timeout: 20000 })
    .scrollIntoView()
    .focus()
    .should('be.visible');
  Subject.click({ force: true }); // Kept getting the following error "Ensure the element does not have an attribute named disabled" (Workaround)
  Subject.focus().clear().type('Automated test case');
  //Edit Sender
  cy.wait(pause);
  Sender = cy
    .get('[placeholder = "Sender"]', { timeout: 20000 })
    .should('be.visible');
  Sender.clear().type('QA_Automation via Ardoq');
  //Add Custom Logo
  cy.contains("Use your organization's logo", { timeout: 20000 }).click();
  //Edit Message
  cy.get('[data-click-id=edit-broadcast-message]', {
    timeout: 20000,
  }).click();
  MessageContent = cy
    .get('.te-editor > .tui-editor-contents', { timeout: 20000 }).scrollIntoView()
    .should('be.visible');
  MessageContent.clear();
  MessageContent.type('Automation {enter}');
  MessageContent.type('Audience Name = {audienceName}', {
    parseSpecialCharSequences: false,
  });
  MessageContent.type('{enter}');
  MessageContent.type('Component Type = {componentType}', {
    parseSpecialCharSequences: false,
  });
  MessageContent.type('{enter}');
  MessageContent.type('Component Count = {componentCount}', {
    parseSpecialCharSequences: false,
  });
  MessageContent.type('{enter}');
  MessageContent.type('Workspace Name = {workspaceName}', {
    parseSpecialCharSequences: false,
  });
  //Click save button
  cy.get('[data-click-id=edit-broadcast-message]', {
    timeout: 20000,
  }).click();
});

//Schedule = Run single broadcast
Cypress.Commands.add('scheduleSingleBroadcast', () => {
  cy.contains('Run a single broadcast')
  .should('be.visible')
  .click();
});

//Save broadcast
Cypress.Commands.add('saveBroadcast', broadcastName => {
  cy.get('button:contains("Save")').click();
  cy.wait(1000);
  cy.get('[id="enter-broadcast-name"]').type(broadcastName);
  cy.get('[data-click-id="save-broadcast-dialog-box"]').click();
  cy.wait(3000)
});

//Launch broadcast
Cypress.Commands.add('launchBroadcast', (EmailValue, Scope) => {
  //Click launch broadcast
  cy.wait(2000);
  cy.get('button:contains("Launch Broadcast")', { timeout: 20000 }).click();
  //Verify that the audience and component number is displayed
  cy.contains(EmailValue).should('exist');
  cy.wait(pause);
  cy.contains(Scope).should('exist');

  //verify the components tab
  cy.get('[style="display: flex;"]:contains("component (2)")').click();
  cy.contains('Name').should('exist');
  cy.wait(pause);
  cy.contains('Person 1', { timeout: 20000 }).should('exist');

  //Click launch button
  cy.get('button:contains("Launch now")', { timeout: 20000 }).click();
});

//Close broadcast dialog
Cypress.Commands.add('closeBroadcastDialog', () => {
  //Verify that the broadcast dialog is displayed

  //Close the broadcast dialog
  cy.wait(pause);
  cy.get('button:contains("Close")', { timeout: 20000 }).eq(1).click();
});

//Trigger broadcast
Cypress.Commands.add('triggerBroadcast', () => {
  //Open drop down
  cy.get('[class="ardoq-icon material-icons-round"]:Contains("more_vert")', {timeout: 20000}).click({force:true});

  //Trigger broadcast
  cy.get('[data-intercom-target="Send now"]', { timeout: 20000 })
    .should('be.visible')
    .click();
});

//Delete broadcast
Cypress.Commands.add('deleteBroadcast', () => {
  //Open drop down
  cy.get('[class="ardoq-icon material-icons-round"]:Contains("more_vert")', {timeout: 20000}).click();
  //Delete broadcast
  cy.get('[data-intercom-target="Delete"]', { timeout: 20000 })
    .should('be.visible')
    .click();
  cy.wait(1000);
  cy.get('div[role="modal"] > :nth-child(1) > :nth-child(2)').should('contain.text','Are you sure you want to delete');

  cy.get('div[role="modal"] > :nth-child(1) > :nth-child(2) > :nth-child(1) > :nth-child(4) > :nth-child(1) > :nth-child(2)').type('yes')
  //Confirm delete
  // cy.get('[data-click-id="type-yes-field"]', { timeout: 20000 })
  //   .should('be.visible')
  //   .type('YES');
  cy.get('[data-click-id="confirm-delete"]', { timeout: 20000 }).click();
});

//Navigate to Survey overview page
Cypress.Commands.add('openSurveyOverviewPage', () => {
  //Hover over survey icon in the home page
  //cy.get(':nth-child(1) > :nth-child(3) > .atoms__SectionButton-bGjYmp', {
    //timeout: 20000,
  //}).trigger('mouseover', { force: true }, { cancelable: true });
  //Click on the Surveys option
  //cy.get('[class*="MenuTitle"]')
    //.contains('Surveys', { timeout: 20000 })
    //.click();
 // cy.get(
   // ':nth-child(1) > :nth-child(3) > .atoms__SectionButton-bGjYmp'
  //).trigger('mouseout', { force: true }); //Stop hovering over Home menu item
  cy.visit('app/survey-admin/')
});

//Create new survey
Cypress.Commands.add('selectCreateNewSurvey', () => {
  //Select the Create New survey
  cy.get('[data-intercom-target="new survey"]', { timeout: 20000 }).click({
    force: true,
  });
});

//Enter survey details
Cypress.Commands.add('enterSurveyDetails', surveyName => {
  //Enter survey name
  cy.get('[data-test-id="name-input"]').find('input').first().type(surveyName, {force:true});
});

//Enter survey description
Cypress.Commands.add('enterSurveyDesc', text => {
  //Enter survey description
  cy.get('[data-test-id="text-section-input"] [class$="te-editor"]')
    .should('be.visible')
    .type(text);
});

//Enter Workspace and Component details
Cypress.Commands.add(
  'enterWorkspaceAndComponentDetails',
  (workspaceName, componentType) => {
    //Select the Workspace and Components section
    cy.get('[data-test-id="next-button"]').click();
    //Select workspace from drop down. Open the drop down
    cy.get('[data-test-id="workspace-select"]').click();
    //Select the workspace from the precondition
    cy.get(dropdownSelector+'"'+workspaceName+'"'+']').click();
    
    //Select Component type
    cy.get('[data-test-id="component-type-select"]').click();
    cy.get(dropdownSelector+'"'+componentType+'"'+']').click();
  }
);

//Enter Survey Sections details
Cypress.Commands.add('enterSurveySectionDetails', () => {
  //Open Survey section
  cy.contains('Survey Sections').click();
});

//Add survey section
Cypress.Commands.add('addSurveySection', () => {
  //Add new section
  cy.get('i:contains("add")', { timeout: 20000 }).click();
  //cy.get('[data-test-id="add-question-button"]').click();
});

//Add field question
Cypress.Commands.add('addFieldQuestion', () => {
  //Add field question
  //cy.get('[data-test-id="field-button"]').click();
  cy.get('[data-test-id="add-question-button"]').contains('add').click();
});

//Select field question
Cypress.Commands.add('selectFieldQuestion', fieldName => {
  //Select Field dropdown
  //cy.get('[data-test-id="question-type-button"] > :nth-child(2) > :nth-child(1)').click();
  cy.get('[data-test-id="field-button"]').click();

  //Select Field name
  cy.get('[data-intercom-target="'+fieldName+'"]').click();
});

//Survey Section  - Add question title
Cypress.Commands.add('surveySection_addQuestionTitle', questionName => {
  cy.get('[data-test-id="title-input"] > :nth-child(2)').type(questionName);
});

//Save survey
Cypress.Commands.add('saveSurvey', () => {
  cy.get('[data-test-id="save-button"]').click();
  //Set to live

  cy.get('#publish').should('exist').click({ force: true });
});

//Preload survey data into broadcast
Cypress.Commands.add('preloadSurveyIntoBroadcast', () => {
  //Click on the broadcast dropdown option in the survey builder
  cy.get('button:contains("Broadcast")')
    .should('be.visible')
    .click();
  //Click on the Create new broadcast option
  cy.get('[data-intercom-target="Create broadcast"]')
    .should('be.visible')
    .click();
});

//Delete Survey
Cypress.Commands.add('deleteSurvey', () => {
  //click on the dropdown menu for the survey
  cy.get('[class="ardoq-icon material-icons-round"]:Contains("more_vert")').should('be.visible').click();
  //select the delete button
  cy.get('[data-intercom-target="Delete"]').should('be.visible').click();
  cy.wait(1000);
  //Enter YES
  cy.get('[role="modal"]').within(() => {
  cy.get('input').should('be.visible').type('YES') // Only yield inputs within modal
  })
  //Click Delete button
  cy.get('[data-click-id="confirm-delete"]')
    .should('be.visible')
    .click();
});

//Navigate to Best Practice module page
Cypress.Commands.add('openBestPracticeModulePage', () => {
  //Hover over survey icon in the home page
  cy.get(
    ':nth-child(7) > .atoms__SectionButton-jgHnNt > .material-icons-round',
    { timeout: 20000 }
  ).trigger('mouseover', { force: true }, { cancelable: true });
  //Click on the Best Practice Module option
  cy.contains('Best Practice Modules', { timeout: 20000 }).click();
  cy.get(
    ':nth-child(7) > .atoms__SectionButton-jgHnNt > .material-icons-round'
  ).trigger('mouseout', { force: true }); //Stop hovering over Home menu item
});


//Survey Section 2 - Assign question
Cypress.Commands.add('surveySection_AssignField', fieldName => {
  //Select Field dropdown
  cy.get('[data-test-id="field-button"]').click();

  //Select the field name
  cy.get('[data-test-id="field-select"]').click();
  cy.get('[data-intercom-target="'+fieldName+'"]').click();
  //cy.contains(fieldName).should('exist').click();
});

Cypress.Commands.add('surveySection_SetFieldToRequired', () => {
  //Set the section to Required
  cy.contains('Is this field required?')
    .click();
});

//Workspace and Components section -> Allow components to delete
Cypress.Commands.add('allowRespondentsToDeleteComponents', () => {
  cy.contains('Allow respondents to delete components')
    .scrollIntoView()
    .should('be.visible')
    .click();
});

//Click on the field question option
Cypress.Commands.add('addReferenceQuestion', () => {
  cy.get('[data-test-id="add-question-button"]').contains('add').click();
  cy.get('[data-test-id="reference-button"]').click();
  

});

//Add reference question
Cypress.Commands.add(
  'surveySection15_AddReferenceQuestionTitle',
  questionTitle => {
    cy.get('[data-test-id="question-title-input"] > :nth-child(2)').type(questionTitle);
  }
);

//Open Survey
Cypress.Commands.add('openSurvey', (surveyName) => {
  //Open survey landing page and click on survey
  cy.visit('/surveys/');
  cy.wait(2000)
  cy.get('body', { timeout: 20000 })
    .contains(surveyName)
    .should('be.visible')
    .click();
});

//Select create new component button
Cypress.Commands.add('clickOnDocumentNewCompBtn', (newCompBtn) => {
  cy.contains(newCompBtn, {
    timeout: 20000,
  }).click();
});

//Start documenting new component
Cypress.Commands.add('startDocumentingNewComponent', () => {
  //Enter component name
  cy.contains('div', 'Name?')
    .find('input')
    .first()
    .type('Notsh');

  //Enter in contact email field
  cy.contains('div', 'What is your contact email?')
    .find('input')
    .first()
    .type('isanda.notshe@ardoq.com');
});

//Submit survey
Cypress.Commands.add('submitSurvey', () => {
  //cy.get('button:contains("Submit")').should('exist').click();
  cy.get('[data-test-id="submit-button"]').should('exist').click();
});

//Open existing entry
Cypress.Commands.add('openExistingEntry', surveyName => {
  //Click on Entry name, and open survey
    cy.get('table').within(() => {
      cy.contains(surveyName).click() 
    })
});

//Verify info in the survey
Cypress.Commands.add('checkSurveyForInfo', () => {
  //Check component name value
  cy.contains('input', 'Notsh').should('exist');
  //Check contact email value
  cy.contains('div', 'isanda.notshe@ardoq.com').find('input').should('exist');
});

//Open a Workspace
Cypress.Commands.add('openWorkspaceVerifySurvey', WorkspaceNameText => {
  //Navigate to home page
  cy.visit('/');
  //Search for workspace and open
  const searchField = cy
    .get('[data-click-id="type-to-filter"]', { timeout: 20000 })
    .should('be.visible');
  searchField.clear();
  searchField.type(WorkspaceNameText);
  cy.wait(2000);
  cy.get('[data-click-id="type-to-filter"]').then($search => {
    if ($search.val().includes(WorkspaceNameText)) {
      cy.log('found!!');
      cy.contains('SurveyWorkspace_Ws')
        .should('be.visible')
        .click();
    } else {
      cy.log('not found');

      let searchField2 = cy
        .get('.search-input > input', { timeout: 20000 })
        .should('be.visible');
      searchField2.clear();
      searchField2.type(WorkspaceNameText);
        cy.contains('SurveyWorkspace_Ws').click();
    }
  });
});

//Check all fields in the workspace once information has been submitted
Cypress.Commands.add('checkWorkspaceForInfo', () => {
  //Click on the component
  cy.get('#navigator-container').contains('Notsh').should('be.visible').click();
  //Open the Pages view
  cy.contains('Pages', { timeout: 20000 }).should('be.visible').click();
  //Verify all details
  cy.get('span:contains("Contact Email")').should('be.visible');
  cy.get('a:contains("isanda.notshe")').should('be.visible');
  //Verify that the Person 2 Componen has been deleted
  cy.get('#navigator-container').contains('Person 2').should('not.exist');
});

//Clear all broadcasts in the broadcast overview page
Cypress.Commands.add('clearAllBroadcasts', () => {
  // NB Refactor code when i have the spare time
  let findIdValuesArray;
  cy.request('GET', '/api/broadcast')
    .as('testNotshe')
    .then(testNotshe => {
      findIdValuesArray = testNotshe.body;
      if(findIdValuesArray.length>0){;
      
      cy.log('Clear all existing broadcasts')
      cy.get('@testNotshe').its('body').its('0').its('_id').should('exist')
      
      

      //Delete all broadcasts in the broadcast overview page
      for (let index = 0; index < findIdValuesArray.length; index++) {
        cy.request(
          'DELETE',
          '/api/broadcast/' + findIdValuesArray[index]['_id']
        );
      }
    }else{
      cy.log('No broadcasts found');
    }
    });
});

//Enter Result Display option section
Cypress.Commands.add(
  'enterResultDisplayOptions',
  labelForExistingEntriesTxt => {
    //Open Result display options
    cy.contains('Result Display Options').click();
    //Add question
    cy.get('[placeholder="Existing entries"]').type(labelForExistingEntriesTxt);
    //Add field columns
    cy.get('[data-test-id="custom-fields-select"]').contains('expand_more').click();
    cy.wait(1000)
    cy.get('[data-intercom-target="Contact Email"]').should('be.visible').click();
  }
);

//Enter in Result Filtering options
Cypress.Commands.add('enterResultFilteringOptions', () => {
  //Open Result Filtering option
  cy.contains('Result Filtering').click({force:true});
  //Enable the filtering
  cy.contains('Enable filtering').click();
});

//Verify label for buttons
Cypress.Commands.add('verifyLabelsForBtns', (newDocument,existingEntries) => {
  //Verify label for creation
  cy.get('body').contains(newDocument).should('be.visible');
  //Verify label for Existing Entries button
  cy.get('body').contains(existingEntries).should('be.visible');
});

//Delete component in Survey
Cypress.Commands.add('deleteComponentUsingSurvey', () => {
  //Click on delete button
  cy.get('button:contains("Delete")', { timeout: 20000 }).click();
  //Confirm delete -> Will add a unique selector on the frontend. For now .first() seems to work fine
  cy.get('button:contains(Delete)').first().click();
  cy.get(3000)
});

Cypress.Commands.add('openExistingEntries', () => {
  //Click on existing entries button
  cy.contains('Existing members').click();
});

//Copy bundle workspaces 
Cypress.Commands.add('copyAPM', () => {
  //Copy workspaces
  //Copying bundles takes longer than the default allocated timeout duration
  //Configuration values are change for the remaining execution 
  // and values are reset to the previous default once exec is complete 
  Cypress.config('responseTimeout', responseTimeout) 
  cy.request({
    method: 'POST',
    url: '/api/bundle/5cd930dfb3da08123de354d6/copy',
    body: {
      "targetOrg":"prodtest",
      "dryRun":false,
      "branch":false,
      "copyGlobalAttachments":false
    }
  }).then((response) => {
    expect(response.status).to.eq(201);
  })
});

//Navigate to the Viewpoint overview page 
Cypress.Commands.add('openViewpointBuilder', () => {
  //Navigate to the viewpoint overview 
  cy.visit(Cypress.config().baseUrl + 'app/viewpoints/new');
});

//Create a new viewpoint
//Viewpoint name and description

Cypress.Commands.add('enterVpNameAndDescription', (viewpointName, descriptionText) => {
  // Define a recursive function to check and retry entering values
  const enterValuesRecursively = (attempt = 0) => {
    cy.get('input[name="name"]', { timeout: 80000 })
      .clear()
      .type(viewpointName);

    cy.get('textarea[placeholder="Add description here..."]')
      .clear()
      .type(descriptionText);

    // Check if the values match and exit recursion if they do
    cy.get('input[name="name"]').then(($nameInput) => {
      cy.get('textarea[placeholder="Add description here..."]').then(($descTextarea) => {
        if (
          $nameInput.val() === viewpointName &&
          $descTextarea.val() === descriptionText
        ) {
          return; // Values match, exit recursion
        } else if (attempt < 5) {
          // Retry for up to 10 attempts (adjust as needed)
          enterValuesRecursively(attempt + 1);
        } else {
          throw new Error('Unable to set values after multiple attempts');
        }
      });
    });
  };

  // Start the recursive process
  enterValuesRecursively();
});


//Choose viewpoint style 
Cypress.Commands.add('selectVpStyle', selectedChoice => {
  //Choose style
  cy.contains('Relationship View').click()
  cy.contains(selectedChoice).click()
})

//Choose workspace
Cypress.Commands.add('selectVpWorkspace', selectedWorkspace => {
  //Choose your workspace 
  cy.contains('Type or click to find a workspace').click()
  cy.get('div[data-intercom-target = "'+ selectedWorkspace +'"]').last().click()
  //cy.get('label:contains("Select workspace")').click();
})

//Add triple
Cypress.Commands.add('addTriple', (sourceComponentType, referenceType, targetComponentType) => {
  //Click on add step button 
  cy.get('button:contains("Add step")').scrollIntoView().click({force:true});
  //Set source component type 
  cy.contains('Component type').click();
  cy.get('[data-intercom-target = "'+ sourceComponentType +'"]').click()
  //Set reference type
  cy.contains('Reference type').click();
  cy.contains(referenceType).click()
  //Set target component type
  cy.contains('Component type').click()
  cy.get('div[data-intercom-target="'+ targetComponentType +'"]').click()
})

//Set max rep for viewpoint
Cypress.Commands.add('setMaxRep', () => {
  cy.get('input[type="range"]').click({force:true}).type('{rightarrow}, {rightarrow}')
})

//Set triple to flexible
Cypress.Commands.add('allowUserToAdjustMaxRep', () => {
  //Set triple to flexible 
  cy.contains('Enable Discover users to explore within maximum repetitions').click();
});

//Click on submit button 
Cypress.Commands.add('clickOnSaveVp', () => {
  //Save viewpoint 
  cy.get('button:contains("Save")').scrollIntoView().click();
})


//Search for component using search bar in LWUI
Cypress.Commands.add('openComponentUsingLwuiSearchBar', componentName => {
  //Enter component name
  cy.get('#downshift-0-input').type(componentName);
  //Hover over first search result
  cy.get('#downshift-0-item-0').trigger('mouseover');
  //Click on open component details 
  cy.get('button:Contains("Open")').click();
});

//Verify left menu panel for component 
Cypress.Commands.add('verifyLeftMenuPanelDetails', componentHeaderName => {
  //Verify component name 
  cy.get('h1:Contains("'+componentHeaderName+'")').should('be.visible');
  //Verify fields
  cy.get('[data-test-id="expander-button"]').then(($element) => {
    if($element.is(':visible')){
      cy.wrap($element).eq(1).click();
    }
    else {
      cy.log('Element is not visible')
    }
  })
  cy.get('[data-testid="sidebar-content-wrapper"]').trigger('mouseover')
  cy.scrollTo('bottom',{ensureScrollable:false})
  cy.contains('Ardoq ID').should('be.visible')
  cy.contains('Created by (email)').should('be.visible')
  cy.contains('qa@ardoq.com').should('be.visible')
  cy.contains('Created by (name)').should('be.visible')
  cy.contains('QA Team').should('be.visible')
  cy.contains('Created date').should('be.visible')
  cy.contains('Last updated by (email').should('be.visible')
  cy.contains('Last updated by (name)').should('be.visible')
  //cy.scrollTo('bottom')
  cy.contains('Last updated date').should('exist')
})

//Select your viewpoint 
Cypress.Commands.add('selectYourVp', () => {
  //Click on viewpoint dropdown
  cy.get('button:contains("Relationship Overview")').click({force: true});
  //Click on your viewpoint 
  //cy.get('[data-intercom-target]:contains("'+myViewPoint+'")').click();
  cy.get('[data-intercom-target="[object Object]"]').click()
});

//Verify component is displayed in viewpoint 
Cypress.Commands.add('verifyComponentNodesAreVisible', nodeName => {
  cy.contains(nodeName).should('be.visible')
})

//Delete Viewpiont
Cypress.Commands.add('deleteViewpoint', ()=>{
  //Open viewpoint overview 
  cy.visit('/app/viewpoints');
  //Click on viewpoint dropdown 
  cy.get('[class="ardoq-icon material-icons-round"]:contains("more_vert")', {timeout: 20000}).click();
  //Click delete 
  cy.get('[data-intercom-target="Delete"]').click();
  //Confirm 
  cy.get('div[role="modal"]').within(() => {
    cy.get('input').should('be.visible').type('YES') // Only yield inputs within modal
    })
  cy.get('button:Contains("Delete")').click();
})

Cypress.Commands.add('openViewpointPermissionsModal', () => {
  //Open menu dropdown for viewpoint 
  cy.get('[class="ardoq-icon material-icons-round"]:contains("more_vert")').click();
  //Click on permissions button 
  cy.get('[data-intercom-target="Permissions"]').click();
})

Cypress.Commands.add('changeViewpointPermissions', (selectedPermission) => {
  //Change permissions  
  //cy.contains(defaultPermission).click();
  cy.get('[data-click-id="permission-access-level-select"]').last().click() 
  cy.get('[data-intercom-target="'+selectedPermission+'"]').click({force:true})
})

Cypress.Commands.add('changeViewpointPermissionsContributor', (selectedPermission) => {
  //Change permissions  
  //cy.contains(defaultPermission).click();
  cy.get('[data-click-id="permission-access-level-select"]').first().click() 
  cy.get('[data-intercom-target="'+selectedPermission+'"]').click({force:true})
})

Cypress.Commands.add('signOutofArdoqDiscover', ()=>{
  //click on signout
  cy.get('i:contains("person")').click()
  cy.get('[data-intercom-target="Log out"]').click();
})

//Enter in credentials
Cypress.Commands.add('ardoqDiscoverLogin', testUser =>{
  cy.getUserCredentials().then(users => {
    
    if(testUser == 'Charlie')
    {
    //Enter email
    cy.get('[placeholder="yourname@mail.com"]', {timeout: 10000}).type(users.writer.email);
    //Enter password
    cy.get('[type="password"]').type(users.writer.password);
    }else if(testUser == 'Bob'){
    //Enter email
    cy.get('[placeholder="yourname@mail.com"]', {timeout: 10000}).type(users.reader.email);
    //Enter password
    cy.get('[type="password"]').type(users.reader.password);
    }else if(testUser == 'Alice'){
    //Enter email
    cy.get('[placeholder="yourname@mail.com"]', {timeout: 10000}).type(users.admin.email)
    //Enter password
    cy.get('[type="password"]').type(users.admin.password)
    }else if(testUser == 'Lisa'){
    //Enter email
    cy.get('[placeholder="yourname@mail.com"]', {timeout: 10000}).type(users.contributor.email)
    //Enter password
    cy.get('[type="password"]').type(users.contributor.password)
    }
  });
})

//Click on the login button 
Cypress.Commands.add('clickOnLoginBtn', () => {
  cy.get('[type="submit"]').click();
})


//Set viewpoint to Live
Cypress.Commands.add('setVpToLive', () => {
  //click on live  
  //cy.wait(3000);
  cy.get('Label[for="published"]').should('not.have.attr', 'disabled', { timeout: 10000 }).click({force:true})
  cy.wait(1500);
})

//Click on go to viewpoint overview button in the viewpoint editor
Cypress.Commands.add('clickOnViewpointOverviewBtn', () => {
  //click on button 
  cy.get('[type="button"]:contains("Go to viewpoints overview")').click();
})

//Only type in the search bar in Ardoq discover 
Cypress.Commands.add('searchInArdoqDiscover', componentName => {
  //type in search bar 
  cy.get('[id="downshift-0-input"]').type(componentName)
})

//Open in seach bar using keyboard
Cypress.Commands.add('pushEnterTwiceToOpenComponentAD', () => {
 let searchBar = '[id="downshift-0-input"]'
  cy.get(searchBar).type('{Enter}')
  // cy.get(searchBar).type('{Enter}')
})

//Delete vp using API 
Cypress.Commands.add('deleteAllViewpointsUsingApi', () => {
  let findIdValuesArray;
  cy.request('GET', '/api/viewpoint')
    .as('testNotshe')
    .then(testNotshe => {
      findIdValuesArray = testNotshe.body;
      if(findIdValuesArray.length>0){;
      
        cy.log('Clear all existing vps')
        cy.get('@testNotshe').its('body').its('0').its('_id').should('exist')

      //Delete all Viewpoints in the viewpoints overview page
      for (let index = 0; index < findIdValuesArray.length; index++) {
        cy.request(
          'DELETE',
          '/api/viewpoint/' + findIdValuesArray[index]['_id']
        );
    }
  }else{
    cy.log('No vp found');
  }
    });
})

//Verify results from search 
Cypress.Commands.add('verifyResultsFromSearch', resultText => {
  cy.get('[role="combobox"]').contains(resultText).should('be.visible');
});

//Verify recent changes 
Cypress.Commands.add('verifyRecentChanges', (recentChangesTextHeader, recentChangesTextDesc) => {
  cy.contains(recentChangesTextHeader).should('be.visible');
  cy.contains(recentChangesTextDesc).should('be.visible');

});

//Toggle  survey landing page 
Cypress.Commands.add('toggleSurveyLandingPage', ()=>{
  cy.contains('Enable survey landing page').click({force:true});
});

//Verify Survey landing page not displayed 
Cypress.Commands.add('verifyExistingEntriesDisplayed', (componentName, surveyHeader)=>{
  cy.contains(surveyHeader).should('be.visible');
  cy.contains(componentName).should('be.visible');
  cy.contains('Document a new Person').should('not.exist')
  cy.contains('Existing members').should('not.exist');
});

//Navigate to Survey overview page
Cypress.Commands.add('navigateToSurveyOverviewpage', ()=>{
  cy.visit('app/survey-admin')
});

Cypress.Commands.add('openSurveyBuilderForMySurvey', surveyName =>{
  cy.contains(surveyName, {timeout: 50000}).click();
});

Cypress.Commands.add('openResultDisplayOptionsSection', ()=>{
  //Open Result display options
  cy.contains('Result Display Options').click();
});

Cypress.Commands.add('saveSurveyOnly', ()=>{
  cy.get('button:Contains("Save changes")')
    .scrollIntoView()
    .contains('Save changes')
    .should('exist')
    .click();
});

Cypress.Commands.add('verifyLandingPageDisplayed', (landingPageBtn1, landingPageBtn2)=>{
  cy.contains(landingPageBtn1).should('be.visible');
  cy.contains(landingPageBtn2).should('be.visible');
  cy.contains('Person 2').should('not.exist')
});

Cypress.Commands.add('clearAllSurveys', ()=>{
  let findIdValuesArray;
  cy.request('GET', '/api/survey')
    .as('testNotshe')
    .then(testNotshe => {
      findIdValuesArray = testNotshe.body;
      if(findIdValuesArray.length>0){;
      
   
      cy.get('@testNotshe').its('body').its('0').its('_id').should('exist')
      
      //Delete all surveys 
      for (let index = 0; index < findIdValuesArray.length; index++) {
        cy.request(
          'DELETE',
          '/api/survey/' + findIdValuesArray[index]['_id']
        );
      }
    }else{
      cy.log('No surveys found');
    }
    });
});

//Navigate to Survey overview page
Cypress.Commands.add('navigateToHomePage', ()=>{
  cy.visit('/')
});

//Verify that you're logged into discover
Cypress.Commands.add('verifyDiscoverAppLogin', ()=>{
  cy.get('[href="/discover/"]').should('be.visible');
});

//Add user to viewpoint permissions
Cypress.Commands.add('addUserVpPermissions', userName =>{
  let addUserSearchField = '[data-click-id="manage-single-permissions-select-users"]';
  cy.get(addUserSearchField).type(userName)
  cy.wait(2000);
  cy.get(addUserSearchField).type('{Enter}', {force:true})
  cy.get(addUserSearchField).type('{Enter}', {force:true})
});

//Copy workspace from org  
Cypress.Commands.add('copyWorkspaceFromDiffOrg', id => {
  //Copy workspaces from different org ("Applications")
  cy.request({
    method: 'POST',
    url: 'https://sakshamsandbox.ardoq.com/api/workspace/copy',
    headers:{authorization: "Bearer " + Cypress.env('authSak'),
             'X-org': "sakshamsandbox"},
    body: {
      "target-org":"prodtest",
      "workspaces":[id]
    }
  }).then((response) => {
    expect(response.status).to.eq(201);
  })
});

//Fields in Discover for viewpoint
Cypress.Commands.add('verifyViewpointFieldsInDiscover', () => {
  //Check fields added to viewpoint
  cy.contains('Looks like there are no details. To change this, contact your Ardoq admin.').should('be.visible')
});

//Open AD Import page
Cypress.Commands.add('openADImporterPage', ()=>{
  //Mouse over home page icon in left menu panel
  cy.get('[data-click-id="app-main-sidebar-workspace-button', { timeout: 50000 }).should(
    'be.visible'
  );
  cy.get('[data-click-id="app-main-sidebar-workspace-button').trigger(
    'mouseover',
    { force: true },
    { cancelable: true }
  );
  // cy.get('.body').trigger('mouseover',{force: true})

  //Click Import and Integrations option
  cy.contains('Import & integrations').click();
  cy.get('[data-click-id="app-main-sidebar-workspace-button').trigger(
    'mouseout',
    { force: true }
  ); //Stop hovering over Home menu item

  //Click on the AD Importer button
  cy.get('h3:contains("Active Directory: People data")').click();
});

//Input Workspace name during AD Import 
Cypress.Commands.add('enterAdImportWsName', workspaceName =>{
  let homeWorkspaceSelectionElement = '[data-click-id="home-workspace-selection"]';
  cy.wait(2000)
  cy.get('#ardoqAppContainer').then(body => {
  
  //Sometimes the AD Importer will hang while loading on circle ci. 
  //which results in the AD TC's failing. The IF statement below should fix this. 
  if (body.find(homeWorkspaceSelectionElement, {timeout: 100000}).length > 0){
  cy.get(homeWorkspaceSelectionElement, {timeout: 80000}).find('input').first().should('be.visible').type(workspaceName + '{enter}')
}else{
  cy.reload()
  cy.get(homeWorkspaceSelectionElement, {timeout: 80000}).find('input').first().should('be.visible').type(workspaceName + '{enter}')
  }
  });
});

//Verify schedule interval
Cypress.Commands.add('verifyScheduleInterval', intervalOption =>{
  cy.get('[class="sheet-load_schedules_views__create-schedule-style"]:contains("'+intervalOption+'")').should('be.visible');
});

//Config AD Import schedule
Cypress.Commands.add('enterScheduleName', scheduleName =>{
  cy.get('[placeholder="Name of schedule"]').type(scheduleName)
});

//Toggle AD Pictures
Cypress.Commands.add('toggleAdPictures', ()=>{
  cy.contains('Import Profile Photos').click();
});

//Map fields for AD import
Cypress.Commands.add('mapAdFields', (id, emailAddress, firstName, lastName, jobTitle, preferredLanguage)=>{
  //Initally used '[type="text"]' which worked locally but kept failing on cypress. 
  //Will try use a different option '[id*="input"]'
  cy.get('[id*="input"]').eq(6).type(id + '{enter}', {force: true});
  cy.get('[id*="input"]').eq(7).scrollIntoView().type(emailAddress + '{enter}');
  cy.get('[id*="input"]').eq(8).type(firstName + '{enter}');
  cy.get('[id*="input"]').eq(9).type(lastName + '{enter}');
  cy.get('[id*="input"]').eq(10).type(jobTitle + '{enter}');
  cy.get('[id*="input"]').eq(11).type(preferredLanguage + '{enter}');
});

//Click on the test import button
Cypress.Commands.add('clickOnTestImport', ()=>{
  cy.get('button:contains("Test import")').scrollIntoView().click();
});

//Click on Import button 
Cypress.Commands.add('clickOnImportButton', ()=>{
  cy.intercept(Cypress.config().baseUrl + 'api/integrations/job').as('importedPeopleData');
  cy.get('button:contains("Schedule the import")', {timeout: 80000}).click();
  cy.wait('@importedPeopleData').its('response.statusCode').should('eq', 201);
});

//Select a specific component in your workspace on the left menu panel
// Cypress.Commands.add('findComponentInLongWsList', componentName =>{
//   // cy.get('[class="component-name component"]:contains("'+componentName+'")').scrollIntoView().click();
//   cy.get('[class="component-name component"]:contains("'+componentName+'")').each(($row)=>{
//     cy.wrap($row).find('[class="component-name component"]').click();
//   })
// });

//Verify that the ad pictures and fields have been imported
Cypress.Commands.add('verifyAdPicturesAndFields', (emailAddress, firstName, id, jobTitle, lastName) =>{
  cy.get('[data-label="Email_Address"]').should('be.visible');
  cy.get('[href="mailto:'+emailAddress+'"]').should('be.visible');
  cy.get('[data-label="First_Name"]').should('be.visible');
  cy.contains(firstName).should('be.visible');
  cy.get('[data-label="ID_Field"]').should('be.visible');
  cy.contains(id).should('be.visible');
  cy.get('[data-label="Job_Title"]').should('be.visible');
  cy.contains(jobTitle).should('be.visible');
  cy.get('[data-label="Last_Name"]').should('be.visible')
  cy.contains(lastName).should('be.visible');
});

Cypress.Commands.add('createReferenceAd', componentName =>{
  cy.contains(componentName, { timeout: 20000 }).rightclick();
  cy.get('[data-test-id="create-reference-item"]').click();
  cy.wait(2000);
  // cy.get('[data-test-id="create-reference-item"]').trigger('mouseout', {
  //   force: true,
  // });
  cy.contains('Christian Krebs').scrollIntoView();
  cy.contains('Christian Krebs').click();

  //Click on Create button for Create Reference
  cy.get('[data-click-id="sidebar-action-save-create"]', {timeout:20000}).click();
});

//Verify AD image has been imported
Cypress.Commands.add('verifyAdPictureImportedInDiscover', ()=>{
  cy.get('[data-testid="sidebar-content-wrapper"]:contains("Athina Moe")').should('be.visible');
});

//Delete all schedules 
Cypress.Commands.add('clearAllAdSchedules', ()=>{
  let findIdValuesArray;
  cy.request('GET', '/api/integrations/job/')
    .as('testNotshe')
    .then(testNotshe => {
      findIdValuesArray = testNotshe.body;
      if(findIdValuesArray.length>0){;
      
        cy.log('Clear all existing vps')
        cy.get('@testNotshe').its('body').its('0').its('_id').should('exist')

      //Delete all Viewpoints in the viewpoints overview page
      for (let index = 0; index < findIdValuesArray.length; index++) {
        cy.request(
          'DELETE',
          '/api/integrations/job/' + findIdValuesArray[index]['_id']
        );
    }
  }else{
    cy.log('No vp found');
  }
    });

})

//Click on Add All fields for viewpoints
Cypress.Commands.add('clickOnAddAllFieldsBtnVp', ()=>{
  cy.get('button:contains("Add all")').scrollIntoView().click()
});

//Verify hiearchy 
Cypress.Commands.add('verifyHierarchy', ()=>{
  cy.contains('Select from hierarchy:').should('be.visible');
  //Fix this at a later stage. Unique selector
  cy.contains('Notsh').should('be.visible');
  cy.contains('Person 1').should('be.visible');
  cy.contains('Person 2').should('be.visible');

});
//Clicking on default viewpoints option
Cypress.Commands.add('clickDefaultViewpointsOption', myViewPoint => {

  cy.visit('/app/viewpoints');
  cy.wait(3000)
  cy.get('[data-test-id="defaults-overview-button"]').click({ timeout: 8000 });
  cy.get('tbody > tr:nth-child(1) > td:nth-child(3)').within(() => {
    cy.get('button:contains("Relationship Overview")').should("be.enabled").click();
  });
  //cy.get('button:contains("Relationship Overview")').should("be.enabled").click();
  //Click on your viewpoint 
  cy.get('[data-intercom-target]:contains("'+myViewPoint+'")').click();


});

// Rediricts to Ardoq Discover
Cypress.Commands.add('visitDiscover', () => {

  cy.visit('/discover');
  
});

// Verify the default viewpoint is set to "First Viewpoint" in discover
Cypress.Commands.add('verifyDiscoverDV', viewpointName => {
  
  cy.wait(2000);
  cy.get('button:contains("' +viewpointName+ '")').should('be.visible');
  
});

// Verify that once the default viewpoint has been unpublished then Relationship Overview should be set as DV
Cypress.Commands.add('verifyUnpublishedDV', () => {
  
  cy.wait(2000);
  cy.get('button:contains("Relationship Overview")').should('be.visible');
  
});

// verify that the unpublished viewpoint is also selectable in Discover
Cypress.Commands.add('verifyUnpublishedViewpointIsPresent', () =>{
  cy.wait(2000);
  cy.get('button:contains("First Viewpoint")').click();
  cy.get('[data-intercom-target]:contains("Second Viewpoint")').click();
  cy.wait(2000)
  cy.get('button:contains("Second Viewpoint")').should('be.visible');

});

// Unpublishing the default viewpoint
Cypress.Commands.add('unpublishDV', () => {

  cy.visit('/app/viewpoints');
  cy.wait(2000);
 
  cy.contains('First Viewpoint').should('be.visible', { timeout: 10000 }).click();
  cy.get('label[for="published"]').click();
  cy.get('button:contains("Unpublish")').click();
  cy.get('[data-test-id="overview-button"]').click();
  cy.contains('Second Viewpoint').click();
  cy.get('label[for="published"]').click();
  cy.wait(2000);

});


// Verify that unpublished viewpoints are disabled for the component
Cypress.Commands.add('disabledViewpointsForComponents', () => {

  cy.visit('/app/viewpoints');
  cy.wait(3000);
  cy.get('[data-test-id="defaults-overview-button"]').click({timeout:8000});
  //cy.contains('Set default viewpoints').click();
  cy.contains("Relationship Overview").should('be.disabled');
})

//Advance filter for suveys
Cypress.Commands.add('clickOnAdvanceSearch', (filterName,filterCondition,filterTime) => {

  cy.contains('Workspace and Components').click();
  cy.get('[data-test-id="advanced-search-button"]').click();
  cy.get('[data-test-id="rule-row-wrapper"]').click();
  cy.get('[data-intercom-target="'+filterName+'"]').click();
  cy.get('[data-test-id="select-operator"]').click();
  cy.get('[data-intercom-target]:contains("'+filterCondition+'")').click();
  cy.get('[data-test-id="datepicker-input"]').click();
  cy.get('[data-intercom-target]:contains("'+filterTime+'")').click();
  cy.get('[data-test-id="component-preview-button"]').click();
  //cy.get('[class*="PreviewBlock"] label').should('contain.text','components found');
  //cy.get('[class*="PreviewBlock"] li').should('be.visible');

  cy.get('[data-test-id="next-button"]').click();

})

//Delete all viewpoints
Cypress.Commands.add('deletePreviousViewpoints', () => {

  cy.deleteAllViewpointsUsingApi()

})

//Viewpoints creation
Cypress.Commands.add('createViewpoints', (viewpointsName,viewpointsDescription, viewpointStyle, viewpointWorkspace, tripleCompSource, tripleReference, tripleCompTarget) => {

  //Navigate to the viewpoint editor 
  //Click on the Create new button 
  cy.openViewpointBuilder()
  cy.wait(3000);
  //Create a viewpoint using the Application workspace
  cy.enterVpNameAndDescription(viewpointsName, viewpointsDescription)
  cy.selectVpStyle(viewpointStyle);
  cy.selectVpWorkspace(viewpointWorkspace);
  cy.addTriple(tripleCompSource, tripleReference, tripleCompTarget);
  cy.get('#includeConnectedPeople').should('not.be.checked');
  cy.get('label[for="includeConnectedPeople"]').click();
  //Set max rep 
  cy.setMaxRep();
  //Save viewpoint 
  cy.clickOnSaveVp();
  cy.wait(4000);
  cy.setVpToLive();

});


//Delete All Viewpiont
Cypress.Commands.add('deleteAllViewpoint', ()=>{
  //Open viewpoint overview 
  cy.visit('/app/viewpoints');
  //Click on viewpoint dropdown 
  cy.get('div[class*="NameAndOptions"] > button').each(($el, index, $list) => {
   
    cy.wrap($el).click();
    cy.wait(2000);
    cy.get('div[data-intercom-target="Delete"]').click({ force: true });
    cy.get('button:Contains("Delete")').click();
    cy.wait(2000);
    })
  });


  //Sorting Test
  Cypress.Commands.add('sortName', (colName,colData)=>{
    cy.wait(3000)
    cy.get('thead > tr > th:nth-child(2)').contains(colName);
    //cy.contains(colName);
    cy.contains('arrow_upward').should("be.visible");
    cy.get('[data-test-id="name-row"]').eq(0).should('have.text',colData);
  
  });
  
  //Adding Response Feedback for Survey
  Cypress.Commands.add('addResponseFeedback', () =>{
    cy.contains('Response Feedback').click();
    cy.contains('On Survey Submit').click();
    cy.get('[class*="te-ww-container"]').type('Thank you for your response')
  
  });
  //Verifying if the feedback message is shown or not
  Cypress.Commands.add('checkResponseFeedback', () =>{
    cy.get('div[role="modal"] p').contains('Thank you for your response');
  
  });
  
  //Close of feedback box
  Cypress.Commands.add('closeResponseFeedback', () =>{
    cy.get('div[role="modal"] button').contains('Close').click();
  
  });
  
  //Toggle the notification switch on survey builder
  Cypress.Commands.add('toggleSurveyNotification', () =>{

    cy.get('label[for="surveyNotifications"]').click();
    //cy.get('[class*="SurveyEditorDetailsSection"] li').should('contain',"(me)");
    cy.contains('(me)')
  
  });
  
  //Addition of receiver emails for the survey
  Cypress.Commands.add('modifyReceiver', () =>{
    cy.get('[data-test-id="survey-digest-audience-button"]').click();
    cy.get('input[placeholder="Search users..."]').type('qa+writer2@ardoq.com');
    cy.get('tbody > tr > td:nth-child(1)').click();
    cy.get('div[role="modal"] button').contains('Add').click();
    //cy.get('[class*="SurveyEditorDetailsSection"] li:nth-child(2)').should('contain',"qa");
    cy.contains('qa+')
  });
  
  //Addition of survey on Discover
  Cypress.Commands.add('addSurveyToDiscover', () =>{
    cy.contains('Discover').click();
    cy.contains('Add survey to Discover').click();
    cy.get('input[placeholder="Create a specific call to action"]').type('Discover Survey');
  
  });
  
  //Filling of survey via discover app
  Cypress.Commands.add('fillingSurveyOnDiscover', () =>{
    cy.visit('/discover/');
    cy.get('#downshift-0-input').type('Person 1');
    cy.get('[data-test-id="clickable-result"]').click();
    cy.get('[data-test-id="open-component-button"]').click();
    cy.get('[data-test-id="other-surveys-dropdown"]').click();
    cy.get('[data-intercom-target="Discover Survey"]').click();
    cy.frameLoaded('[data-test-id="survey-iframe"]');
    cy.iframe('[data-test-id="survey-iframe"]').find('[data-test-id="text-input"]').eq(0).type(' + Discover');
    cy.iframe('[data-test-id="survey-iframe"]').find('[data-test-id="submit-button"]').click();
    cy.iframe('[data-test-id="survey-iframe"]').find('div[role="modal"] p').should('have.text','Thank you for your response');
  
  });
  
  //Selecting workspace in reference question
  Cypress.Commands.add('referenceWorkspaceSelection', (worskspaceName,componentName,referenceType) =>{
    cy.get('[data-test-id="workspace-select"]').click();
    cy.get('[data-intercom-target="'+worskspaceName+'"]').click();
    cy.get('[data-test-id="component-type-select"]').click();
    cy.get('[data-intercom-target="'+componentName+'"]').click();
    cy.get('[data-test-id="reference-type-select"]').click();
    cy.get('[data-intercom-target="'+referenceType+'"]').click();
    cy.contains('Allow respondents to create components').click();

  });

  //Adding field columns in survey
  Cypress.Commands.add('addFieldColumns', (selection_1,selection_2,selection_3,selection_4) =>{
    cy.get('[data-test-id="navigation-item"]').contains('Result Display Options').click();
    cy.get('[data-test-id="custom-fields-select"]').contains('expand_more').click();
    cy.get('[data-intercom-target="'+selection_1+'"]').click();
    cy.get('[data-intercom-target="'+selection_2+'"]').click();
    cy.get('[data-intercom-target="'+selection_3+'"]').click();
    cy.get('[data-intercom-target="'+selection_4+'"]').click();

  });

  Cypress.Commands.add('verifytFieldTypeAddition', () =>{

    cy.contains('div', 'Name?')
    .find('input')
    .first()
    .type('Automation Test');

    cy.contains('div', 'Age')
    .find('input')
    .first()
    .type('36');

    cy.get('[class*="ardoq-icon"] > use').click();

    cy.contains('div', 'Email?')
    .find('input')
    .first()
    .type('autotest@email.com');

    cy.get('[data-test-id="select"]').click();
    cy.get('[data-intercom-target="Option 2"]').click();
    cy.get('[data-test-id="async-creatable-select"]').click();
    cy.get('[data-intercom-target="Test 4"]').click();
    //cy.get('[data-test-id="async-creatable-select"]').click();
    cy.submitSurvey();
    cy.wait(3000);
    cy.openSurvey('Field Survey Test');
    cy.get('[data-test-id="existing-entries-button"]').click();
    cy.get('tbody > tr:nth-child(1) > td:nth-child(1)').should('have.text','Automation Test');
    cy.get('tbody > tr:nth-child(1) > td:nth-child(4)').should('have.text','Option 2');
    cy.get('tbody > tr:nth-child(1) > td:nth-child(5) > span > div > div > div > div > svg > use')
    .should('have.attr','xlink:href')
    .then(href => {expect(href.endsWith("checked")).to.be.true});
    cy.get('tbody > tr:nth-child(1) > td:nth-child(6)').should('have.text','36');
    cy.get('tbody > tr:nth-child(1) > td:nth-child(7)').should('have.text','autotest@email.com');


  });
  
  Cypress.Commands.add('surveyNextButton', () =>{
    cy.get('[data-test-id="next-button"]').click();
  });

//method to fill a basic survey
  Cypress.Commands.add('fillBasicSurvey', () =>{
    cy.get('[data-test-id="text-input"]').type('Person ' + todaysDate);
    cy.get('div[class="te-editor"]').type('Test to verify if survey works fine with Name & description field only');
    cy.get('[data-test-id="submit-button"]').click();
  });
  
  //Checking read only 
  Cypress.Commands.add('readonlyFieldSelection', () =>{
    cy.contains('Is this field read-only?').click();
  });

  Cypress.Commands.add('fillReadonlyReferenceSurvey', () =>{
    
    cy.get('[data-test-id="existing-entries-button"]').click();
    cy.get('th:nth-child(1)').click();
    cy.get('tbody > tr:nth-child(1) > td:nth-child(1)').click();
    cy.get('[data-test-id="collapse-button"]').click();
    cy.get('div[class="te-editor"]').type('Test to verify if reference is not deleted if it is readonly & able to edit reference');
    cy.get('[data-test-id="edit-reference-button"]').click();
    cy.get('div[role="modal"]').within(() => {
      cy.get('[data-test-id="async-select"]').click();
    })
    cy.get('[data-intercom-target="Reference thing 2"]').click();
    cy.contains('Done').click();
    cy.submitSurvey();
  });

    //Selecting workspace in reference question for read only reference question. A similar but separate method had to be
    // made as new component creation checkbox was not to be selected.
   Cypress.Commands.add('readonlyReferenceWs', (worskspaceName,componentName,referenceType) =>{
     cy.get('[data-test-id="workspace-select"]').click();
     cy.get('[data-intercom-target="'+worskspaceName+'"]').click();
     cy.get('[data-test-id="component-type-select"]').click();
     cy.get('[data-intercom-target="'+componentName+'"]').click();
     cy.get('[data-test-id="reference-type-select"]').click();
     cy.get('[data-intercom-target="'+referenceType+'"]').click();
  
  });

  // Validating if the reference is not deleted after submission of the survey which had read only reference question
  Cypress.Commands.add('verifyReferenceIsNotDeleted', () =>{

    cy.openSurvey('Readonly Reference Survey Test');
    cy.get('[data-test-id="existing-entries-button"]').click();
    cy.get('tbody > tr:nth-child(1) > td:nth-child(1)').click();
    cy.contains('Reference thing 2');
    cy.get('[data-test-id="collapse-button"]').should('contain', 'Reference thing 2')

});


//Copy workspace from org  
Cypress.Commands.add('copyMultipleWorkspaceFromDiffOrg', (workspaceID1,workspaceID2,workspaceID3,workspaceID4) => {
  //Copy workspaces from different org ("Applications")
  cy.request({
    method: 'POST',
    url: 'https://sakshamsandbox.ardoq.com/api/workspace/copy',
    headers:{authorization: "Bearer " + Cypress.env('authSak'),
             'X-org': "sakshamsandbox"},
    body: {
      "target-org":"prodtest",
      "workspaces":[workspaceID1,workspaceID2,workspaceID3,workspaceID4]
    }
  }).then((response) => {
    expect(response.status).to.eq(201);
  })
});


//Method to verify if conditional question section is displayed or not
Cypress.Commands.add('verifyConditionalQuestionSection', () =>{

  cy.get('[data-test-id="add-conditional-section-button"]').should('be.visible');


});

//Method to add conditional field question
Cypress.Commands.add('addConditionalFieldQuestion', (fieldQuestion,fieldSelect,questionText) =>{

  cy.get('[data-test-id="add-conditional-section-button"]').click();
  cy.get('[data-test-id="conditional-field-button"]').click();
  cy.get('[data-test-id="conditional-reference-select"]').click();
  cy.get('[data-intercom-target="'+fieldQuestion+'"]').click();
  cy.get('[data-test-id="conditional-reference-select"]').click();
  cy.xpath('(//div[@data-test-id="field-select"])[2]').click();
  cy.get('[data-intercom-target="'+fieldSelect+'"]').click();
  cy.xpath('(//div[@data-test-id="title-input"])[2]/div[2]').type(questionText)



});

//Method to add conditional reference question
Cypress.Commands.add('addConditionalReferenceQuestion', (referenceQuestion) =>{

  cy.get('[data-test-id="add-conditional-section-button"]').click();
  cy.get('[data-test-id="conditional-reference-button"]').click();
  cy.get('[data-test-id="conditional-reference-select"]').click();
  cy.get('[data-intercom-target="'+referenceQuestion+'"]').click();
  cy.get('[data-test-id="conditional-reference-select"]').click();
  cy.surveySection15_AddReferenceQuestionTitle("Conditional Reference question?");
  cy.referenceWorkspaceSelection("Employees WS","Technology","Expert In");


});


//Method to add check if conditional questions are shown in the survey app and if the submitted answers are displayed
// in the corresponding fields.
Cypress.Commands.add('verifyConditionalQuestionSubmission', () =>{

  cy.intercept('POST', Cypress.config().baseUrl + 'api/survey/**').as('post');
  cy.contains('div', 'Name?')
  .find('input')
  .first()
  .type('Automation Test');

  cy.contains('Checkbox field question?').should('be.visible');
  cy.get('[data-test-id="checkbox"]').click();
  cy.contains('checked condtional question?').should('be.visible')
  //cy.get('[data-test-id="collapse-button"]').should('have.text','Checkbox field question? - Checked');
  cy.get('[data-test-id="checkbox"]').click();
  cy.contains('unchecked condtional question?').should('be.visible')

  cy.contains('div', 'unchecked condtional question?')
  .find('input')
  .first()
  .type('unchecked checkbox answer');

  cy.get('[data-test-id="select"]').click();
  cy.get('[data-intercom-target="Option 1"]').click();
  cy.contains('Option 1 field question?').should('be.visible')

  cy.get('[data-test-id="select"]').click();
  cy.get('[data-intercom-target="Option 2"]').click();
  cy.contains('Option 2 field question?').should('be.visible')

  cy.get('[data-test-id="select"]').click();
  cy.get('[data-intercom-target="Option 3"]').click();
  cy.contains('Option 3 field question?').should('be.visible')

  cy.get('[data-test-id="select"]').click();
  cy.get('[data-intercom-target="Option 4"]').click();
  cy.get('[data-test-id="async-creatable-multiselect"]').click();
  cy.get('[data-intercom-target="Technology 1"]').click();
  cy.get('[data-test-id="async-creatable-multiselect"]').click();
  cy.submitSurvey();
  cy.wait('@post').its('response.statusCode').should('eq', 201);
  cy.wait(3000);
  cy.openSurvey('Conditional Survey Test');
  cy.get('[data-test-id="existing-entries-button"]').click();
  cy.get('tbody > tr:nth-child(1) > td:nth-child(1)').should('have.text','Automation Test');
  
  cy.get('tbody > tr:nth-child(1) > td:nth-child(4) > span > div > div > div > div > svg > use')
  .should('have.attr','xlink:href')
  .then(href => {expect(href.endsWith("unchecked")).to.be.true});
  cy.get('tbody > tr:nth-child(1) > td:nth-child(5)').should('have.text','Option 4');
  cy.get('tbody > tr:nth-child(1) > td:nth-child(7)').should('have.text','unchecked checkbox answer');


});




//Open a Workspace
Cypress.Commands.add('openADWorkspace', WorkspaceNameText => {
  //Navigate to home page
  cy.visit('/');
  //Search for workspace and open
  const searchField = cy
    .get('[data-click-id="type-to-filter"]', { timeout: 20000 })
    .should('be.visible');
  searchField.clear();
  searchField.type(WorkspaceNameText);
  cy.wait(2000);
  cy.get('[data-click-id="type-to-filter"]').then($search => {
    if ($search.val().includes(WorkspaceNameText)) {
      cy.log('found!!');
      cy.contains(WorkspaceNameText)
        .should('be.visible')
        .click();
    } else {
      cy.log('not found');

      let searchField2 = cy
        .get('.search-input > input', { timeout: 20000 })
        .should('be.visible');
      searchField2.clear();
      searchField2.type(WorkspaceNameText);
      cy.contains(WorkspaceNameText).click();
    }
  });

  

});

// Validation if resource center shows all the text & videos as per requirement

Cypress.Commands.add('checkResourceCenter', () => {

  cy.get('[data-test-id="help-icon-button"]').click();
  cy.contains('Resource Center').should('be.visible');
  cy.contains('Getting Started Guides').should('be.visible');
  cy.get('iframe[title="Intro to Discover"]').should('exist')
  cy.contains('Intro to Discover').should('be.visible');
  cy.get('iframe[title="How to Read & Update Information"]').should('exist');
  cy.contains('How to Read & Update Information').should('be.visible');
  cy.contains('How to Use Discover for Your Daily Tasks').should('be.visible');
  cy.contains('How Innovation Manager Drives Change in the Organization (2 min)').should('be.visible');
  cy.get('iframe[title="How Innovation Manager Drives Change in the Organization (2 min)"]').should('exist');
  cy.contains('How Chief Security Officer Finds the Point of Contact (3 min)').should('be.visible');
  cy.get('iframe[title="How Chief Security Officer Finds the Point of Contact (3 min)"]').should('exist');
  cy.contains('How Chief Security Officer Keeps Data Secure at All Time (5 min)').should('be.visible');
  cy.get('iframe[title="How Chief Security Officer Keeps Data Secure at All Time (5 min)"]').should('exist');
  cy.contains('Other resources').should('be.visible');
  cy.contains('Detail page navigation tips').should('be.visible');
  cy.contains('Reopen guide to Discover').should('be.visible');
  cy.contains('Help center').should('be.visible');
  
});

// Validation of videos & text inside the discover onboarding guide pop-up
Cypress.Commands.add('checkOtherResourceLinks', () => {

  cy.contains('Detail page navigation tips').click();
  cy.get('div[role="modal"]').within(() => {
    cy.contains('Navigation tips').should('be.visible');
    cy.contains('Tip 1/3: Preview component details by single-clicking').should('be.visible');
    cy.contains('Next').click();
    cy.contains('Tip 2/3: Re-center on a new component by double-clicking').should('be.visible');
    cy.contains('Next').click();
    cy.contains('Tip 3/3: Use the viewpoint dropdown to explore different perspectives on your context component').should('be.visible');
    cy.contains('Done').click();

  })

  cy.contains('Reopen guide to Discover').click();
  cy.get('div[role="modal"]').within(() => {
    cy.contains('Guide to Discover').should('be.visible');
    cy.contains('Video 1/3: Getting started').should('be.visible');
    cy.contains('Next').click();
    cy.contains('Video 2/3: Finding what you need').should('be.visible');
    cy.contains('Next').click();
    cy.contains('Video 3/3: How Chief Security Officer Finds a Point of Contact Easily').should('be.visible');
    cy.contains('Done').click();

  })
  cy.get('[data-test-id="help-icon-button"]').click();
  
});

// Edit & validate the changes done on the landing page
Cypress.Commands.add('configureDiscover', () => {

  cy.get('[data-test-id="configure-discover-button"]').click();
  // Logo & Theme section validation
  cy.contains('Configure Discover').should('be.visible');
  cy.get('[data-tab-id="logoAndThemes"]').should('have.text','Logo and theme');
  cy.contains("Add your organization's branding to help Discover users feel more at home.").should('be.visible');
  cy.contains("Select logo").should('be.visible');
  cy.contains('Default - Ardoq theme').should('be.visible');
  cy.contains('Select a color').should('be.visible');
  cy.contains('Company logo').click();
  cy.contains('Set a background image').should('be.visible');
  cy.contains('Select background image').should('be.visible');

  // Custom message section validation
  cy.get('button[data-tab-id="customMessage"]').should('have.text','Custom message').click();
  cy.contains("Help new users understand what this platform can help them with, what they can find here, or anything else you think it's important for them to know.").should('be.visible');
  cy.get('textarea[placeholder="Add message here..."]').clear().type('This is automation test ' + todaysDate);

  // Optimize content section validation
  cy.get('button[data-tab-id="pageContent"]').click();

  cy.contains("Toggle the recent changes on or off and enter custom links for your users.").should('be.visible');
  cy.contains("Recent updates in Ardoq").should('be.visible');
  cy.contains("Display recent changes").click();
  cy.contains("Add embedded links as Quick links").should('be.visible');
  cy.contains("Add Ardoq asset").should('be.visible');
  cy.contains("Add link").should('be.visible').click();
  cy.get('#quickAccess').invoke('attr', 'aria-checked').then((ariaChecked) => {
    if (ariaChecked === 'false') {
        cy.get('label[for="quickAccess"]').click();

      }
    else {
        cy.log('Switch is already ON');
      }
    })
  cy.contains("Title");
  cy.contains("Link");
  cy.get('input[value="Link Header"]').clear().type('Automated test link ' + todaysDate);
  cy.xpath("(//input[@id=':r3:'])[1]").type('https://www.finn.no/');

  //User support section validation

  cy.get('[data-tab-id="userSupport"]').should('have.text','User support').click();
  cy.contains("Add user support responsibilities");
  cy.get('textarea[placeholder="Add email addresses here"]').clear().type('qa@ardoq.com')
  cy.contains('Save').click();
  cy.wait(3000)

  // Landing page layout update validation

  cy.get('img[alt="organization logo"]').should('be.visible');
  cy.contains('Quick links').should('be.visible');
  cy.contains('Automated test link').should('be.visible');
  cy.contains('www.finn.no').should('be.visible');
  cy.contains("Recent changes").should('be.visible');
  cy.get('button[data-tooltip-text="Resource Center"]').click();
  cy.get('a[title="Contact user support"]').click();

  // Check if user support section is shown in resource center
  
  cy.contains("Contact user support").should('be.visible');
  cy.contains("qa@ardoq.com").should('be.visible');
  cy.contains('Close').click();
  cy.get('button[data-tooltip-text="Resource Center"]').click();

   // Undo the changes in the layout page so that for the next run validation runs correctly

  cy.contains('Configure Discover').click();
      
  // Logo & Theme section validation
  
  cy.xpath('(//div[normalize-space()="Default"])[1]').click();
  
   // Custom message section validation
  
  cy.get('button[data-tab-id="customMessage"]').should('have.text','Custom message').click();
  cy.get('textarea[placeholder="Add message here..."]').clear()
  
  // Optimize content section validation
  
  cy.get('button[data-tab-id="pageContent"]').click();
  cy.get('label[for="quickAccess"]').click();
  cy.get('button[data-tooltip-text="Remove question"]').click();

  //User support section validation
  
  cy.get('[data-tab-id="userSupport"]').click();
  cy.get('textarea[placeholder="Add email addresses here"]').clear()
  cy.contains('Save').click();

});

// Enforce max 2 references & checks allow multiple reference checkbox
Cypress.Commands.add('allowMultipleRef', () => {
  cy.get('div[data-test-id="max-input"] > :nth-child(2)').type(2);
  cy.contains('label', 'Allow multiple references to the same component')
  .parent()
  .next()
  .find('.ardoq-icon')
  .click();
  cy.get('[data-test-id="add-question-button"]').eq(0).click();
  cy.get('button[data-test-id="field-button"]').click();
  cy.get('div[data-test-id="field-select"]').click();
  cy.get('[data-intercom-target="Description"]').click();
  cy.get('div[data-test-id="title-input"] > :nth-child(2)').type('Description?')
});

// Create multiple reference to same component
Cypress.Commands.add('createMulipleRef', () => {
  cy.get('[data-test-id="create-component-button"]').click();
  cy.intercept('POST', Cypress.config().baseUrl + 'api/survey/**').as('post');
  cy.contains('div', 'Name?')
  .find('input')
  .first()
  .type('Automation Test');

  cy.contains('div', 'Age')
  .find('input')
  .first()
  .type('36');

  cy.get('[class*="ardoq-icon"] > use').click();

  cy.contains('div', 'Email?')
  .find('input')
  .first()
  .type('autotest@email.com');

  cy.get('[data-test-id="select"]').click();
  cy.get('[data-intercom-target="Option 2"]').click();
  cy.get('[data-test-id="async-creatable-select"]').click();
  cy.get('[data-intercom-target="Test 4"]').click();
  cy.get('[data-test-id="async-creatable-select"]').click();
  cy.get('[data-intercom-target="Test 4"]').click();
  cy.get('[data-test-id="collapse-button"]').should('have.length',2);
  cy.get('[data-test-id="async-creatable-select"] > div > div > div > div > :nth-child(1)').should('be.disabled');
  cy.submitSurvey();
  cy.wait('@post').its('response.statusCode').should('eq', 201);
});

Cypress.Commands.add('verifyPeopleSidebarIsOpenByDefault', () => {

  cy.get('[data-test-id="community-sidebar-button"]').should('be.visible').click();

})

Cypress.Commands.add('verifyPeopleSidebarText', () => {

  cy.get('[data-test-id="community-sidebar"]').within(() => {

    cy.contains("Richard Hendricks's direct contact");
    cy.contains("Tom Zaloga");
    cy.contains("Reports To");
    cy.contains("Richard Hendricks")
  })
})

Cypress.Commands.add('collapseSurveyQuestion', () =>{

  cy.get('[data-tooltip-text="Collapse"]').click();
})

Cypress.Commands.add('addSurveySubQuestion', () =>{

  cy.get('[data-test-id="add-question-button"]').eq(0).click();
  cy.get("[data-test-id='field-button']").click();
  cy.get('[data-test-id="field-select"]').click();
  cy.get('[data-intercom-target="Description"]').click();
})

Cypress.Commands.add('previewBroadcast', () =>{

  cy.get('[data-test-id="open-broadcast-preview-dialog"]').click();
  cy.get('div[role="modal"]').within(() => {

    cy.contains('Preview');
    cy.contains('To: qa@ardoq.com');
    cy.xpath('(//iframe)[1]').should('be.visible');
    cy.contains('Close').click();
  })
})