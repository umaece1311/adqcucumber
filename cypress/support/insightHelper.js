import "cypress-real-events";

//Result: Checked if element is found; if not, performs an action that creates it in the DOM
//Parameters: 1. Element to find, 2. Operator (less than, more than, equals) How many elements to expect in the DOM, 3. Selector which is used to create the element in the DOM
Cypress.Commands.add('findElementInBody', (element, operator, numberOfElements, selector) => {
  cy.get('body')
    .then(($body) => {
      if (operator === 'less than') {
        if($body.find(element).length < numberOfElements) {
          cy.log("Did not find less than " + numberOfElements + ' of ' + element + ". Performing action ... ");
          cy.get(selector)
            .click();
        }
      } else if (operator === 'more than') {
        if($body.find(element).length > numberOfElements) {
          cy.log("Did not find more than " + numberOfElements + ' of ' + element + ". Performing action ... ");
          cy.get(selector)
            .click();
        }
      } else if (operator === 'equals') {
        if($body.find(element).length == numberOfElements) {
          cy.log("Did not find exactly " + numberOfElements + ' of ' + element + ". Performing action ... ");
          cy.get(selector)
            .click();
        }
      }
    
    cy.get(element)
      .should('be.visible')
      .and('have.length', numberOfElements);
    
    cy.log(numberOfElements + ' of ' + element + " found.")
    });
});

//Result: Open a Workspace from the Home page
//Parameter: the string for your test Workspace name
Cypress.Commands.add('OpenWorkspaceFromHome', TestWorkspaceName => {
  //Go to Ardoq Home of the Organization
  cy.get('[data-click-id="app-main-sidebar-workspace-button"]')
    .click()
    .trigger('mouseout');

  cy.url().should('eq', Cypress.config().baseUrl + 'app/home');

  //Clear all quick filters
  //Filter Workspaces
  cy.get('[data-click-id="clear-filters-chip"]')
    .click();
  cy.get('[data-click-id="filter-workspaces-chip"]')
    .click();

    //Input the Workspace name into the search text input
    const searchField = cy
      .get('[data-click-id="type-to-filter"]', { timeout: 20000 })
      .should('be.visible');
    searchField.clear();
    searchField.type(TestWorkspaceName);

    //Finds one or more items in the search results
    //Click the first result with the searched Workspace name
    cy.get('div[class*= atoms__ClickableName]').as('result')
      .should('be.visible');
    cy.get('@result')
      .contains(TestWorkspaceName)
      .first()
      .click();

    cy.get('#globalPaneLoader')
      .should('not.contain', "Loading " + TestWorkspaceName, {timeout: 9000});
    cy.wait(1500); //The Workspace needs time to load

    //Assert that the Workspace is open
    cy.get('body').should('contain' ,TestWorkspaceName);
  });

//Result: Open a single View
//Note: You need to save your workspaceID into a variable beforehand
//Parameters: 1. "URL" or blank: types in the URL, "Ribbon": selects from More Views 2. the viewId as shown in the URL, following after .../app/view/
Cypress.Commands.add('OpenView', (viewId, option) => {
  cy.url()
      .then(($currentUrl) => {
        if ($currentUrl.includes(`/${'app/view/' + viewId}`)) {
          cy.log("You are already in " + $currentUrl + ". No extra action will be performed. Continuing...");

        } else {
          cy.log("You are in " + $currentUrl + ". This is NOT correct. Opening...");
          if (option == "URL" || option == undefined) {
            cy.visit(`/${'app/view/' + viewId + '/workspace/'+ Cypress.env('testWorkspaceId') }`);
            cy.get('[data-test-id="MAIN_PANE_LEFT"]', {timeout: 8000})
              .should('be.visible', {timeout: 8000});
          } else
          if (option == "Ribbon") {
            //Enable the dropdown with More Views
            cy.get('[data-click-namespace="left visualization tabs"] button:contains("More")')
              .click();
            cy.get('div[tabindex] [data-click-namespace="left visualization tabs"]')
              .should('be.visible');

            //Click on the specified View
            cy.get('[data-click-id*=' + viewId + ']')
              .should('be.visible')
              .click({force:true}); //In case we are clicking behind the dropdown, in the ribbon itself

            cy.get('[tabindex=1]')
              .realClick(); //Turn off the dropdown
            cy.get('div[tabindex] [data-click-namespace="left visualization tabs"]')
              .should('not.exist');
          }
        }
      });

  //Assert result
  cy.location('pathname').should('contain', `/${'app/view/' + viewId }`);
});

//Result: Best Practices page is open via icon in the left-hand navigation bar
Cypress.Commands.add('goToBPM_fromHome', () => {
    cy.get('[data-click-id="app-main-sidebar-best-practice-modules-button"]')
        .click()
        .trigger('mouseout');    
});

//Result: Best Practices page is open via URL
Cypress.Commands.add('goToBPM_fromURL', () => {
    cy.get('[data-click-id="app-main-sidebar-workspace-button"]')
                .click()
                .trigger('mouseout');
                cy.location('pathname').should('eq', `/${'app/home'}`);

            cy.visit('app/best-practices');
});

//Result: Test data is imported
//Parameters: filename for the Excel import file, name(s) of the Workspace(s) to be verified after import
Cypress.Commands.add('importTestData', (importTemplateName, TestWorkspaceName) => {

  //Open Excel Importer
  cy.get('[data-click-id="app-main-sidebar-workspace-button"]').as('HomeNavIcon')
    .should('be.visible');

  cy.get('@HomeNavIcon').trigger('mouseover');

  //Click Import and Integrations option
  cy.contains('Import & integrations')
    .click();
  cy.get('@HomeNavIcon')
    .trigger('mouseout'); //Stop hovering over Home menu item

  //Select Excel import option
  cy.contains('Excel')
    .should('be.visible')
    .click();

  cy.contains('New Import')
    .should('be.enabled')
    .click();
  
  //Upload Excel file - Drag and drop
  cy.get('.sheet-load_uploadnext_upload__upload-drop-area-style', {timeout: 20000})
    .attachFile(importTemplateName, {subjectType: 'drag-n-drop'});

  //Import the Excel file with the appropriate import configuration/mapping
  cy.contains('Choose configuration', {timeout: 40000})
    .click();
  cy.get('[id="react-select-2-listbox"]', {force:true})
    .within(() => {
      // ends the current chain and yields null
      cy.contains(importTemplateName).click();
    })
  
  cy.contains('Test configured sheets')
    .click();
  cy.contains('You can make changes to your configurations in the worksheet details below.')
    .should('be.visible');

  cy.contains('Import all')
    .click();
  
  cy.get('body')
    .should('contain', "Your import is complete!");

  //Confirm that the necessary Workspaces exist
  cy.get('@HomeNavIcon')
    .click()
    .trigger('mouseout');
  
  cy.get('[data-click-id="clear-filters-chip"]')
    .click();

  cy.get('[data-click-id="filter-workspaces-chip"]')
    .click();
  
  cy.get('[data-intercom-target="workspaces browser"]')
    .within(() => {
      TestWorkspaceName.forEach(TestWorkspace => {
        cy.contains(TestWorkspace)
          .should('be.visible');
      });
    });
});

