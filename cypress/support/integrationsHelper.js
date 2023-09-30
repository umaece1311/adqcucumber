import 'cypress-iframe';
import 'cypress-wait-until';
import 'cypress-file-upload';
import 'cypress-plugin-steps';
import 'cypress-time-marks';
import { recurse } from 'cypress-recurse';



//Navigate to integrations page and open excel importer
Cypress.Commands.add('OpenExcelUploadPage', () => {
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

  //Select Excel import option
  cy.contains('Excel')
    .should('be.visible')
    .click({ force: true });
});


//Navigate to integrations page and open the Import history page
Cypress.Commands.add('OpenImportHistoryPage', () => {
  //Mouse over home page icon in left menu panel
  // cy.get('div.atoms__SectionButton-jgHnNt.fyJaND', {timeout: 20000}).should("be.visible")
  cy.get(
    'div.atoms__SectionButton-jgHnNt.fyJaND',
    { timeout: 20000 },
    { force: true }
  ).trigger('mouseover');

  //Click Import and Integrations option
  cy.get(':nth-child(4) > .atoms__EllipsisSpan-faKKQH').click();
  cy.get(':nth-child(1) > .atoms__SectionButton-jgHnNt > svg').trigger(
    'mouseout',
    { force: true }
  ); //Stop hovering over Home menu item

  //Selec import history
  cy.get(
    '.sc-fzqPZZ > :nth-child(1) > :nth-child(2)',
    { timeout: 20000 },
    { force: true }
  )
    .should('be.visible')
    .click();
});

Cypress.Commands.add('NavigateToHomePage', () => {
  //cy.get('div.atoms__SectionButton-jgHnNt.fyJaND',{timeout:20000}, {force:true}).click()
  cy.get(
    ':nth-child(1) > :nth-child(1) > .atoms__SectionButton-jgHnNt',
    { timeout: 20000 },
    { force: true }
  ).click();
});

//Upload excel file
Cypress.Commands.add('UploadExcelFile', ExcelFile => {
  //Click on New Import
  cy.contains('New import').click();
  //Upload Excel file - Drag and drop
  cy.get('[data-testid="dropzone"]', { timeout: 20000 }).attachFile(ExcelFile, {
    subjectType: 'drag-n-drop',
  });
});



//Worksheet Selection for new Excel Importer
Cypress.Commands.add('MapFirstExcelWorksheet', () => {
  //cy.contains('Multi-roots, 1 level')
  cy.get('[data-click-id="sidebar-mapping-sheet"]', { timeout: 20000 }).eq(0)
    .should('be.visible')
    .click();
});

Cypress.Commands.add('MapSecondExcelWorksheet', () => {
  cy.get('[data-click-id="sidebar-mapping-sheet"]', { timeout: 20000 }).eq(1)
    .should('be.visible')
    .click();
});

Cypress.Commands.add('MapThirdExcelWorksheet', () => {
  cy.get('[data-click-id="sidebar-mapping-sheet"]', { timeout: 20000 }).eq(2)
    .should('be.visible')
    .click();
});

Cypress.Commands.add('MapFourthExcelWorksheet', () => {
  cy.get('[data-click-id="sidebar-mapping-sheet"]', { timeout: 20000 }).eq(3)
    .should('be.visible')
    .click();
});

Cypress.Commands.add('MapFifthExcelWorksheet', () => {
  cy.get('[data-click-id="sidebar-mapping-sheet"]', { timeout: 20000 }).eq(4)
  .should('be.visible')
  .click();
});


//Worksheet overview for Importers. Select 1-5 Worksheet
Cypress.Commands.add('MapWorksheet', sheetSelector => {
  cy.get(sheetSelector).should('be.visible').click();
 // cy.get('.sheet-load_css__whirler', { timeout: 150000 }).should('not.exist');
});

Cypress.Commands.add('MapSNOWWorksheet', (sheetSelector1, sheetSelector2) => {
  cy.get(sheetSelector1).eq(sheetSelector2).should('be.visible').click();
});

//Sidepanel worksheet overview after import. First workspace
Cypress.Commands.add('SelectFirstWorksheetSidePanelAfterImport', () => {
  cy.get('.validated', { timeout: 20000 }, { force: true })
    .should('be.visible')
    .click();
});

//Select first worksheet in side panel (ServiceNow)
Cypress.Commands.add('SelectFirstWorkSheetServiceNow', () => {
  cy.get('.unconfigured').should('be.visible').click();
});

//Sidepanel worksheet overview. Select 1-5 worksheet
Cypress.Commands.add('SelectFirstWorksheetSidePanel', () => {
  cy.wait(1000);
  cy.get('.sc-qPXtF > :nth-child(1)', { timeout: 20000 })
    .should('be.visible')
    .click({ force: true });
});

Cypress.Commands.add('SelectSecondWorksheetSidePanel', () => {
  cy.wait(1000);
  cy.get('.sc-qPXtF > :nth-child(2)', { timeout: 20000 })
    .should('be.visible')
    .click({ force: true });
});

Cypress.Commands.add('SelectThirdWorksheetSidePanel', () => {
  cy.wait(1000);
  cy.get('.sc-qPXtF > :nth-child(3)', { timeout: 20000 })
    .should('be.visible')
    .click();
});

Cypress.Commands.add('SelectFourthWorksheetSidePanel', () => {
  cy.wait(1000);
  cy.get('.sc-qPXtF > :nth-child(4)', { timeout: 20000 })
    .should('be.visible')
    .click();
});

Cypress.Commands.add('SelectFifthWorksheetSidePanel', () => {
  cy.wait(1000);
  cy.get('.sc-qPXtF > :nth-child(5)', { timeout: 20000 })
    .should('be.visible')
    .click();
});

//Select Component option in new Excel Importer
Cypress.Commands.add('SelectExcelComponentOption', () => {
  cy.wait(1000);
  cy.get('[data-click-id="sheet-mapping-type-select-components"]').click({ force: true });
});

//Select Reference option in new Excel Importer
Cypress.Commands.add('SelectExcelReferenceOption', () => {
  cy.get('[data-click-id="sheet-mapping-type-select-references"]').click({ force: true });
});


//Select Component Option
Cypress.Commands.add('SelectComponentOption', () => {
  cy.wait(1000);
  cy.get('[data-click-id="sheet-mapping-type-select-components"]').click({ force: true });
});

//Select Reference Option
Cypress.Commands.add('SelectReferenceOption', () => {
  cy.wait(1000);
  cy.get('[data-click-id="sheet-mapping-type-select-components"]').click();
});

Cypress.Commands.add('ClearMappingOption', () => {
  cy.get('.gteaWE > .sc-pReKu').should('be.visible').click();
});

Cypress.Commands.add('ClearValidWorksheetOption', () => {
  cy.get(':nth-child(3) > .sc-pReKu').should('be.visible').click();
});


//Enter the new Workspace name in new Excel Importer
Cypress.Commands.add('EnterWorkspaceName', excelWorkSpaceText => {
  cy.wait(1000);
  cy.get('[data-click-id="home-workspace-selection"]').should('be.visible').type(excelWorkSpaceText);
  });

//Enter the Source Workspace name in new Excel Importer
Cypress.Commands.add('ExcelSourceWorkspaceName', excelSourceWorkSpaceText => {
  cy.get('[data-click-id="home-workspace-selection"]').type(excelSourceWorkSpaceText);
  });

  //Enter the Target Workspace name in new Excel Importer
Cypress.Commands.add('ExcelTargetWorkspaceName', excelTargetWorkSpaceText => {
  cy.get('[data-click-id="goal-workspace-selection"]').should('be.visible').type(excelTargetWorkSpaceText);
  });

//Enter in workspace name when mapping a component Worksheet
Cypress.Commands.add('WorkspaceNameInput', workSpaceText => {
  const field = cy.get('.css-f3fgeq').should('be.visible');
  field.type(workSpaceText);
  //cy.get('#react-select-2-option-1').should("be.visible").click()

  //cy.wait(1000);
  // DO NOT RECOMMEND doing this
  //cy.get('body').then($body => {
    //synchronously query for element
    //if ($body.find('#react-select-4-option-1').length) {
      //cy.get('#react-select-4-option-1').should('be.visible').click();
    //} else if ($body.find('#react-select-3-option-1').length) {
      //cy.log('Used first option');
      //cy.get('#react-select-3-option-1').should('be.visible').click();
    //} else if ($body.find('#react-select-4-option-2').length) {
      //cy.log('Used second option');
      //cy.get('#react-select-4-option-2').should('be.visible').click();
    //} else if ($body.find('#react-select-5-option-1').length) {
      //cy.log('Used third option');
      //cy.get('#react-select-5-option-1').should('be.visible').click();
    //} else if ($body.find('#react-select-6-option-1').length) {
      //cy.log('Used fourth option');
      //cy.get('#react-select-6-option-1').should('be.visible').click();
    //} else if ($body.find('#react-select-6-option-2').length) {
      //cy.log('Used fifth option');
      //cy.get('#react-select-6-option-2').should('be.visible').click();
    //} else {
      //cy.log('Used sixth option');
      //cy.get('#react-select-9-option-1').should('be.visible').click();
    //}
 // });

  //return this;
});

Cypress.Commands.add('UpdateWorkspaceNameInput', workspaceText => {
  const field = cy.get('.css-f3fgeq').should('be.visible');
  field.type(workspaceText);

  // cy.get('#react-select-4-option-0-162').click()

  // DO NOT RECOMMEND doing this
  cy.get('body').then($body => {
    // synchronously query for element
    if ($body.find('#react-select-4-option-0-162').length) {
      cy.get('#react-select-4-option-0-162').click();
    } else {
      cy.log('Used second option');
      cy.get('#react-select-4-option-0-0').should('be.visible').click();
    }
  });

  return this;
});

Cypress.Commands.add('RefSourceWorkspaceInput', workspaceText => {
  const field = cy
    .get('.css-1nqn17w-control > .css-f3fgeq')
    .should('be.visible');
  field.type(workspaceText);
  //cy.get('#react-select-3-option-0-0').click()

  cy.get('body').then($body => {
    // synchronously query for element
    if ($body.find('#react-select-5-option-0-1').length) {
      cy.get('#react-select-5-option-0-1').click();
    } else {
      cy.log('Used second option');
      cy.get('#react-select-4-option-0-0').click();
    }
  });
});

Cypress.Commands.add('RefTargetWorkspaceInput', workspaceText => {
  const field = cy
    .get('.css-hb81fy-control > .css-f3fgeq')
    .should('be.visible');
  field.type(workspaceText);
  //cy.get('#react-select-4-option-0-0').click()

  cy.get('body').then($body => {
    // synchronously query for element
    if ($body.find('#react-select-6-option-0-0').length) {
      cy.get('#react-select-6-option-0-0').click();
    } else {
      cy.get('#react-select-5-option-0-0').click();
    }
  });
});


//Open column type drop down
Cypress.Commands.add('startMappingColumn', (childIndex1,childIndex2) => {
  cy.get(`:nth-child(${childIndex1}) > .column-configurator-wrapper > .column-config-opener-btn`).scrollIntoView().should('be.visible').click();
  cy.get(`:nth-child(${childIndex2}) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper`).should('be.visible').click();
});


//Set Column heading based on requirement
Cypress.Commands.add('SetColumnHeading', (index1,index2) => {
  cy.get(`:nth-child(${index1}) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(${index2})`).click();
  //cy.contains('.choice-label', columnmappinglabel).should('be.visible').click();
});


//Set Column 1 = Component type
Cypress.Commands.add('SetColumn1ToComponent', () => {
  cy.get(
    ':nth-child(2) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(4)'
  ).click();
});

//Set Column 1 = Reference Source
Cypress.Commands.add('SetColumn1ToRefSource', () => {
  cy.get(
    ':nth-child(2) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(4)'
  )
    .should('be.visible')
    .click();
});

//Change Column 1 Reference Format = Custom ID
Cypress.Commands.add('ChangeColumn1FormatToCustomID', () => {
  cy.get(
    ':nth-child(3) > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(3) > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(3)'
  )
    .should('be.visible')
    .click();
});

//Change Column 1 Reference Format = ArdoqID
Cypress.Commands.add('ChangeColumn1FormatToArdoqID', () => {
  cy.get(
    ':nth-child(3) > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(3) > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(3)'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(3) > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(2)'
  )
    .should('be.visible')
    .click();
});

//Set Column 1 = CustomID
Cypress.Commands.add('SetColumn1ToCustomID', () => {
  cy.get(
    ':nth-child(2) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(3)'
  )
    .should('be.visible')
    .click();
});

//Change Column 1 Custom ID Field Name
Cypress.Commands.add('ChangeCustomIDFieldNameForColumn1', CustomIDFieldName => {
  const FieldName = cy
    .get('.sheet-load_css__select-typeahead-input')
    .should('be.visible');
  FieldName.type(CustomIDFieldName);
  cy.get('.create-new > .choice-label').should('be.visible').click();
});

//Set Column 1 = Parent Component
Cypress.Commands.add('SetColumn1ToParentComponent', () => {
  cy.get(
    ':nth-child(2) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(7)'
  )
    .should('be.visible')
    .click();
});

//Set Column 1 = Field
Cypress.Commands.add('SetColumn1ToField', () => {
  cy.get(
    ':nth-child(2) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(6)',
    { timeout: 20000 }
  )
    .should('be.visible')
    .click();
});

//Set Column 1 = Description
Cypress.Commands.add('SetColumn1ToDescription', () => {
  cy.get(
    ':nth-child(2) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(9)'
  )
    .scrollIntoView()
    .should('be.visible')
    .click();
});

//Change column 1 field type to Checkbox
Cypress.Commands.add('ChangeFieldTypeToCheckboxColumn1', () => {
  cy.get(
    ':nth-child(2) > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper',
    { timeout: 20000 }
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(2) > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(7)',
    { timeout: 20000 }
  )
    .scrollIntoView()
    .should('be.visible')
    .click();
});

//Open column type drop down for Column 2
Cypress.Commands.add('StartMappingColumn2', () => {
  cy.get(
    ':nth-child(3) > .column-configurator-wrapper > .column-config-opener-btn'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(3) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper'
  )
    .should('be.visible')
    .click();
});

//Set Column 2 = Component
Cypress.Commands.add('SetColumn2ToComponent', () => {
  cy.get(
    ':nth-child(3) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(4)'
  )
    .should('be.visible')
    .click();
});

//Set Column 2 = CustomID
Cypress.Commands.add('SetColumn2ToCustomID', () => {
  cy.get(
    ':nth-child(3) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(3)'
  )
    .should('be.visible')
    .click();
});

//Set Column 2 = Reference Target
Cypress.Commands.add('SetColumn2ToRefTarget', () => {
  cy.get(
    ':nth-child(3) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(5)'
  )
    .should('be.visible')
    .click();
});

//Change Column 2 Reference Format = Custom ID
Cypress.Commands.add('ChangeColumn2FormatToCustomID', () => {
  cy.get(
    ':nth-child(3) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(3) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(3)'
  )
    .should('be.visible')
    .click();
});

//Change Column 2 Reference Format = ArdoqID
Cypress.Commands.add('ChangeColumn2FormatToArdoqID', () => {
  cy.get(
    ':nth-child(3) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(3) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(2)'
  )
    .should('be.visible')
    .click();
});

//Set column 2 to Parent Component
Cypress.Commands.add('SetColumn2ToParentComponent', () => {
  cy.get(
    ':nth-child(3) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(7)'
  )
    .should('be.visible')
    .click();
});

//Change the parent component format to Custom ID
Cypress.Commands.add('ChangeColumn2ParentFormatToCustomID', () => {
  cy.get(
    ':nth-child(3) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(3) > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(3)'
  )
    .should('be.visible')
    .click();
});

//Change the parent component format to Ardoq ID
Cypress.Commands.add('ChangeColumn2ParentFormatToArdoqID', () => {
  cy.get(
    ':nth-child(3) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(3) > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(3)'
  )
    .should('be.visible')
    .click();
});

//Set Column 2 = Type
Cypress.Commands.add('SetColumn2ToType', () => {
  cy.get(
    ':nth-child(3) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(5)'
  )
    .should('be.visible')
    .click();
});

//Set Column 2 = Field
Cypress.Commands.add('SetColumn2ToField', () => {
  cy.get(
    ':nth-child(3) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(6)'
  )
    .should('be.visible')
    .click();
});

//Change column 2 field type to Email
Cypress.Commands.add('ChangeFieldTypeToEmailColumn2', () => {
  cy.get(
    ':nth-child(3) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(2) > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper',
    { timeout: 20000 }
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(3) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(2) > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(6)',
    { timeout: 20000 }
  )
    .scrollIntoView()
    .should('be.visible')
    .click();
});

//Open column type drop down for Column 3
Cypress.Commands.add('StartMappingColumn3', () => {
  cy.get(
    ':nth-child(4) > .column-configurator-wrapper > .column-config-opener-btn'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(4) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper'
  )
    .should('be.visible')
    .click();
});

//Set Column 3 = Component
Cypress.Commands.add('SetColumn3ToComponent', () => {
  cy.get(
    ':nth-child(4) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(4)'
  )
    .should('be.visible')
    .click();
});

//Set Column 3 = Description
Cypress.Commands.add('SetColumn3ToDescription', () => {
  cy.get(
    ':nth-child(4) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(9)'
  )
    .scrollIntoView()
    .should('be.visible')
    .click();
});

//Set Column 3 = Field (Text)
Cypress.Commands.add('SetColumn3ToField', () => {
  cy.get(
    ':nth-child(4) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(6)'
  )
    .should('be.visible')
    .click();
});

//Set Column 3 = Type
Cypress.Commands.add('SetColumn3ToType', () => {
  cy.get(
    ':nth-child(4) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(5)'
  )
    .should('be.visible')
    .click();
});

//Set Column 3 = Custom ID
Cypress.Commands.add('SetColumn3ToCustomID', () => {
  //cy.get(':nth-child(4) > .column-configurator-wrapper > .column-config-opener-btn').should("be.visible").click()
  cy.get(
    ':nth-child(4) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(3)'
  )
    .should('be.visible')
    .click();
});