//Result: View Modifier 'Show Connected' is verified as clickable, showing popover
Cypress.Commands.add('ViewModifiers_ShowConnected', () => {
  cy.get('[data-click-id="showOnlyConnectedComponents"]').as('ShowConnectedButton')
    .should('not.have.css', 'background-color', "rgb(46, 55, 66)") //Button should show that it's switched OFF
    .trigger('mouseover')
    .should('have.attr', 'data-tooltip-text', "Show only connected components");
  cy.get('#appContentContainer > div:nth-child(3) > div:nth-child(2)')
    .contains("Show only connected components");
  cy.get('@ShowConnectedButton')
    .trigger('mouseout') //stop hovering;
  cy.get('@ShowConnectedButton')
    .click() //turn ON
    .should('have.css', 'background-color', "rgb(46, 55, 66)"); //Button should show that it's switched ON
  cy.get('@ShowConnectedButton')
    .click() //turn OFF
    .should('not.have.css', 'background-color', "rgb(46, 55, 66)"); //Button should show that it's switched OFF
});

//Result: View Modifier 'Expand All' is verified as clickable, showing popover
//Parameter: 1. Disabled or [default] Enabled, 2. Action: Expand or Collapse, 3. Name of the View where the modifier is checked, typed as shown in the URL, following after .../app/view/
Cypress.Commands.add('ViewModifiers_ExpandCollapseAll', (groupState, action, viewName) => {
  //Init the variables
  let tooltipSelector; let tooltipInnerText; let popoverText; let cssExpectation;

  //Check button active state
  //Check button popover and text
  if (action == "Expand") {
    if (viewName == 'componenttree') {
      cy.get('[data-click-id="ExpandAll"]').as('actionButton');
    }
    else {
      cy.get('[data-click-id="expandAll"]').as('actionButton');
    }
  }
  if (action == "Collapse") {
    if (viewName == "componenttree") {
      cy.get('[data-click-id="CollapseAll"]').as('actionButton');
    }
    else {
      cy.get('[data-click-id="collapseAll"]').as('actionButton');
    }
  }

  if (groupState == "Disabled") {
    //Button is disabled / there are no groups
    tooltipSelector = 'data-ardoq-popover-id';
    tooltipInnerText = 'notGrouping';
    popoverText = "No grouping applied";
    cssExpectation = 'not.have.css';
    }
    else if (groupState == "Enabled" || groupState == null) {
      tooltipSelector = 'data-tooltip-text';
      cssExpectation = 'have.css';

      //Button is not disabled
      if (action == "Expand") {
        tooltipInnerText = "Expand all";
        popoverText = "Expand all";
      } else
      if (action == "Collapse") {
        tooltipInnerText = "Collapse all";
        popoverText = "Collapse all";
      }
    }

  cy.get('@actionButton')
    .trigger('mouseover', {force:true}) //Force is needed in case the button is disabled
    .should('have.attr', tooltipSelector, tooltipInnerText);
  cy.get('#appContentContainer > div:nth-child(3) > div:nth-child(2)').as('Popover')
    .contains(popoverText);
  cy.get('@actionButton')
    .trigger('mouseout', {force:true}) //Force is needed in case the button is disabled
    .click({force:true})
    .should(cssExpectation, 'background-color', "rgb(46, 55, 66)");
});

//Result: View Setting 'Knowledge Base' is verified as clickable, showing popover, showing link icon
Cypress.Commands.add('ViewSettings_KnowledgeBase', () => {
  cy.get('[data-click-id="knowledgeBaseLink"]').as('KnowledgeBaseButton')
      .trigger('mouseover')
      .should('have.attr', 'data-tooltip-text', "Knowledge base");
  cy.get('#appContentContainer > div:nth-child(3) > div:nth-child(2)')
      .contains("Knowledge base");
  cy.get('@KnowledgeBaseButton')
      .trigger('mouseout')
      .click();
});

//Result: View Setting 'Legend' is verified as active, showing popover, toggling Legend on and off, Legend window not overlapping View Settings
Cypress.Commands.add('ViewSettings_Legend', () => {
  //Test preparation: expand all, if needed
  cy.get('body')
    .then($body => {
      if ($body.find('[data-click-id="ExpandAll"]').length > 0) {
        cy.get('[data-click-id="ExpandAll"]')
          .click({force:true});
      }

      if ($body.find('[data-click-id="expandAll"]').length > 0) {
        cy.get('[data-click-id="expandAll"]')
          .click({force:true});
      }
    });

  //Check popover description
  cy.get('[data-click-id="isLegendActive"]').as('LegendToggle')
    .trigger('mouseover')
    .should('have.attr', 'data-tooltip-text', "Toggle legend");
  cy.get('#appContentContainer > div:nth-child(3) > div:nth-child(2)')
    .contains("Toggle legend");

  //Check clicking the Legend toggle: the button shows clicked state
  cy.get('@LegendToggle')
    .trigger('mouseout')
    .click()
    .should('have.css', 'background-color', "rgb(46, 55, 66)"); //Button should show that it's switched ON
  cy.wait(1000);

  //The Legend is displayed after clicking the Legend toggle button
  cy.get('div.autoSize')
    .should('be.visible');

  //The Legend panels don't cover the View Setings bar
  cy.get('[data-intercom-target="view actions"]')
    .should('be.visible');

  //If the View has View Settings, check that they are not being covered by the Legend
  cy.get('body')
    .then(($body) => {
      if ($body.find('div[class*="ZoomContainer"]').length > 0) {
        cy.get('div[class*="ZoomContainer"]')
          .should('be.visible');
      }
    });
  
  //The Legend panels are individually collapsible
  cy.get('[data-test-id="legend-collapse-toggle"]')
    .click({multiple: true});
  cy.get('[data-test-id="individual-legend-panel-container"] > :nth-child(2)')
    .should('have.css', 'height', '0px');

  //Check that the Legend panel can be turned off
  cy.get('@LegendToggle')
    .click()
    .should('not.have.css', 'background-color', "rgb(46, 55, 66)"); //Button should show that it's switched ON

  //The Legend is hidden after clicking the Legend toggle button
  cy.get('div.autoSize')
    .should('not.be.visible');
});