//Set Column 3 = Reference Type
Cypress.Commands.add('SetColumn3ToRefType', () => {
  cy.get(
    ':nth-child(4) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(7)'
  )
    .scrollIntoView()
    .should('be.visible')
    .click();
});

//Open the column type drop down for Column 4
Cypress.Commands.add('StartMappingColumn4', () => {
  cy.get(
    ':nth-child(5) > .column-configurator-wrapper > .column-config-opener-btn'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(5) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper'
  )
    .should('be.visible')
    .click();
});

//Set Column 4 = Component
Cypress.Commands.add('SetColumn4ToComponent', () => {
  cy.get(
    ':nth-child(5) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(4)'
  )
    .should('be.visible')
    .click();
});

//Set Column 4 = Custom ID
Cypress.Commands.add('SetColumn4ToCustomID', () => {
  cy.get(
    ':nth-child(5) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(3)'
  )
    .should('be.visible')
    .click();
});

//Change Column 4 Custom ID Field Name
Cypress.Commands.add('ChangeCustomIDFieldNameForColumn4', CustomIDFieldName => {
  const FieldName = cy
    .get(
      ':nth-child(5) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper > .sheet-load_css__select-input-wrapper > .sheet-load_css__select-typeahead-input-wrapper > .sheet-load_css__select-typeahead-input'
    )
    .should('be.visible');
  FieldName.type(CustomIDFieldName);
});

//Set Column 4 = Tags
Cypress.Commands.add('SetColumn4ToTags', () => {
  cy.get(
    ':nth-child(5) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(10)'
  ).scrollIntoView();

  cy.get(
    ':nth-child(5) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(10)'
  )
    .should('be.visible')
    .click();
});

//Set Column 4 = Field (Text)
Cypress.Commands.add('SetColumn4ToField', () => {
  cy.get(
    ':nth-child(5) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(6)'
  )
    .should('be.visible')
    .click();
});

//Set Column 4 = Type
Cypress.Commands.add('SetColumn4ToType', () => {
  cy.get(
    ':nth-child(5) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(5)'
  )
    .should('be.visible')
    .click();
});

//Change field type to List for Column 4
Cypress.Commands.add('ChangeColumn4FieldToList', () => {
  cy.get(
    ':nth-child(5) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(2) > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(2) > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(8)'
  )
    .scrollIntoView()
    .should('be.visible')
    .click();
});

//Change field type to Checkbox for Column 4
Cypress.Commands.add('ChangeColumn4FieldToCheckbox', () => {
  cy.get(
    ':nth-child(5) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(2) > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(5) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(2) > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(7)'
  )
    .scrollIntoView()
    .should('be.visible')
    .click();
});

//Set Column 4 = Reference Type
Cypress.Commands.add('SetColumn4ToRefType', () => {
  cy.get(
    ':nth-child(5) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(7)'
  )
    .should('be.visible')
    .click();
});

//Open column type drop-down for Column 5
Cypress.Commands.add('StartMappingColumn5', () => {
  cy.get(
    ':nth-child(6) > .column-configurator-wrapper > .column-config-opener-btn'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(6) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper'
  )
    .should('be.visible')
    .click();
});

//Set Column 5 = Field
Cypress.Commands.add('SetColumn5ToField', () => {
  cy.get(
    ':nth-child(6) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(6)'
  )
    .scrollIntoView()
    .should('be.visible')
    .click();
});

//Set Column 5 = Type
Cypress.Commands.add('SetColumn5ToType', () => {
  cy.get(
    ':nth-child(6) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(5)'
  )
    .scrollIntoView()
    .should('be.visible')
    .click();
});

//Set column 5 = Reference (Component mapping)
Cypress.Commands.add('SetColumn5ToReference', () => {
  cy.get(
    ':nth-child(6) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(8)'
  )
    .should('be.visible')
    .scrollIntoView()
    .click();
});

//Change Reference Workspace for Column 5
Cypress.Commands.add('ChangeReferenceWorkspaceForColumn5', () => {
  cy.get(
    ':nth-child(6) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(1) > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper > .sheet-load_css__select-input-wrapper > .sheet-load_css__select-typeahead-input-wrapper'
  )
    .scrollIntoView()
    .should('be.visible')
    .click({ force: true });

  cy.get(
    ':nth-child(6) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(1) > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > :nth-child(1) > .vars--1840662491'
  )
    .should('be.visible')
    .click();
});

Cypress.Commands.add('ChangeReferenceWorkspace', (ReferenceWorkspace) => {
  cy.contains('label', 'Target workspace').parent().find('.sheet-load_css__select-display-value').type(ReferenceWorkspace,{delay: 30});
});

//Change Reference Workspace for Column 5 (Regions = Alibaba)
Cypress.Commands.add('ChangeReferenceWorkspaceForColumn5Alibaba', () => {
  cy.get(
    ':nth-child(6) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(1) > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper > .sheet-load_css__select-input-wrapper > .sheet-load_css__select-typeahead-input-wrapper'
  )
    .scrollIntoView()
    .should('be.visible')
    .click({ force: true });

  cy.get(
    ':nth-child(6) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(1) > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > .vars--682055840'
  )
    .should('be.visible')
    .click();
});

//Change Reference format to Custom ID for Column 5
Cypress.Commands.add('ChangeReferenceFormatCustomIDColumn5', () => {
  cy.get(
    ':nth-child(3) > :nth-child(3) > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper > .sheet-load_css__select-input-wrapper > .sheet-load_css__select-display-value'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(3) > :nth-child(3) > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(3)',
    { timeout: 20000 }
  )
    .scrollIntoView()
    .click();
});

//Change Reference field name to Custom ID field name for Column 1
Cypress.Commands.add('ChangeReferenceFieldForColumn1', () => {
  cy.get(
    '.column-configurator > div > .sheet-load_css__select-outer-wrapper:nth-child(2) > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper',
    { timeout: 20000 }
  ).click();

  cy.get(
    '.sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > .vars--682055840',
    { timeout: 20000 }
  ).click();
});

// cy.get('div > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .vars-707784165 > .sheet-load_css__select-input-controls').click()
// cy.get('.sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > .vars--682055840').click()

//Change Reference field name to Custom ID field name for Column 2
Cypress.Commands.add('ChangeReferenceFieldForColumn2', () => {
  cy.get(
    '.sheet-cell:nth-child(3) > .column-configurator-wrapper > .column-configurator > div > .sheet-load_css__select-outer-wrapper:nth-child(2) > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper',
    { timeout: 20000 }
  ).click();

  cy.get(
    '.sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > .vars--682055840',
    { timeout: 20000 }
  ).click();
});

//Change Reference field name to Custom ID field name for Column 5
Cypress.Commands.add('ChangeReferenceFieldNameForColumn5', () => {
  cy.get(
    ':nth-child(3) > :nth-child(3) > :nth-child(2) > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper > .sheet-load_css__select-input-wrapper > .sheet-load_css__select-display-value'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(3) > :nth-child(3) > :nth-child(2) > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > :nth-child(1) > :nth-child(3)'
  )
    .scrollIntoView()
    .click();
});

//Change Column 5 Field Type
Cypress.Commands.add('ChangeColumn5FieldTypeToList', () => {
  cy.get(
    ':nth-child(6) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(2) > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(6) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(2) > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(8)'
  ).scrollIntoView();

  cy.get(
    ':nth-child(6) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(2) > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(8)'
  )
    .should('be.visible')
    .click();
});

//Change Column 5 Field name
Cypress.Commands.add('ChangeColumn5FieldName', fieldNameText => {
  const field = cy
    .get(
      ':nth-child(6) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(1) > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper > .sheet-load_css__select-input-wrapper > .sheet-load_css__select-typeahead-input-wrapper > .sheet-load_css__select-typeahead-input'
    )
    .should('be.visible');
  field.type(fieldNameText);
  field.type('{enter}');
});

//Open column type drop-down for Column 6
Cypress.Commands.add('StartMappingColumn6', () => {
  cy.get(
    ':nth-child(7) > .column-configurator-wrapper > .column-config-opener-btn'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(7) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper'
  )
    .should('be.visible')
    .click();
});

//Set column 6 = Reference (Component mapping)
Cypress.Commands.add('SetColumn6ToReference', () => {
  cy.get(
    ':nth-child(7) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(8)'
  )
    .should('be.visible')
    .scrollIntoView()
    .click();
});

//Set Column 6 = Field
Cypress.Commands.add('SetColumn6ToField', () => {
  cy.get(
    ':nth-child(7) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(6)'
  )
    .should('be.visible')
    .click();
});

//Set Column 6 = Description
Cypress.Commands.add('SetColumn6ToDescription', () => {
  cy.get(
    ':nth-child(7) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(9)'
  )
    .scrollIntoView()
    .should('be.visible')
    .click();
});

//Set Column 6 = Tags
Cypress.Commands.add('SetColumn6ToTags', () => {
  cy.get(
    ':nth-child(7) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(10)'
  )
    .scrollIntoView()
    .click();
});