//Result: sets the context to the top open Workspace
Cypress.Commands.add('setContext_Workspace', () => {
  //Check that the URL is set to be in an Open Workspace
  cy.location('pathname').should('contain', `/${'app/view/'}`);

  //Set context to whole Workspace
  cy.get('[class="workspace-name"]')
    .first()
    .realClick();
});

//Result: sets the context to the Component which is specified in parameters
//Parameters: name of the Component to set as context, area for performing the action: Navigator or Viewport
Cypress.Commands.add('setContext_Component', (componentName, area) =>{
  
  if (area === 'Navigator') {
    //Open up the whole Navigator tree
    cy.get('[class*=navigatorItemExpander]')
      .eq(0)
      .rightclick()
      .rightclick();
    cy.get('#navigator-container')
      .contains(componentName)
      .click({force:true});
  } 
  else if (area === 'Viewport') {
    //Right click on your Component
    cy.location('pathname')
      .then(($urlPath) => {
        if ($urlPath.includes(`/${'app/view/relationships3'}`)) {
          //In Relationships 3, the cursor must get specific coordinates where to perform double-click
          cy.get('[data-tooltip-text="Fit window"]')
            .click({force:true}); //Fit screen
          cy.get('canvas[class]')
            .realClick({clickCount: 2}, {position: "centre"}); //top centre of the Canvas to fire double-click on                                         //Set the Component as context, centering it
          cy.wait(500); //Give the animation time to finish running
        } else {
          cy.get('[data-test-id="MAIN_PANE_LEFT"] > div:nth-child(2)') //View contents
            .contains(componentName)
            .dblclick({force:true});
          }
        });
      }

  //Verify result: the Component is visible as in context in the Navigator
  cy.get('.component-item:contains("' + componentName + '")')
    .should('have.class', "active");
});

//Result: selects a context menu item/action.
//Parameter: 1. Component name, 2. Context: Navigator or Viewport, 3. Name of the context menu action to perform. Possible options: "edit", "create-scenario", "add-selection-to-scenario", "edit-style", "add-child", "toggle-lock", "create-reference", "view-history", "delete".
Cypress.Commands.add('selectContextMenuAction', (componentName, context, contextMenuItem) => {
  //Right click on your Component
  //In the Navigator
  if (context === 'Navigator') {
    cy.get('#navigator-content')
      .contains(componentName)
      .rightclick();
  } else
  //In the Viewport
  if (context === 'Viewport') {
    //In Relationships 2, you have to click on the node's circle (not the label)
    cy.location('pathname')
      .then(($urlPath) => {
        if ($urlPath.includes(`/${'app/view/relationships2'}`)) {
          cy.log("In Relationships 2, you have to click on the node's circle (not the label).")
          cy.get('[data-test-id="MAIN_PANE_LEFT"] > div:nth-child(2)') //View contents
            .contains(componentName)
            .then(($componentLabel) => {
          cy.wrap($componentLabel)  
            .parent()
            .find('circle')
            .realClick({button: "right"});
          });
        } else {
          cy.get('[data-test-id="MAIN_PANE_LEFT"] > div:nth-child(2)') //View contents
            .contains(componentName)
            .rightclick();
          }
      });
    }
      
  //Select the context menu item via data-click-id
  cy.get('[data-test-id="component-context-menu"]').as('contextMenu')
    .should('be.visible')
    .within(() => {
  cy.get('[data-test-id*=' + contextMenuItem + ']')
    .click();
  });

  cy.get('body')
    .realHover({position:'topRight'}) //Hover away from the Context menu
    
  //Context menu item disappears after clicking the item
  cy.get('[data-test-id$="context-menu"]')
    .should('not.exist');

  //When 'delete' is selected, perform deletion
  if (contextMenuItem === 'delete') {
    //At this call, this command will be resolved
    cy.intercept('DELETE', Cypress.config().baseUrl + '/api/component').as('deleteComponent');

    cy.get('[data-test-id$="context-menu"]')
      .should('not.exist');

    //Confirm deletion by clicking the button
    cy.get('[data-click-id="confirm-delete-components-references"]')
      .click({force: true}); //The context menu comes back from the dead to cover the button

    cy.wait('@deleteComponent').its('response.statusCode').should('eq', 200);

    //Be gone, modal window
    cy.get('body')
      .find('[role="modal"]')
      .should('not.exist');

    //Confirm that selected Components are deleted
    //In the Navigator
    cy.get('#navigator-content')
      .should('not.contain', componentName);
    
    //In the Viewport (unless the View is Canvas-based)
    //Explanation: Canvas is an image, so we can't select a Component within it via selectors
    cy.location('pathname')
      .then(($urlPath) => {
        if (!$urlPath.includes(`/${'app/view/relationships3'}`)) {
          cy.log('This is a not canvas-based View, so Viewport checks can be performed.')
          cy.get('[data-test-id="MAIN_PANE_LEFT"] > div:nth-child(2)') //View contents
            .should('not.contain', componentName);
          }
      });
  }
});