//Change Column 6 Field Type
Cypress.Commands.add('ChangeColumn6FieldTypeToMultiList', () => {
  cy.get(
    ':nth-child(7) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(2) > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(7) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(2) > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(9)'
  ).scrollIntoView();

  cy.get(
    ':nth-child(7) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(2) > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(9)'
  )
    .should('be.visible')
    .click();
});

//Change the workspace for the Reference Component path Column 6
Cypress.Commands.add('ChangeReferenceWorkspaceForColumn6', () => {
  cy.get(
    ':nth-child(7) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(1) > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper > .sheet-load_css__select-input-wrapper > .sheet-load_css__select-display-value',
    { force: true }
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(7) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(1) > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > :nth-child(1) > .vars--682055840',
    { timeout: 20000 }
  )
    .should('be.visible')
    .click();
});

//Change Reference field name to Custom ID field name for Column 6
Cypress.Commands.add('ChangeReferenceFieldNameForColumn6', () => {
  cy.get(
    ':nth-child(7) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(3) > :nth-child(2) > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper > .sheet-load_css__select-input-wrapper > .sheet-load_css__select-display-value'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(7) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(3) > :nth-child(2) > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > :nth-child(1) > :nth-child(3)'
  )
    .scrollIntoView()
    .click();
});

//Change reference format to Custom ID for Column 6
Cypress.Commands.add('ChangeReferenceFormatCustomIDColumn6', () => {
  cy.get(
    ':nth-child(7) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(3) > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper > .sheet-load_css__select-input-wrapper > .sheet-load_css__select-display-value'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(7) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(3) > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(3)'
  )
    .should('be.visible')
    .click();
});

//Open the column drop down for Column 7
Cypress.Commands.add('StartMappingColumn7', () => {
  cy.get(
    ':nth-child(8) > .column-configurator-wrapper > .column-config-opener-btn'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(8) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper'
  )
    .should('be.visible')
    .click();
});

//Set Column 7 = Component
Cypress.Commands.add('SetColumn7ToComponent', () => {
  cy.get(
    ':nth-child(8) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(4)'
  )
    .should('be.visible')
    .click();
});

//Set Column 7 = Custom ID
Cypress.Commands.add('SetColumn7ToCustomID', () => {
  cy.get(
    ':nth-child(8) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(3)'
  )
    .should('be.visible')
    .click();
});

//Set Column 7 = Field
Cypress.Commands.add('SetColumn7ToField', () => {
  cy.get(
    ':nth-child(8) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(6)'
  )
    .should('be.visible')
    .click();
});

//Set Column 7 = Tags
Cypress.Commands.add('SetColumn7ToTags', () => {
  cy.get(
    ':nth-child(8) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(10)'
  )
    .scrollIntoView()
    .click();
});

//Set Column 7 = Description
Cypress.Commands.add('SetColumn7ToDescription', () => {
  cy.get(
    ':nth-child(8) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(9)'
  )
    .scrollIntoView()
    .click();
});

//Open column type dropdown for column 8
Cypress.Commands.add('StartMappingColumn8', () => {
  cy.get(
    ':nth-child(9) > .column-configurator-wrapper > .column-config-opener-btn'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(9) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper'
  )
    .should('be.visible')
    .click();
});

//Change the workspace for the Reference Component path Column 8
Cypress.Commands.add('ChangeReferenceWorkspaceForColumn8', () => {
  // cy.get(':nth-child(9) > .column-configurator-wrapper > .column-config-opener-btn', {timeout: 20000}, {force:true}).should('be.visible').click()

  cy.get(
    ':nth-child(9) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(1) > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper > .sheet-load_css__select-input-wrapper > .sheet-load_css__select-display-value',
    { force: true }
  ).click();

  cy.get(
    ':nth-child(9) > .column-configurator-wrapper > .column-configurator > :nth-child(3) > :nth-child(1) > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > :nth-child(1) > .vars--1840662491'
  )
    .should('be.visible')
    .click();
});

//Change the format for a Reference Column 8
Cypress.Commands.add('ChangeReferenceFormatForColumn8', () => {
  cy.get(
    ':nth-child(3) > :nth-child(3) > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper > .sheet-load_css__select-input-wrapper > .sheet-load_css__select-display-value',
    { force: true }
  ).click();
});

//Set column 8 = Reference (Component mapping)
Cypress.Commands.add('SetColumn8ToReference', () => {
  cy.get(
    ':nth-child(9) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(8)'
  )
    .should('be.visible')
    .scrollIntoView()
    .click();
});

//Set Column 8 = Component
Cypress.Commands.add('SetColumn8ToComponent', () => {
  cy.get(
    ':nth-child(9) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(4)'
  )
    .should('be.visible')
    .click();
});

//Set Column 8 = Field
Cypress.Commands.add('SetColumn8ToField', () => {
  cy.get(
    ':nth-child(9) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(6)'
  )
    .should('be.visible')
    .click();
});

Cypress.Commands.add('StartMappingColumn9', () => {
  cy.get(
    ':nth-child(10) > .column-configurator-wrapper > .column-config-opener-btn'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(10) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper'
  )
    .should('be.visible')
    .click();
});

//Set Column 9 to Custom ID
Cypress.Commands.add('SetColumn9ToCustomID', () => {
  cy.get(
    ':nth-child(10) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(3)'
  )
    .should('be.visible')
    .click();
});

//Set Column 9 = Tags
Cypress.Commands.add('SetColumn9ToTags', () => {
  cy.get(
    ':nth-child(10) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(10)'
  )
    .scrollIntoView()
    .should('be.visible')
    .click();
});

Cypress.Commands.add('SetColumn9ToReference', () => {
  cy.get(
    ':nth-child(10) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(8)'
  )
    .scrollIntoView()
    .click();
});

//Set column 9 to Type
Cypress.Commands.add('SetColumn9ToComponent', () => {
  cy.get(
    ':nth-child(10) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(4)'
  )
    .should('be.visible')
    .click();
});

//Start Mapping column 10
Cypress.Commands.add('StartMappingColumn10', () => {
  cy.get(
    ':nth-child(11) > .column-configurator-wrapper > .column-config-opener-btn'
  )
    .should('be.visible')
    .click();

  cy.get(
    ':nth-child(11) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-input-outer-wrapper'
  )
    .should('be.visible')
    .click();
});

//Set Column 10 to Type
Cypress.Commands.add('SetColumn10ToType', () => {
  cy.get(
    ':nth-child(11) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(5)'
  )
    .should('be.visible')
    .click();
});

//Set Column 10 = Component
Cypress.Commands.add('SetColumn10ToComponent', () => {
  cy.get(
    ':nth-child(11) > .column-configurator-wrapper > .column-configurator > form > .sheet-load_css__select-outer-wrapper > .sheet-load_css__select-wrapper > .sheet-load_css__select-list-wrapper > .sheet-load_css__select-list > .sheet-load_css__select-list-group > :nth-child(4)'
  )
    .should('be.visible')
    .click();
});

//Select the Test Configured Sheets button
Cypress.Commands.add('SelectTestConfgrdBtn', testConfigbtn => {
  cy.contains(testConfigbtn).click();
});


//Select the Test Import button (ServiceNow)
Cypress.Commands.add('SelectTestImportServiceNow', () => {
  cy.get('.apport-buttons > :nth-child(1)').should('be.visible').click();
});

//Create a Schedule
Cypress.Commands.add('CreateSchedule', (testSchedule,frequency) => {
  cy.contains('button','Create schedule').should('be.visible').click();
  cy.get('input:first').click().type(testSchedule,{delay: 30});
  cy.contains('Select...').type(frequency);
  cy.contains('Activate schedule').click();
});

Cypress.Commands.add('NavigateBackToIntegrations', () => {
  cy.contains('button','Back to integrations').click();
});

//Verify the Schedule created
Cypress.Commands.add('VerifySchedule', ScheduleName => {
  cy.contains('div', ScheduleName).should('be.visible');
});

//Edit the Schedule frequency
Cypress.Commands.add('EditScheduleFequency', (ScheduleName,Newfrequency,weeKday) => {
  cy.contains('div', ScheduleName).parent().siblings().last().click();
  cy.get('[data-intercom-target="Edit import schedule"]').should('be.visible').click();
  cy.get('[class*="textOverflow"]').click();
  cy.contains(Newfrequency).click();
  cy.get('[class*="textOverflow"]').eq(1).click();
  cy.contains(weeKday).click();
  cy.get('[role="modal"]').find('button').contains('Save changes').click();
});

//Rename the Schedule
Cypress.Commands.add('RenameSchedule', (ScheduleName, renamedSchedule) => {
  cy.contains('div', ScheduleName).parent().siblings().last().click();
  cy.get('[data-intercom-target="Rename"]').should('be.visible').click();
  cy.focused().clear().type(renamedSchedule).blur();
});

//Verify and delete schedule
Cypress.Commands.add('DeleteSchedule', ScheduleName => {
  cy.contains('div', ScheduleName).parent().siblings().last().click();
  cy.get('[data-intercom-target="Delete"]').should('be.visible').click();
  cy.get('[role="modal"]').find('button').contains('Delete').click();
});