//Result: set the slider (MaterialUI) to a value
//Parameters: 1. Selector to click to show the Dropdown 2. DOM element which holds the slider, 3. input value for the slider
const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; //Needed for interacting with MaterialUI slider component
Cypress.Commands.add("setSliderValue", (dropdownSelector, DOMelement, sliderValue) => {
  cy.get(dropdownSelector)
    .click();
  //Open up more traversal options, if found or if collapsed
  cy.get('body > div > div > div[style]:nth-child(1)')
    .within(($dropdown) => {
      if($dropdown.find('[data-intercom-target="More"]').length > 0) {
        cy.log("Clicking to reveal single degree direction options...");
        cy.get('[data-intercom-target="More"]')
          .click();
      }
    });

  cy.get(DOMelement)
    .within(() => {
      cy.get('input[type="range"]')
        .then(($range) => {
          // get the DOM node
          const range = $range[0];
          // set the value manually
          nativeInputValueSetter.call(range, sliderValue);
          // dispatch the event
          range.dispatchEvent(new Event('change', { value: sliderValue, bubbles: true }));
          cy.wait(500); //To ensure that the value stays
        });
        
        //Verify result
        if (sliderValue === 11) {
          cy.get('[role] > div:nth-child(2)')
          .should('contain', '99'); //11th level of the slider represents 99 Relationships
        } else {
          cy.get('[role] > div:nth-child(2)')
          .should('contain', sliderValue);
        }
        cy.wait(500); //To ensure that the value stays
      });

  //Turn off this dropdown
  cy.get('[tabindex=1]')
    .realClick(); //Turn off the dropdown
  });

//Result: The "Edit metamodel" page for the context Workspace is open
//Parameters: Name of the Test Workspace which is open and in context
Cypress.Commands.add('enterEditMetamodelPage', (TestWorkspaceName) =>{
  cy.get('body')
    .within($body => {
      if ($body.find('[data-test-id="metamodel-editor"]').length > 1) {
        //Found the page header
        cy.log("Edit metamodel page was already open. Continuing tests.");

      } else {
        //Page header not found, opening it
        cy.log("Edit metamodel page not found. Taking steps to open it.");
        cy.get('.workspace-name')
          .rightclick();
        cy.get('[data-test-id="workspace-context-menu"]')
          .should('be.visible')
          .contains("Edit metamodel")
          .click();
      }

      cy.log("Confirm that the Edit metamodel page is open.");
      cy.wrap($body)
        .should('contain', "Edit metamodel for " + TestWorkspaceName);
    });
});

//Result: Sets the dropdown options checks to be ON. 
//Parameter: Selector to click to show the Dropdown
Cypress.Commands.add("setDropdownChecksON", dropdownSelector => {
  cy.get(dropdownSelector)
    .click();

  cy.get('body > div > div > div[style]:nth-child(1)').as('Dropdown') //All Views use the same dropdown
    .should('be.visible')
    .within(() => {
      cy.get('[type="DROPDOWN_OPTION"]').as('DropdownListItems') //All Views use the same dropdown items
        .then(($DropdownListItems) => {          
          cy.wrap($DropdownListItems).each(($listItem) => {
            if (($listItem.find(':contains("check")').length == 0) && ($listItem.find(':contains("Show")').length == 0)) {
              cy.log("Item without checks found! Setting checks...");
              cy.get($listItem)
                .click()
              }
            });
          });
        
        //Verify result
        cy.get('@DropdownListItems')
          .each(($listItem) => {
            if ($listItem.find(':contains("Show")') == 0) {
              cy.wrap($listItem)
              .should('contain', 'check');
            }
          })        
        });
      
  //Turn off this Dropdown
  cy.get('body')
    .type('{esc}');
      });

//Result: Test data is imported
//Parameters: filename for the Excel import file, name(s) of the Workspace(s) to be verified after import
//WIP
Cypress.Commands.add('importTestData_Excel', (importTemplateName, TestWorkspaceName) => {

  /*
  //Upload Excel file
  cy.request('POST', '/api/integrations/tabular/upload', {
    
    }
    );

  //Import the Excel file with the appropriate import configuration/mapping
  cy.request('POST', '/api/integrations/tabular/source/' +  + '/import?dryRun=false&async=true&requestId=import-excel-v2', {

  });
  */

  cy.fixture('AutomationOrg_ImportTemplate (Investments version Import 2).xlsx', 'binary')
    .then( excelfile => {
      const blob = Cypress.Blob.binaryStringToBlob(excelfile, 'application/binary');
      const formData = new FormData();
      formData.append('excelfile', blob, 'AutomationOrg_ImportTemplate (Investments version Import 2).xlsx');

      cy.request({
        method: 'POST',
        url: '/api/integrations/tabular/upload',
        body: formData,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });
    });





  //Confirm that the necessary Workspaces exist
  cy.get('@HomeNavIcon')
    .click()
    .trigger('mouseout');
  
  cy.get('[data-click-id="clear-filters-chip"]')
    .click();

  cy.get('[data-click-id="filter-workspaces-chip"]')
    .click();
  
  cy.get('[data-intercom-target="workspaces browser"]')
    .within(() => {
      TestWorkspaceName.forEach(TestWorkspace => {
        cy.contains(TestWorkspace)
          .should('be.visible');
      })
    });
});

//Result: Opens Two column mode by typing in the URL
//Parameters: Name of the View where the modifier is checked, typed as shown in the URL, following after .../app/view/
Cypress.Commands.add('openTwoColumn_URL', (ViewId) => {
  //Enter the URL to open Two column mode with 2 identical Views
  cy.visit(`/${'app/view/' + ViewId + '+' + ViewId + '/workspace/' + Cypress.env('testWorkspaceId') }`);
  cy.get('[data-test-id="MAIN_PANE_LEFT"]', {timeout: 8000})
    .should('be.visible', {timeout: 8000});
  if(cy.get('body').find('[data-test-id="MAIN_PANE_LEFT"]') == 0) {
    cy.wait(2000);
  }
});

//Result: Goes into More > Manage Views and enables Views to be selected
//Parameters: 1. An array of name(s) of the View to be enabled, 2. An array of viewId(s) of the View to be enabled
Cypress.Commands.add('enableMoreViews', (viewNames, viewIds) => {
  
  cy.get('[data-click-namespace="left visualization tabs"] [type="button"]')
    .should('contain', 'More')
    .and('be.visible')
    .realClick();
  
  cy.get('[data-intercom-target="Manage views"]')
    .click();

    viewNames.forEach((viewName, index) => {
      if (viewName == "Pages") {
        //Do not need to set Pages View
        //Skipping this turn
        return index = index+1;
      }
      
      if (viewIds[index] == "relationships3") {
        cy.get('[role="modal"] > div > div:nth-child(2) > div > div > div:contains(' + viewName +')')
          .not(':contains("(Old)")')
          .as('viewCard');
      } else
      if (viewIds[index] == "relationships2") {
        cy.get('[role="modal"] > div > div:nth-child(2) > div > div > div:contains(' + viewName +')')
          .filter(':contains("(Old)")')
          .as('viewCard');
      } else {
        cy.get('[role="modal"] > div > div:nth-child(2) > div > div > div:contains(' + viewName +')').as('viewCard');
      }

      cy.get('@viewCard')
        .within(() => {
          cy.get('[type="checkbox"]')
            .scrollIntoView()
            .check();
          });
        });

  cy.contains("Apply changes")
    .click();
  cy.get('[role="modal"]')
    .should('not.exist');
  cy.wait(500);

  //Verify the result
  cy.get('[data-click-namespace="left visualization tabs"] button:contains("More")')
    .click();
  cy.get('div[tabindex] [data-click-namespace="left visualization tabs"]')
    .should('be.visible');

  viewIds.forEach(viewId => {
    cy.get('[data-click-id*=' + viewId + ']')
      .should('be.visible');
  });

  cy.get('body')
    .type('{esc}');
  cy.get('div[tabindex] [data-click-namespace="left visualization tabs"]')
    .should('not.exist');
});

//Result: Compares the number of View modifiers between the same Views in Two column mode
//Parameters: 1. Number of View modifiers expected in the View, 2. ViewId of the View to be tested
//Note: Choosing the "noURL" option assumes that you have opened Two column mode already.
Cypress.Commands.add('compareViewModifiers', (numberOfViewModifiers, viewId) => {
  if (viewId != 'noURL') { //If we first want to open the View and Two column mode by typing in the URL
    cy.openTwoColumn_URL(viewId);
  }
  
  //Check that Two column mode is ON first
  if(cy.get('body').find('[data-test-id^="MAIN_PANE"]') < 2) {
    //turn ON
    cy.get('[data-tooltip-text="Open two-column view"]')
      .click();
    }
  
  //Check that View modifiers on the left and right side have the same expected number of View modifiers
  cy.get('[data-test-id="MAIN_PANE_LEFT"] [data-intercom-target="view modifiers"] > button').as('leftPaneModifiers');
  cy.get('@leftPaneModifiers')
    .its('length')
    .should('eq', numberOfViewModifiers)
    .then(length => {
      cy.log ('Left pane has this many View modifiers: ' + length);
    });

  cy.get('[data-test-id="MAIN_PANE_RIGHT"] [data-intercom-target="view modifiers"] > button').as('rightPaneModifiers');
  cy.get('@rightPaneModifiers')
    .its('length')
    .should('eq', numberOfViewModifiers)
    .then(length => {
      cy.log('Right pane has this many View modifiers: ' + length);
    });
  });

//Result: Fullscreen toggle button state and description is checked.
//Note: Cypress doesn't support testing in fullscreen currently! Commenting out actions performed within Fullscreen, for now.
//Parameters: View modifiers which are expected in Fullscreen mode of the View
Cypress.Commands.add('ViewSettings_Fullscreen', (viewModifiers) => {
  //Checks the Fullscreen toggle button
  //Check popover description
  cy.get('[data-click-id="fullScreen"]').as('FullscreenToggle')
    .trigger('mouseover')
    .should('have.attr', 'data-tooltip-text', "Fullscreen");
  cy.get('#appContentContainer > div:nth-child(3) > div:nth-child(2)')
    .contains("Fullscreen");

  //Check clicking the Fullscreen toggle: the button shows clicked state
  cy.get('@FullscreenToggle')
    .trigger('mouseout')
    .click()
    .should('have.css', 'background-color', "rgb(46, 55, 66)"); //Button should show that it's switched ON
  cy.wait(1000);

  //Check that the popover is correct in Fullscreen mode
  cy.get('@FullscreenToggle')
    .trigger('mouseover')
    .should('have.attr', 'data-tooltip-text', "Leave Fullscreen");
  /************* Cypress doesn't support testing in fullscreen currently *************
  cy.get('[data-test-id="MAIN_PANE_LEFT"] > div:nth-child(2) > div:nth-child(1) > div > div:nth-child(2)') //This popover isn't caught by Cypress
    .contains("Leave Fullscreen");

  //Check View Settings in Fullscreen
  cy.ViewSettings_KnowledgeBase();                //Can't test within Fullscreen
  cy.ViewSettings_Legend();                       //Can't test within Fullscreen
  cy.ViewSettings_Export("Add to Presentation");  //Can't test within Fullscreen

  if (viewModifiers === "Expand all") {
    cy.ViewModifiers_ExpandCollapseAll('Enabled', 'Expand', thisViewId);       //Can't test within Fullscreen
  } else
  if (viewModifiers === "Collapse all") {
    cy.ViewModifiers_ExpandCollapseAll('Enabled, 'Collapse', thisViewId);     //Can't test within Fullscreen
  }
  *************/
  //Exit Fullscreen by pressing the Fullscreen toggle
  cy.get('@FullscreenToggle')
    .click()
    .should('not.have.css', 'background-color', "rgb(46, 55, 66)"); //Button should show that it's switched OFF
  /************* Cypress doesn't support testing in fullscreen currently *************
  //Enter Fullscreen again
  cy.get('@FullscreenToggle')
    .click()
    .should('have.css', 'background-color', "rgb(46, 55, 66)"); //Button should show that it's switched ON
  //Exit Fullscreen by pressing the Esc key on the keyboard
  cy.get('body')
    .type('{esc}');
  cy.get('@FullscreenToggle')
    .should('not.have.css', 'background-color', "rgb(46, 55, 66)"); //Button should show that it's switched OFF
  *************/
});