//Load the schedule
Cypress.Commands.add('LoadSchedule', ScheduleName => {
  cy.contains('div', ScheduleName).parent().siblings().last().click();
  cy.get('[data-intercom-target="Edit import configuration"]').should('be.visible').click();
  cy.get('.sheet-load_stingray_overlay__waiting-content > :nth-child(1)', { timeout: 150000 }).should('not.exist');
});


//Check Test Summary
Cypress.Commands.add(
  'CheckTestSummary',
  (WorkspaceNameText, ComponentsText, FieldsCreatedText) => {
    const workspaceName = cy.get('.name').scrollIntoView();
    workspaceName.contains(WorkspaceNameText);

    const componentsCreated = cy
      .get('.sheet-load_apport_views__result-message-box-style > :nth-child(2)')
      .should('be.visible');
    componentsCreated.contains(ComponentsText);

    const fieldsCreated = cy
      .get('.sheet-load_apport_views__result-message-box-style > :nth-child(3)')
      .should('be.visible');
    fieldsCreated.contains(FieldsCreatedText);
  }
);

//Click on Import All button
Cypress.Commands.add('SelectImportAllBtn', () => {
  cy.contains('Import all', { timeout: 20000 }).should('be.visible').click().timeMark('ImportButtonClick');
  cy.timeSince('ImportButtonClick','time limit', 1000);
});

//Open the Excel Imported Workspace by discarding config save
 Cypress.Commands.add("OpenWorkspacesAfterImport", () => {
  cy.contains('button','Open workspace').click();
  cy.get('[role="modal"]').find('button').eq(0).click();
  cy.get('[data-click-id="workspace-selection-checkbox-all"]').click();
  cy.get('[role="modal"]').find('button').eq(1).click();
 })

 //Open the Excel Imported workspace
 Cypress.Commands.add("OpenWorkspacesAfterImportWithoutConfigSave", () => {
  cy.contains('button','Open workspace').click();
  cy.get('[data-click-id="workspace-selection-checkbox-all"]').click();
  cy.get('[role="modal"]').find('button').eq(1).click();
 })

//Open a Workspace
// Cypress.Commands.add("OpenWorkspace", (WorkspaceNameText) => {

//   const searchField = cy.get('[data-click-id="type-to-filter"]', {timeout: 20000}).should("be.visible")
//   searchField.clear()
//   searchField.type(WorkspaceNameText)

//   cy.get('.atoms__ClickableName-bpGwuJ').should("be.visible").click()
// })

//Fix at a later stage
//Open a Workspace
Cypress.Commands.add('OpenWorkspaces', WorkspacesToOpen => {
  cy.get('[data-click-id="app-main-sidebar-workspace-button').trigger('mouseover',{ force: true },{ cancelable: true });
  cy.contains('Open workspace').click();
  cy.get('[data-click-id="app-main-sidebar-workspace-button').trigger('mouseout',{ force: true });
  WorkspacesToOpen.forEach(wrkspace => {
  const searchField = cy.get('[data-click-id="type-to-filter"]', { timeout: 20000 });
  searchField.clear();
  searchField.type(wrkspace);
  });
  cy.get('[data-click-id="sort-assets-by-name"]').siblings().first().click();
  cy.contains('Open selected').click();
  
  
});

//Search for specific asset - should find a better way not to repeat this code
Cypress.Commands.add('SearchForAsset', AssetNameText => {
  cy.get('body').then($body => {
    // synchronously query for element
    if ($body.find('[data-click-id="type-to-filter"]').length) {
      const searchField = cy
        .get('[data-click-id="type-to-filter"]', { timeout: 20000 })
        .should('be.visible');
      searchField.clear();
      searchField.type(AssetNameText);
    } else {
      cy.get(':nth-child(1) > :nth-child(1) > .atoms__SectionButton-jgHnNt', {
        timeout: 20000,
      })
        .should('be.visible')
        .click();
      const searchField2 = cy
        .get('.search-input > input', { timeout: 20000 })
        .should('be.visible');
      searchField2.clear();
      searchField2.type(AssetNameText);
    }
  });

  return this;
});

//Close excel importer
Cypress.Commands.add('CloseImporter', () => {
  cy.get('.sheet-load_css__whirler', { timeout: 150000 }).should('not.exist');
  cy.contains('Close importer', { timeout: 20000 })
    .should('be.visible')
    .click();
});

//Click on the Import all button after a second Excel import
Cypress.Commands.add('ImportAllUpdate', () => {
  cy.get('.actions > .gNMvdj').should('be.visible').click();
});

//Open grid editor
Cypress.Commands.add('OpenGridEditor', () => {
  cy.get('#bottom-bar > :nth-child(1)').should('be.visible').click();
});

//Verfify the name of newly created workspace
//Cypress.Commands.add('VerifyWorkspaceName', (excelWorkSpaceText) => {
  //cy.get('[data-click-namespace="pages view workspace header"]',{timeout: 90000}).contains(excelWorkSpaceText).should('be.visible')
//});

//Verfify the name of newly created workspaces
Cypress.Commands.add('VerifyWorkspacesName', allWorkSpacesnames => {
  cy.get('.workspace-name').each((item, index, list) => {
    cy.wrap(item).should("contain.text", allWorkSpacesnames[index] )
  }); 

  cy.get('.Atoms__NavigatorItemCloseWorkspace-iIsuRD').should('be.visible').click({ multiple: true });
  
});

//Open block diagram
Cypress.Commands.add('OpenTheBlockDiagram', () => {
  cy.get('.jORcfv > .PaneNav-gwWYsp > .PaneNavTabs-iRqYlx > .ViewMoreMenu__Container-iecQfu > [type="button"]')
    .should('be.visible')
    .click();

  cy.get(
    '.jORcfv > .PaneNav-gwWYsp > .PaneNavTabs-iRqYlx > .ViewMoreMenu__Container-iecQfu > .dropdown-menu'
  )
    .should('be.visible')
    .click();

  cy.get(':nth-child(8) > .MediaHeader__MediaHeaderContainer-kWwDlN').scrollIntoView();
  cy.get(
    ':nth-child(8) > .MediaHeader__MediaHeaderContainer-kWwDlN > .MediaHeader__CheckboxContainer-kiDzZp > .MediaHeader__Checkbox-fWDNdW'
  )
    .should('be.visible')
    .click();

  cy.get('.drmuFf > .sc-fznMnq > .sc-fznzOf')
    .should('be.visible', { timeout: 20000 })
    .click({ force: true });
});

//Search for workspace in home page
Cypress.Commands.add('SearchForWorkspace', WorkspaceNameText => {
  cy.wait(3000);
  const searchField = cy
    .get('[data-click-id="type-to-filter"]', { timeout: 20000 })
    .should('be.visible');
  searchField.type(WorkspaceNameText);
});

//Click on the close importer button
Cypress.Commands.add('CloseImporterBtn', () => {
  cy.wait(2000);
  cy.get('.sheet-load_css__whirler', { timeout: 150000 }).should('not.exist');
  cy.get('.results > .sc-fzqKVi', { timeout: 20000 })
    .should('be.visible')
    .click();
});

//Delete Workspace
/*Cypress.Commands.add('DeleteWorkspace', () => {
  //cy.get(':nth-child(1) > .atoms__SectionButton-jgHnNt > svg').should("be.visible").click()

  cy.get('[data-click-id="app-main-sidebar-workspace-button"]').click();

  cy.get('[class*="EntityBrowserActionsMenu"]')
    .should('be.visible')
    .click();

  cy.get('[data-intercom-target="Delete"]').should('be.visible').click();

  cy.wait(1000)

  //Delete Field, enter "Yes" text
  cy.get('[role="modal"]').find('input')
    .should('be.visible')
    .type('YES');

  //Click Delete btn
  cy.get('[data-click-id="confirm-delete"]').should('be.visible').click();

  cy.wait(1000);
});*/

//Delete Workspaces after Excel Import
Cypress.Commands.add('DeleteWorkspaces', workSpacesToDelete => {

    workSpacesToDelete.forEach(wrkspace => {
      cy.get('[data-click-id="type-to-filter"]').click()
      .should('be.visible').clear()
      .type(wrkspace);
      cy.wait(1000);     
      cy.get('[data-click-id="asset-manager-name-click"]').rightclick();
      cy.get('[data-intercom-target="Delete"]').should('be.visible').click();
      cy.get('[role="modal"]').find('input').should('be.visible').type('YES');
      cy.get('[data-click-id="confirm-delete"]').should('be.visible').click();
     
         });
  });


//Create a new Config
Cypress.Commands.add('CreateConfig', newConfigName => {
  cy.contains('button', 'Save as').click();
  cy.get('[role="modal"]').find('input').clear().type(newConfigName);
  cy.get('[role="modal"]').contains('button', 'Save as').click();
});


//Save an edited Config
Cypress.Commands.add('SaveEditedConfig', newConfigName => {
  cy.contains('button', 'Save').click();
  cy.get('[role="modal"]').find('input').clear().type(newConfigName);
  cy.get('[role="modal"]').contains('button', 'Save').click();
});


//Select existing config in mapping screen
Cypress.Commands.add('ConfigDropDown', ConfigName => {
  cy.contains('button','Clear current selection').siblings().type(ConfigName);
});