//Result: Export buttons and their popovers are checked
//Parameter: The name(s) of actions to expect in the dropdown: Export to PDF, Export to PNG, Export to SVG, Add to Presentation
//Note: Only checks the existence of export actions!!
Cypress.Commands.add('ViewSettings_Export', actions => {
  //Checks the Export button
  //Check popover description
  cy.get('[data-click-id="export view button"]').as('ExportButton')
    .trigger('mouseover')
    .should('have.attr', 'data-tooltip-text', "Export");
  cy.get('#appContentContainer > div:nth-child(3) > div:nth-child(2)')
    .contains("Export");

  //Clicks the button and checks button state
  cy.get('@ExportButton')
    .trigger('mouseout')
    .click()
    .should('have.css', 'background-color', "rgb(46, 55, 66)"); //Button should show that it's switched ON
  
  //Checks for dropdown with export options
  cy.get('body > div > div > div[style]:nth-child(1)')
    .should('be.visible');

  //checks the presence of expected export actions
  actions.forEach(actionName => {
    cy.get('body > div > div > div[style]:nth-child(1)')
      .should('contain', actionName);
  });
});

//Result: Checks that the expected context menu options are available and in the correct order inside the Viewport of each View
//Parameters: 1. Component label for right-click, 2. ViewId of the View to be tested, 3. Names of context menu options as displayed in the Context menu
//Note: Does not check the functionality of each Context menu option.
Cypress.Commands.add('checkContextMenuOptions_Component', (componentName, viewId, contextMenuOptions) => {
  //Open the relevant View, if not already open
  cy.OpenView(viewId);

  //Right click on your Component
  cy.location('pathname')
    .then(($urlPath) => {
      //In Relationships 3, the cursor must get specific coordinates where to perform right-click
      if ($urlPath.includes(`/${'app/view/relationships3'}`)) {

        cy.get('[data-tooltip-text="Fit window"]')
          .click({force:true}); //Fit screen
        cy.setContext_Component(componentName, "Navigator"); //Set the Component as context, centering it
        cy.wait(500); //Give the animation time to finish running

        cy.get('canvas[class]')
          .realClick({button: "right"}, {position: "center"}); //centre of the Canvas to fire right-click on
      }
       else {
        cy.get('[data-test-id="MAIN_PANE_LEFT"] > div:nth-child(2)') //View Contents
          .contains(componentName)
          .first()
          .rightclick({force:true});
        }
      });

    //Check that the Context menu is displayed
    cy.get('[data-test-id$="context-menu"]').as('contextMenu')
      .should('be.visible')
      .then(() => {
        //Confirm that all the expected options are present in the context menu
        for (optionCounter=0; optionCounter < contextMenuOptions.length; optionCounter++) {
          cy.contains(contextMenuOptions[optionCounter]);
        };
      cy.log('All the expected context menu options were found.');

      //Confirm the number of expected Options versus the actual options that were checked
      cy.get('[data-test-id$="context-menu"] div[data-intercom-target]')
        .its('length') //number of elements found
        .should('eq', contextMenuOptions.length) //expected options
        .and('eq', optionCounter); //counted options

      //Confirm that each context menu option is at the expected place in the list (order of options)
      cy.get('[data-test-id$=context-menu] div[data-intercom-target]')
        .then(options => {
          for (optionCounter=0; optionCounter < contextMenuOptions.length; optionCounter++) {
            cy.get(options[optionCounter])
              .should('contain', contextMenuOptions[optionCounter]);
          };
        });

      cy.log('All menu options were displayed in the correct order.');
    });

    cy.get('@contextMenu')
      .realType('{esc}'); //Move the focus away from context menu
    
    //Context menu item disappears after clicking the item
    cy.get('body')
      .find('[data-test-id$="context-menu"]')
      .should('not.exist');
    });

//Result: Checks that the expected context menu options are available and in the correct order inside the Viewport of each View
//Parameters: 2. ViewId of the View to be tested, 3. Names of context menu options as displayed in the Context menu
//Note: Does not check the functionality of each Context menu option.
Cypress.Commands.add('checkContextMenuOptions_Reference', (viewId, contextMenuOptions) => {
  //Open the relevant View, if not already open
  cy.OpenView(viewId);

  //Right click on a Reference
  cy.get('[data-reference-model-ids]')
    .first()
    .rightclick({force:true});
  
  //Check that the Context menu is displayed
  cy.get('[data-test-id$="context-menu"]').as('contextMenu')
    .should('be.visible')
    .then(() => {
      //Confirm that all the expected options are present in the context menu
      for (optionCounter=0; optionCounter < contextMenuOptions.length; optionCounter++) {
        cy.contains(contextMenuOptions[optionCounter]);
      };
      cy.log('All the expected context menu options were found.');

      //Confirm the number of expected Options versus the actual options that were checked
      cy.get('[data-test-id$="context-menu"] div[data-intercom-target]')
        .its('length') //number of elements found
        .should('eq', contextMenuOptions.length) //expected options
        .and('eq', optionCounter); //counted options
      //Confirm that each context menu option is at the expected place in the list (order of options)
      cy.get('[data-test-id$=context-menu] div[data-intercom-target]')
        .then(options => {
          for (optionCounter=0; optionCounter < contextMenuOptions.length; optionCounter++) {
            cy.get(options[optionCounter])
              .should('contain', contextMenuOptions[optionCounter]);
          };
        });
        cy.log('All menu options were displayed in the correct order.');
    });

  cy.get('@contextMenu')
    .realType('{esc}'); //Move the focus away from context menu

  //Context menu item disappears after clicking the item
  cy.get('body')
    .find('[data-test-id$="context-menu"]')
    .should('not.exist');  
});

//Result: Creates a custom field in the test Workspace, assigning it to the first found Component type, and stores values in Components.
//Note: Your test Workspace ID needs to be assigned to the Cypress local variable `testWorkspaceId`. Multiple parameter 5. values are only assigned if there are Components to assign them to.
//Parameters: 1. Target Components (all or first found), 2. Field name, 3. Field type (Text, DateTime, Number, List...), 4. Default value,  5. Array of value(s) to store in the field(s)
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

//Result: Creates a Parent -> Child -> Grandchild structure of Components, and a Disconnected Component via the blue plus button and the Sidebar menu
//Parameters: 1. An array of all the Component names and their types, the first one being the Parent
Cypress.Commands.add('createComponents_Sidebar', (componentLevel) => {
  //Expect: Creates components using the + icon
  cy.get('.fab-main')
    .should('be.visible')
    .click();
  cy.get('.right-pane').as('Sidebar')
    .should('contain', "Create component");
  //Component 1 (type: Level 1) ->     
  //Component 1 (type: Level 2) ->
  //Component 1 (type: Level 3)
  for(let componentLevelCounter = 0; componentLevelCounter < componentLevel.length; componentLevelCounter++){
    cy.get('[data-click-id="editor-input-name"]')
      .clear() //Clear here so that the previous name is overwritten
      .type(componentLevel[componentLevelCounter] + " component", {force: true});
    if(componentLevel[componentLevelCounter] === componentLevel[0]){
      cy.get('[data-click-id="editor-input-parent"]')
        .click()
        .type('None');
      cy.get('[id*="-option"]')
        .eq(0)
        .click({force:true});
    } else {
      cy.get('[data-click-id="editor-input-parent"]')
        .click()
        .type(componentLevel[componentLevelCounter-1]);
      cy.get('[id*="-option"]')
        .eq(0)
        .click({force:true});
    }
    cy.get('[data-click-id="editor-input-typeId"]')
      .click()
      .type(componentLevel[componentLevelCounter]);
    cy.get('[id*="-option"]')
      .eq(0)
      .click({force:true});
    cy.get('[data-click-id="sidebar-action-save-create"]')
      .click();

    //Turn off all of the notifications
    cy.get('#appContentContainer > div:nth-child(3) > div button').as('Notification')
      .click({multiple:true});
  }

  //Disconnected Component
  cy.get('[data-click-id="editor-input-name"]')
    .clear()
    .type('Disconnected', {force: true});
  cy.get('[data-click-id="editor-input-parent"]')
    .click()
    .type('None');
  cy.get('[id*="-option"]')
    .eq(0)
    .click({force:true});
  cy.get('[data-click-id="sidebar-action-save-create"]')
    .click();
  cy.get('.fab-main')
      .click();
  cy.get('body').scrollIntoView(); //Fixes the Viewport

  //Turn off all of the notifications
  cy.get('#appContentContainer > div:nth-child(3) > div button').as('Notification')
    .click({multiple:true});
  cy.get('@Notification')
    .should('not.exist');
});

//Result: Creates a Reference between 2 Components with the linking line, from either the Navigator (using the link icon) or the Viewport (using the context menu option "Create reference")
//Parameters: 1. Context: Viewport OR Navigator, 2. Source Component Name, 3. Target Component Name, 4. [Optional] Full name of a field's input selector, 5. [Optional] Custom value to be set by user
//Note: You need at least 2 Components present in the Workspace. 1 Component needs to be named "AutoComponent3". fieldSelector and userSetValue need to match in number and order!
Cypress.Commands.add('createReference_Link', (context, sourceComponentName, targetComponentName, fieldSelector, userSetValue) => {

  if (context === "Navigator") {    
    //Click the link icon next to a Component in the Navigator
    cy.get('.component-item')
      .contains(sourceComponentName)
      .realHover()
      .should('be.visible');
    cy.get('[data-test-id="NavigatorItemLink"]')
      .first()
      .realHover()
      .should('be.visible')
      .click();
  } else
  if (context === "Viewport") {
    //Right click on a Component in the Viewport
    cy.selectContextMenuAction(sourceComponentName, 'Viewport', 'create-reference')
  }

    //Connect the Reference line to another Component in the Viewport
    cy.get('[data-test-id="MAIN_PANE_LEFT"] > div:nth-child(2) .component')
      .contains(targetComponentName)
      .click({force:true}); //In case the Context menu is still open, we must use force

    //Define the Reference in the Sidebar Editor and Save
    cy.get('.right-pane')
      .should('be.visible')
      .and('contain', "Create reference");
      
      if (fieldSelector != null & userSetValue != null) {
        //Only run if there is a valid number of parameters
        if(fieldSelector.length != userSetValue.length) {
          cy.log("NOT applying user set values. Please set an equal number of parameters in the command to create References.");
        } else {
          fieldSelector.forEach((field, index) => {
            cy.get(field)
              .clear()
              .type(userSetValue[index]);
            cy.realPress("Tab");
          });
        }
      }

    if (context === "Navigator") {
      cy.get('[data-click-id="editor-input-displayText"]')
        .type("Reference description: This created via Navigator.");
    } else
    if (context === "Viewpoint") {
      cy.get('[data-click-id="editor-input-displayText"]')
        .type("Reference description: This created in the Viewport.", {force: true});
    }

    cy.get('[data-click-id="sidebar-action-save-create"]')
      .click();
});

//Result: Sets the dropdown sliders to their max value. 
//Parameter: 1. Selector to click to show the Dropdown, 2. Expected number of sliders to set
Cypress.Commands.add("setMaxDropdownSliders", (
  dropdownSelector,
  numberOfSliders
  ) => {
  cy.get(dropdownSelector)
    .click();

  cy.get('body > div > div > div[style]:nth-child(1)').as('Dropdown') //All Views use the same dropdown
    .should('be.visible')
    .within(($dropdown) => {
      if($dropdown.find('[data-intercom-target="More"]').length > 0) {
        cy.log("Clicking to reveal single degree direction options...");
        cy.get('[data-intercom-target="More"]')
          .click();
      }
      
      cy.get('input[type="range"]')
        .should('have.length', numberOfSliders)
        .each(($range, index) => {
          // get the DOM node
          let range = $range[0];
          let sliderValue = $range.attr('max');
          cy.log("Slider Value is: " + sliderValue);

          // set the value manually
          nativeInputValueSetter.call(range, sliderValue);
          // dispatch the event
          range.dispatchEvent(new Event('change', { value: sliderValue, bubbles: true }));
          cy.wait(500); //To ensure that the value stays

          //Verify result
          if (sliderValue == 11) {
            cy.get('[role] > div:nth-child(2)')
              .eq(index)
              .should('contain', '99'); //11th level of the slider represents 99 Relationships
            } else {
            cy.get('[role] > div:nth-child(2)')
              .eq(index)
              .should('contain', sliderValue);
            }
          
          cy.wait(500); //To ensure that the value stays
          });
        });
      
  //Turn off this Dropdown
  cy.get('[tabindex=1]')
    .realClick(); //Turn off the dropdown
      });