//Select a config from Configuration overview page
Cypress.Commands.add('SelectingConfig', newConfigName => {
  cy.contains('span', newConfigName).click();
  });

  //Drag and Drop an Excel file for import
  Cypress.Commands.add('DragDropExcelFile', ExcelFile => {
  cy.get('.sheet-load_upload_upload__upload-drop-area-style', { timeout: 20000 }).attachFile(ExcelFile, {
    subjectType: 'drag-n-drop',
  });
  });

  //Verify that correct config is selected
  Cypress.Commands.add('VerifySelectedConfig', newConfigName => {
  cy.contains('button','Clear current selection').siblings().should('include.text',newConfigName);
  });


//Restart excel Import
Cypress.Commands.add('RestartImport', () => {
  cy.contains('button', 'Restart').click();
  cy.get('[role="modal"]').contains('button', 'Restart import').click();
});


//Verify Excel config created
Cypress.Commands.add('VerifyConfig', newConfigName => {
  cy.contains('span', newConfigName).should('be.visible');
});

//Load the SNOW Config
Cypress.Commands.add('LoadConfig', newConfigName => {
  cy.contains('td', newConfigName).siblings().last().click();
  cy.get('[data-intercom-target="Load configuration"]').should('be.visible').click();
  cy.get('[role="modal"]').contains('button', 'Load configuration').should('be.visible').click(); 
  cy.get('.sheet-load_stingray_overlay__waiting-content > :nth-child(1)', { timeout: 150000 }).should('not.exist'); 
});


//Copy the Excel config
Cypress.Commands.add('CopyConfig', newConfigName => {
  cy.contains('td', newConfigName).siblings().last().click();
  cy.get('[data-intercom-target="Make a copy"]').should('be.visible').click();
  cy.get('[role="modal"]').contains('button', 'Make a copy').click();  
});

//Rename the Excel config
Cypress.Commands.add('RenameConfig', (ConfigName, renamedConfig) => {
  cy.contains('td', ConfigName).siblings().last().click();
  cy.get('[data-intercom-target="Rename"]').should('be.visible').click();
  cy.focused().clear().type(renamedConfig).blur();
});

//Delete the Excel config
Cypress.Commands.add('DeleteConfig', ConfigName => {
  cy.contains('td', ConfigName).siblings().last().click();
  cy.get('[data-intercom-target="Delete"]').should('be.visible').click();
  cy.get('[role="modal"]').find('button').contains('Delete configuration').click();
});


//Navigate to integrations page and open SNOW importer
Cypress.Commands.add('OpenTheIntegration', IntegrationName => {
  //Mouse over home page icon in left menu panel
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

  //Select particular Integration option
  cy.contains('h3',IntegrationName).scrollIntoView().should('be.visible').click();
  });


//Navigate to Connections tab
Cypress.Commands.add('NavigateToConnections', () => {
  cy.get('[data-tab-id="connections"]').click();
  });

//Navigate to Configs tab
Cypress.Commands.add('NavigateToConfigs', () => {
  cy.get('[data-tab-id="configurations"]').click();
  });


//Click on create new connection
Cypress.Commands.add('ClickCreateNew', () => {
  cy.contains('Create new').click();
  });

//Enter in a ServiceNow connection Name
Cypress.Commands.add('InputConnectionName', (newConnection) => {
  cy.wait(2000);
  //const newConnection = Cypress.env('connectionName');
  cy.get('[placeholder="Give it a name"]').eq(0).type(newConnection,{delay: 50});
  
  //recurse(
    //() => cy.get('[placeholder="Give it a name"]').eq(0).type(newConnection),
    //($input) => $input.val() === newConnection,
    //{
      //log: true,
      //limit: 100, // max number of iterations
      //timeout: 100000
    //},
 // )
});

//Enter in a BaseUrl
Cypress.Commands.add('InputBaseUrl', () => {
  const baseUrlField = Cypress.env('baseUrl');
  cy.get('span[class*="base-url-value-input-style"]').find('input').type(baseUrlField,{delay: 50});
  /*recurse(
    () => cy.get('span[class*="base-url-value-input-style"]').find('input').clear().type(baseUrlField),
    ($input) => $input.val() === baseUrlField,
    {
      log: true,
      limit: 100, // max number of iterations
      timeout: 100000
    },
  )*/
});

//Enter SNOW Username
Cypress.Commands.add('InputSNOWUsername', () => {
  const snowUsername = Cypress.env('serviceNowID');
  cy.get('[placeholder="ServiceNow username"]').clear().type(snowUsername,{delay: 50});
  /*recurse(
    () => cy.get('[placeholder="ServiceNow username"]').clear().type(snowUsername),
    ($input) => $input.val() === snowUsername,
    {
      log: true,
      limit: 100, // max number of iterations
      timeout: 100000
    },
  )*/
});

//Enter SNOW Password
Cypress.Commands.add('InputSNOWPassword', () => {
  const snowPassword = Cypress.env('serviceNowPassword')
  cy.get('[placeholder="ServiceNow password"]').clear().type(snowPassword,{delay: 50})
  /*recurse(
    () => cy.get('[placeholder="ServiceNow password"]').clear().type(snowPassword,{delay: 50}),
    ($input) => $input.val() === snowPassword,
    {
      log: true,
      limit: 50, // max number of iterations
      timeout: 100000
    },
  ) */
});

//Save connection details
Cypress.Commands.add('ClickSaveBtn', () => {
  cy.get('[role="modal"]').find('button').eq(1).click();
});

//Save edited connection details
Cypress.Commands.add('ClickSaveEditBtn', () => {
  cy.get('.hdmAmq', { timeout: 20000 }).should('be.visible').click();
});

//Verify the duplicate connection error message
Cypress.Commands.add('DuplicationError', () => {
  cy.contains('A connection with specified name already exist').should('be.visible');
  cy.get('[role="modal"]').find('button').eq(0).click();
});

//Edit ServiceNow connection
Cypress.Commands.add('EditConnectionName', EditConnectionNameText => {
  //Look for load spinner
  cy.wait(1000);
  cy.get('.sc-qQMSE', { timeout: 150000 }).should('not.exist');
  const connectionNameField = cy
    .get(':nth-child(1) > .form-control', { timeout: 20000 })
    .should('be.visible');

  connectionNameField.clear();
  connectionNameField.type(EditConnectionNameText);
  return this;
});

 //Check for existing ServiceNow connection
 Cypress.Commands.add('VerifySNOWConnectionExists', function () {
  cy.wait(2000);
  cy.get('body').then($body => {
    if ($body.find(':nth-child(1) > .sheet-load_stingray_table_core__text-content').length) {
      cy.log('Found');
      cy.DeleteSNOWConnection();
    } else {
      cy.log('Not Found');
    }
  });
});

//Delete a SNOW Connection
Cypress.Commands.add('DeleteSNOWConnection', function () {
  cy.contains('td','AutomatedTests').siblings().last().find('button').click();
  cy.get('[data-intercom-target="Delete"]').should('be.visible').click();
  cy.get('[role="modal"]').find('button').contains('Delete connection').click();
});

//Click on edit SNOW Connection
Cypress.Commands.add('ClickEditSNOWConnection', function () {
  cy.contains('td','AutomatedTests').siblings().last().find('button').click();
  cy.get('[data-intercom-target="Edit"]').should('be.visible').click();

});

//Click on New Import and select an existing Connection
Cypress.Commands.add('StartNewImport',connectionName => {
  cy.contains('New import').click();
  cy.contains('span', 'Select connection').type(connectionName);
});


//Fetch table
Cypress.Commands.add('FetchTable', () => {
  // cy.get('.sc-qapaw > .sc-qYSYK > div > .sheet-load_ui__sidebar-collapser-style > .sheet-load_ui__sidebar-item-style-base:nth-child(3)').click()
  // cy.get('.sheet-load_utils_views_widgets__table-body-style > .sheet-load_utils_views_widgets__table-row-style > .search > .sheet-load_servicenow_views_overview__table-search-style > .sc-fzoOEf').click()
});

//Click on the Tables tab
Cypress.Commands.add('ClickTablesTab', () => {
  //Fix at a later stage
  cy.get('body').then($body => {
    // synchronously query for element
    if ($body.find('.vars-438175919 > :nth-child(3)').length) {
      //Wait for load spinner to disappear
      cy.get('.sc-pciEQ', { timeout: 150000 }).should('not.exist');
      //Click on the Table button once the loading spinner is gone
      cy.get(
        '.sheet-load_servicenow_views_connections__connection-style > .info'
      )
        .should('be.visible')
        .click({ force: true });
      cy.get('.vars-438175919 > :nth-child(3)').click();
    } else {
      //try refresh page and click on modify button if timeout is reached
      cy.reload();
      //Click on the Connection
      cy.get(
        '.sc-fzocqA > .sheet-load_servicenow_views_connections__connection-list-style > .sheet-load_utils_views_widgets__table-body-style > .sheet-load_servicenow_views_connections__connection-style > .info',
        { timeout: 20000 }
      )
        .should('be.visible')
        .click();
      //Click on the Tables tab
      cy.get('.vars-438175919 > :nth-child(3)').click();
    }
  });
});