//Result: Turns the Parent or Child option OFF and ON again, in Degrees of relationship
//Parameters: 1. Target: Parent or Child, 2. An array of Component names in Parent-Child relationships like Parent->Child->Grandchild
Cypress.Commands.add("degreesOfRelationship_ParentChildCheck",
(
  target,
  componentsHierarchy
) => {
  componentsHierarchy.length > 3;

  //Init the variables
  let contextComponent; let targetComponent; let selectorTarget; let unaffectedComponent; let existentialClause;

  if (target == "Child") {
    contextComponent = componentsHierarchy[0];
    targetComponent = componentsHierarchy[1];
    selectorTarget = "Children";
    unaffectedComponent = componentsHierarchy[0];
    existentialClause = "not.";
  } else
  if (target == "Parent") {
    contextComponent = componentsHierarchy[1];
    targetComponent = componentsHierarchy[0];
    selectorTarget = "Parents";
    unaffectedComponent = componentsHierarchy[2];
    existentialClause = "";
  }
  //First set the context to a Component
  cy.setContext_Component(contextComponent, "Navigator");

  //Then set the Degrees of Relationship to 1
  cy.setSliderValue('[data-click-id="slider-degrees-of-relationship"]', '[data-intercom-target="Degrees of relationship"]', 1);
  //Check that the target is visible first
  cy.get('[data-test-id="MAIN_PANE_LEFT"] > div:nth-child(2)').as('Viewport')
      .contains(targetComponent)
      .should('be.visible');

  //Finally, uncheck the option
  cy.get('[data-click-id="slider-degrees-of-relationship"]')
      .click();
    cy.get('body > div > div > div[style]:nth-child(1)')
      .then(() => {
        cy.get('[data-intercom-target="' + selectorTarget + '"]').as('dropdownOption')
          .then($dropdownOption => {
            //In case the target is not unchecked
            if ($dropdownOption.find(':contains("check")').length > 0) {
              cy.log("Clicking the option to disable it.");
              cy.get($dropdownOption)
               .click();
              }
          });

        //Expect the target to be unchecked
        cy.get('@dropdownOption')
          .should('not.contain', 'check');
      });

    //Verify result
    cy.get('@Viewport')
      .within(($Viewport) => {
        cy.wrap($Viewport)
          .should('contain', unaffectedComponent)
          .should(existentialClause + 'contain', targetComponent); //Parent Components may still be present in the Viewport, but invisible

        if (targetComponent == "Parent") {
          cy.contains(targetComponent)
            .should('not.be.visible');
        }
          
        cy.log('Target ' + selectorTarget + ' is correctly hidden.');
      });

    //Again, check the target option
    cy.get('body > div > div > div[style]:nth-child(1)')
    .then(() => {
      cy.get('[data-intercom-target="'+ selectorTarget +'"]').as('dropdownOption')
        .then($dropdownOption => {
          //Check that the target is checked
          if ($dropdownOption.find(':contains("check")').length == 0) {
            cy.log("Clicking the target option to enable it.");
            cy.get($dropdownOption)
             .click();
            }
        });
        //Expect the target to be checked
        cy.get('@dropdownOption')
        .should('contain', 'check');
      });

    //Verify result
    cy.get('@Viewport')
      .should('contain', targetComponent);
    cy.log('Target option is now displayed.');
});

//Result: Creates a Workspace with 3 Components and 1 Reference. Returns all Workspace data.
//Parameters: 1. Workspace name (string), 2. Name of a model type
Cypress.Commands.add('createWorkspace_NoPromises', (name, modelName) => {
  let workspaceId, componentTo, componentFrom, modelId, typeId;

  cy.request('GET', '/api/model?includeCommon=true').as('workspaceModels');
  cy.get('@workspaceModels')
  .then(workspaceModels => {
    const model = workspaceModels.body.find(({ name }) => name === modelName);
    if (model) {
      cy.request('POST', '/api/workspace/create', {
        name: name || model.name,
        views: '' || model.defaultViews,
        componentTemplate: model._id,
        description: 'This Workspace was created via API',
        startView: 'blockDiagram',
      }).as('workspaceResponse');
      
      cy.get('@workspaceResponse')
        .then(workspaceResponse => {
          persistedWorkspaceId = JSON.parse(JSON.stringify(workspaceResponse));
          workspaceId = persistedWorkspaceId.body.workspace._id;
          modelId = workspaceResponse.body.workspace.componentModel;
          typeId = workspaceResponse.body.model.root.id;

          cy.request('POST', '/api/component', {
            name: 'AutoComponent1',
            model: modelId,
            description: 'This Component was created via API',
            parent: null,
            typeId: typeId,
            rootWorkspace: workspaceId,
            type: 'Application',
            _order: 1,
          }).as('fromComponent');
    
          cy.request('POST', '/api/component', {
            name: 'AutoComponent2',
            model: modelId,
            description: 'This Component was created via API',
            parent: null,
            typeId: typeId,
            rootWorkspace: workspaceId,
            type: 'Application',
            _order: 1,
          }).as('toComponent');
          
          cy.request('POST', '/api/component', {
            name: 'AutoComponent3',
            model: modelId,
            description: 'This Component was created via API',
            parent: null,
            typeId: typeId,
            rootWorkspace: workspaceId,
            type: 'Application',
            _order: 1,
          });
        });      
      
      cy.get('@workspaceResponse').then(workspaceResponse => {
        cy.get('@fromComponent').then(componentFromResponse => {
            cy.get('@toComponent').then(componentToResponse => {
              persistedWorkspaceId = JSON.parse(JSON.stringify(workspaceResponse));
              workspaceId = persistedWorkspaceId.body.workspace._id;

              persistedComponentFromId = JSON.parse(JSON.stringify(componentFromResponse));
              componentFrom = persistedComponentFromId.body._id;

              persistedComponentToId = JSON.parse(JSON.stringify(componentToResponse));
              componentTo = persistedComponentToId.body._id;

              cy.request('POST', '/api/reference', {
                source: componentFrom,
                target: componentTo,
                type: 2,
                order: 0,
                description: 'This Reference was created via API',
                rootWorkspace: workspaceId,
              });
            });
          });
        });
    } else {
      cy.log('#### ERROR #### No model found with name: ' + modelName + '. Workspace was not created.');
    }
  });
});