Cypress.Commands.add('ClickOnTablesTabAfterFieldSelect', () => {
  cy.contains('Select tables', { timeout: 20000 }).should('be.visible').click();
});

//Search for Tables
Cypress.Commands.add('SearchForTable', TableNameText => {
  cy.wait(2000);
  cy.get('.sheet-load_css__whirler', { timeout: 150000 }).should('not.exist');
  const tableField = cy.get('[placeholder="Table ID or Name"]', { timeout: 20000 })
    .should('be.visible');
  tableField.clear();
  tableField.type(TableNameText);
});

//Select the business applications table from search result
Cypress.Commands.add('SelectTable', () => {
  cy.get(
    '.sheet-load_servicenow_views_overview__table-table-style > .sheet-load_utils_views_widgets__table-style > .sheet-load_utils_views_widgets__table-body-style > .sheet-load_servicenow_views_overview__table-item-style > .id',
    { timeout: 20000 }
  )
    .should('be.visible')
    .click();
});

//Select business app table
Cypress.Commands.add('SelectBusinessAppTable', () => {
  cy.get(':nth-child(2) > .id', { timeout: 20000 })
    .should('be.visible')
    .click();
});

//Try fix this at a later stage
Cypress.Commands.add('NavigateAndSelectSysUserTbl', TableNameResultText => {
  const tableField = cy
    //  .get('.sc-oTmZL', { timeout: 20000 })
    .get('[placeholder="Table ID or Name"]', { timeout: 20000 })
    .should('be.visible');
  tableField.clear();
  tableField.type(TableNameResultText);
  //Go to result page 4
  //cy.contains('button','4').click();
  //Select the Sys_User table
  cy.get(':nth-child(2) > .id').should('be.visible').click();

  

  // if ($body.find(TableNameResultText).length){
  //   cy.get('.sheet-load_utils_views_widgets__table-body-style').contains('div', TableNameResultText).click();
  // } else {
  //   cy.get('.sc-pJkiN > :nth-child(5)').click();
  //   cy.get('.sheet-load_utils_views_widgets__table-body-style').contains('div', TableNameResultText).click();
  // }

  // cy.get('body').then(($body) => {
  // if($body.find(TableNameResultText).length) {
  //   cy.get('.sheet-load_utils_views_widgets__table-body-style').contains('div', TableNameResultText).click();
  // }else {
  //   cy.log('Cant find the table')
  // }

  // })
});

//Search a table
Cypress.Commands.add('SearchTable', TableNameResultText => {
  cy.get('[placeholder="Table ID or Name"]', { timeout: 20000 })
    .should('be.visible');
  tableField.clear();
  tableField.type(TableNameText);
  
  //cy.get('.table-selector')
  

  cy.get('body').then(($body) => {
    // synchronously ask for the body's text
    // and do something based on whether it includes
    // another string
    if ($body.text().includes(TableNameResultText)) {
      // yup found it
      
    } else {
      // nope not here
    
    }
  })


});


//Add specific field from table
Cypress.Commands.add('AddField', FieldNameText => {
  //const fieldsNameBox = cy
    //.get('.search-input > input')
    //.should('be.visible');

  //cy.wait(3000);  
  //fieldsNameBox.clear();
  //fieldsNameBox.type(FieldNameText, { timeout: 20000 });

  //Select the specific field from the search results
  cy.get('.choices').contains('span', FieldNameText).click();
  //cy.get(':nth-child(1) > .choices').contains('span', FieldNameText).click();
});

Cypress.Commands.add('ClickFetchTableBtn', FtechtableText => {
  cy.contains('div',FtechtableText).scrollIntoView().click();
  cy.get('.sheet-load_stingray_overlay__waiting-content', { timeout: 150000 }).should('not.exist');
});

//Click on the close importer button
Cypress.Commands.add('CloseServiceNowImporter', () => {
  cy.wait(2000);
  cy.contains('Close importer', { timeout: 20000 })
    .should('be.visible')
    .click();
});

//Click on the Modify button
Cypress.Commands.add('ClickModifyBtn', () => {
  cy.get('.eDDRFQ').then($modifyBtn => {
    //There's a long "loading" time once you've selected the Save button when creating a ServiceNow connection
    cy.get('body').then($body => {
      // synchronously query for element
      if ($body.find('.sc-pciEQ').length) {
        //Wait for loading spinner to disappear
        cy.get('.sc-pciEQ', { timeout: 90000 }).should('not.exist');
        //Click on the Modify button once the loading spinner is gone
        $modifyBtn.trigger('click');
      } else {
        //try refresh page and click on modify button if timeout is reached
        //cy.reload();
        $modifyBtn.trigger('click');
      }
    });
  });
});


Cypress.Commands.add('OpenAlibabaPage', () => {
  //Mouse over home page icon in left menu panel
  cy.get('[data-click-id="app-main-sidebar-workspace-button', { timeout: 50000 }).should(
    'be.visible'
  );
  cy.get('[data-click-id="app-main-sidebar-workspace-button').trigger('mouseover',{ force: true }, { cancelable: true });
  // cy.get('.body').trigger('mouseover',{force: true})

  //Click Import and Integrations option
  cy.contains('Import & integrations').click();
  cy.get('[data-click-id="app-main-sidebar-workspace-button').trigger(
    'mouseout',
    { force: true }
  ); //Stop hovering over Home menu item

  //Select Excel import option
  cy.contains('Alibaba')
    .should('be.visible')
    .click({ force: true });
});

Cypress.Commands.add('AuthenticateAlibabaUser', function () {
  //Enter in Account name
  cy.get('[placeholder="Custom name to identify this account"]', {
    timeout: 20000,
  }).type(Cypress.env('alibabaAccountName'));

  //Select Auth Type
  cy.contains('Username/secret').click();

  //Enter username
  cy.get('[data-click-id="text-input-username"]').type(
    Cypress.env('alibabaUserName')
  );

  //Enter secret
  cy.get('[type="password"]').type(
    Cypress.env('alibabaSecret')
  );
});

Cypress.Commands.add('ClickAuthenticateBtn', function () {
  //Click on authenticate button
  cy.contains('Authenticate')
    .should('be.visible')
    .click();
});

/*Cypress.Commands.add('SelectApplicableRegion', function () {
  //Select applicable region drop-down
  cy.get('[data-click-id="select-auth-regions"]').should('be.visible').click();
  //Select CN-Zhangjiaku
  cy.get('body').then($body => {
    if ($body.find('#react-select-2-option-22').length) {
      cy.get('#react-select-2-option-22')
        .scrollIntoView()
        .should('be.visible')
        .click();
    } else {
      cy.log('Used second option');
      cy.get('#react-select-6-option-17')
        .scrollIntoView()
        .should('be.visible')
        .click();
    }

    
  //close the dropdown so that it doesn't cover the vpc drop-down below
  cy.contains('h2','Applicable regions').click();
});
  });*/


  Cypress.Commands.add('SelectApplicableRegion', RegionText => {
    //Select Applicable region
    cy.get('[data-click-id="select-auth-regions"]').type(RegionText);
    //close the dropdown so that it doesn't cover the vpc drop-down below
    cy.contains('h2','Applicable regions').click();
  });



  Cypress.Commands.add('SelectApplicableVPC', VPCText => {
    //wait for spinner to disappear
    cy.get('.sc-pciEQ', { timeout: 150000 }).should('not.exist');
    //Select Applicable VPC
    cy.get('[data-click-id="select-auth-vpcs"]').type(VPCText);
    //Close Vpc drop-down
    cy.contains('h2','Applicable regions').click();
  });
  

/*Cypress.Commands.add('SelectApplicableVPC', function () {
  //wait for spinner to disappear
  cy.get('.sc-pciEQ', { timeout: 150000 }).should('not.exist');
  //Select Applicable VPC drop-down
  cy.get('[data-click-id="select-auth-vpcs"]').should('be.visible').click();
  //Select Eirik's vpc
  cy.get('body').then($body => {
    if ($body.find('#react-select-3-option-0').length) {
      cy.get('#react-select-3-option-0')
        .scrollIntoView()
        .should('be.visible')
        .click();
    } else {
      cy.log('Used second option');
      cy.get('#react-select-7-option-0')
        .scrollIntoView()
        .should('be.visible')
        .click();
    }
  });
  //Close Vpc drop-down
  cy.contains('h2','Applicable regions').click();
});*/

Cypress.Commands.add('ClickRenameConnection', function () {
  //wait for Load spinner to complete
  cy.get('.sc-pciEQ', { timeout: 150000 }).should('not.exist');
  //Click on connection drop-down
  cy.get('div[class*="views_widgets__action-dropdown"]').click();
  //Click on the rename option
  cy.get('[data-intercom-target="Rename"]').click();
});

Cypress.Commands.add('EditAlibabaConnectionName', editAlibabaConnectionName => {
  //Edit connection name field
  const connectionNameField = cy.get('.sc-paXsP').should('be.visible');
  connectionNameField.clear();
  connectionNameField.type(editAlibabaConnectionName);
  //Save connection
  cy.get('.fEgpTh').should('exist').click();
});

Cypress.Commands.add('VerifyAlibabaConnectionExists', function () {
  //Check that an existsing alibaba connection exists
  cy.wait(2000);
  cy.get('body').then($body => {
    if ($body.find(':nth-child(2) > .name').length) {
      cy.log('Found');
      cy.ClickDeleteConnection();
    } else {
      cy.log('Not Found');
    }
  });
});

Cypress.Commands.add('SelectDataToImport', function () {
  //Select existing connection
  cy.get(':nth-child(2) > .name').should('be.visible').click();
  //Select regions
  cy.contains('span','Regions').parent().click();
  //Select VpcS
  cy.contains('span','VPCs').parent().click();
    cy.wait(1000);

  //Click Fetch data
  cy.contains('Fetch data').click();
});

//Select the Test import button in Alibaba import
Cypress.Commands.add('SelectTestImportBtn', function () {
  cy.contains('div','Test import').scrollIntoView().click({force: true});
});

Cypress.Commands.add('OpenAwsPage', () => {
  //Mouse over home page icon in left menu panel
  cy.get('[data-click-id="app-main-sidebar-workspace-button', { timeout: 50000 }).should(
    'be.visible'
  );
  cy.get('[data-click-id="app-main-sidebar-workspace-button').trigger('mouseover',{ force: true }, { cancelable: true });
  // cy.get('.body').trigger('mouseover',{force: true})

  //Click Import and Integrations option
  cy.contains('Import & integrations').click();
  cy.get('[data-click-id="app-main-sidebar-workspace-button').trigger(
    'mouseout',
    { force: true }
  ); //Stop hovering over Home menu item

  //Select AWS import option
  cy.contains('AWS')
    .should('be.visible')
    .click({ force: true });
});


//Create connection
Cypress.Commands.add('ClickOnCreateConnectionBtn', function () {
  //Click on the Create account
  cy.contains('Create account').should('be.visible').click();
});

//Auth Aws user
Cypress.Commands.add('AuthenticateAwsUser', function () {
  //Enter in Account name
  cy.get('[placeholder="Custom name to identify this account"]', {
    timeout: 20000,
  })
    .should('be.visible')
    .type(Cypress.env('awsAccountName'));
  //Select Authentication type
  cy.contains('Username/secret').click();
  //Enter in Username
  cy.get('[data-click-id="text-input-username"]')
  .type(Cypress.env('awsUsername'));
  //Enter in Secret
  cy.get('[type="password"]').should('be.visible')
  .type(Cypress.env('awsSecret'));
});

//Select Applicable region for Aws
Cypress.Commands.add('SelectApplicableRegionAws', function () {
  //Select Applicable region
  cy.get('[data-click-id="select-auth-regions"]').click();
  cy.get('#react-select-2-option-11')
    .scrollIntoView()
    .should('be.visible')
    .click();
  //close the dropdown so that it doesn't cover the vpc drop-down below
  cy.contains('h2','Applicable regions').click();
});

//Select Applicable vpc for Aws
Cypress.Commands.add('SelectApplicableVpcAws', function () {
  //Select Applicable Vpc
  cy.get('[data-click-id="select-auth-vpcs"]')
    .should('be.visible')
    .click();
  cy.get('#react-select-3-option-1').should('be.visible').click();
  //close the dropdown so that it doesn't cover the vpc drop-down below
  cy.contains('h2','Applicable regions').click();
});

//Click Save account btn for Aws
Cypress.Commands.add('ClickSaveAccountBtn', function () {
  //Select Save account button
  cy.contains('Save account').should('be.visible').click();
});

//Click Delete Connection
Cypress.Commands.add('ClickDeleteConnection', function () {
  //Click on the Aws connection drop-down
  cy.get('div[class*="views_widgets__action-dropdown"]').click();
  //Click on the Delete option
  cy.get('[data-intercom-target="Delete"]').should('be.visible').click();
  //Confirm delete
  cy.get('[role="modal"]').find('button').contains('Delete').click();
});

//Edit aws connection
Cypress.Commands.add('ClickRenameAwsConnection', function () {
  //wait for Load spinner to complete
  cy.get('.sc-pciEQ', { timeout: 150000 }).should('not.exist');
  //Click on alibaba connection drop-down
  cy.get('.IconButton__SpanWithProps-iFFsgX > .material-icons-round')
    .should('be.visible')
    .click();
  //Click on the rename option
  cy.get('[data-intercom-target="Rename"]').click();
});

Cypress.Commands.add('EditAwsConnectionName', editAwsConnectionName => {
  //Edit connection name field
  const connectionNameField = cy.get('.sc-prOVx').should('be.visible');
  connectionNameField.clear();
  connectionNameField.type(editAwsConnectionName);
  //Save connection
  cy.get('.dREgwo').should('exist').click();
});

Cypress.Commands.add('VerifyAwsConnectionExists', function () {
  //Check that an existsing alibaba connection exists
  cy.wait(2000);
  cy.get('body').then($body => {
    if ($body.find(':nth-child(2) > .name').length) {
      cy.log('Found');
      cy.ClickDeleteConnection();
    } else {
      cy.log('Not Found');
    }
  });
});

Cypress.Commands.add('SelectDataToImportAws', function () {
  //Select existing connection
  cy.get(':nth-child(2) > .name')
    .should('be.visible')
    .click();
  //Select regions
  cy.get(':nth-child(5) > .sc-qPwPv > .material-icons-round')
    .should('be.visible')
    .click();
  //Select Vpc
  cy.get(':nth-child(7) > .sc-qPwPv > .material-icons-round')
    .should('be.visible')
    .click();
  //Click Fetch data
  cy.contains('Fetch data').should('be.visible').click();
});

Cypress.Commands.add('OpenAzurePage', () => {
  //Mouse over home page icon in left menu panel
  cy.get('[data-click-id="app-main-sidebar-workspace-button', { timeout: 50000 }).should(
    'be.visible'
  );
  cy.get('[data-click-id="app-main-sidebar-workspace-button').trigger('mouseover',{ force: true }, { cancelable: true });
  // cy.get('.body').trigger('mouseover',{force: true})

  //Click Import and Integrations option
  cy.contains('Import & integrations').click();
  cy.get('[data-click-id="app-main-sidebar-workspace-button').trigger(
    'mouseout',
    { force: true }
  ); //Stop hovering over Home menu item

  //Select Excel import option
  cy.contains('Azure')
    .should('be.visible')
    .click({ force: true });
});

Cypress.Commands.add('AuthenticateAzureUser', function () {
  //Enter in Account name
  cy.get('[placeholder="Custom name to identify this account"]', {
    timeout: 20000,
  }).type(Cypress.env('AzureUser'));

  //Enter TenantID
  cy.get('[data-click-id="text-input-tenant-id"]').type(
    Cypress.env('AzureTenantID')
  );

  //Select Auth Type
  cy.contains('Username/secret').click().click();

  //Enter APP ID
  cy.get('[data-click-id="text-input-app-id"]').type(
    Cypress.env('AzureAppID')
  );

  //Enter Azure Secret
  cy.get('[type="password"]', { timeout: 20000 }).type(
    Cypress.env('AzureSecret')
  );
});

Cypress.Commands.add('SelectApplicableRegionAzure', function () {
  //Select applicable region drop-down
  cy.get('[data-click-id="select-auth-regions"]',{ timeout: 20000 })
    .scrollIntoView()
    .should('be.visible')
    .click();
  //Select WestEurope
  cy.contains('westeurope', { timeout: 20000 }).scrollIntoView().click();

  //close the dropdown so that it doesn't cover the vpc drop-down below
  cy.contains('h2','Applicable regions').click();
});

Cypress.Commands.add('SelectResourceGroupsAzure', function () {
  //wait for spinner to disappear
  // cy.get('.sc-pJkiN', { timeout: 150000 }).should('not.exist');
  //Select Applicable Resource Groups
  cy.get('[data-click-id="select-auth-resource-groups"]')
    .scrollIntoView()
    .should('be.visible')
    .click();
  //Select Ardoq test backup
  cy.contains('adq_integrations_rg', { timeout: 20000 }).scrollIntoView().click();
  //Close Vpc drop-down
  cy.contains('h2','Applicable regions').click();
});


Cypress.Commands.add('SelectAzureImportData', function () {
  cy.contains('span','Locations').prev().click({ force: true });
    cy.wait(1000);

  //Click Fetch data
  cy.contains('Fetch data').click();
});

Cypress.Commands.add('VerifyAzureConnectionExists', function () {
  //Check that an existsing alibaba connection exists
  cy.wait(2000);
  cy.get('body').then($body => {
    if ($body.find(':nth-child(2) > .name').length) {
      cy.log('Found');
      cy.ClickDeleteConnection();
    } else {
      cy.log('Not Found');
    }
  });
});


Cypress.Commands.add('EditConnectionName', editedConnectionName => {
  //Edit connection name field
  const connectionNameField = cy.get('[role="modal"]').find('input').should('be.visible');
  connectionNameField.clear();
  connectionNameField.type(editedConnectionName);
  //Save connection
  cy.contains('button','Rename').click();
});
