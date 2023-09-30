

//Admin user Create Blank workspace and added two components
Cypress.Commands.add('adminCreateWorkpaceWithComponents', (TestWorkspaceName, componentLevel) => {
	cy.createWorkspace(
		TestWorkspaceName ,
		'Blank Workspace'
	);
	cy.OpenWorkspace(TestWorkspaceName);
    cy.get("[data-tooltip-text^='Sidebar']").click()
	cy.get("[data-click-id*='manage-component']").click()
	cy.get('body').should('contain', "Edit metamodel for " + TestWorkspaceName, { timeout: 8000 });
	cy.EditMetamodel(componentLevel)

})
Cypress.Commands.add('createReferenceFromNavigator', (componentName1,componentName2 )=>{
	cy.contains(componentName1, { timeout: 20000 }).rightclick();
	cy.get("div[name*='reference']").click({timeout:2000})
	cy.contains(componentName1).trigger('mouseout', {force: true,});
	cy.contains(componentName2).scrollIntoView();
	cy.contains(componentName2).click();
  })
  Cypress.Commands.add('createIncomingReference', (componentName1,componentName2,componentName3)=>{
	cy.contains(componentName1).click();
	cy.contains(componentName2).click({ctrlKey: true}).rightclick();
	cy.wait(2000);
	cy.xpath("//i[normalize-space()='chevron_right']").click({force: true})
	cy.get("div[name*='incoming']").click({force: true});
	cy.wait(2000);
	cy.contains(componentName2).trigger('mouseout', {force: true});
	cy.contains(componentName3).scrollIntoView();
	cy.contains(componentName3).click();
  })
  Cypress.Commands.add('createOutgoingReference', (componentName1,componentName2,componentName3)=>{
	cy.contains(componentName1).click();
	cy.contains(componentName2).click({ctrlKey: true}).rightclick();
	cy.wait(2000);
	cy.xpath("//i[normalize-space()='chevron_right']").click({force: true})
	cy.get("div[name*='outgoing']").click({force: true});
	cy.wait(2000);
	cy.contains(componentName2).trigger('mouseout', {force: true});
	cy.contains(componentName3).scrollIntoView();
	cy.contains(componentName3).click();
  })
Cypress.Commands.add('OpenWorkspace', TestWorkspaceName => {
  //This command resolves with the API call below
  cy.intercept('POST', Cypress.config().baseUrl + '/api/log').as('openWorkspace');
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
    cy.get("[data-click-id*='asset-manager-name-click']")
      .should('be.visible')
      .contains(TestWorkspaceName)
      .last()
      .click();
	  //Assert that the Workspace is open
	  cy.get('body').should('contain' ,TestWorkspaceName);
    })

Cypress.Commands.add('EditMetamodel', (componentLevel) => {
	//First level Component type
	cy.wait(3000);
	cy.get("input[value*='Create']").click({timeout:6000})
		.clear()
		.type(componentLevel[0] + '{enter}',{ force: true });
	 //Otherwise the DOM becomes detached for the next step

	for (let componentLevelCounter = 1; componentLevelCounter < componentLevel.length; componentLevelCounter++) {
		cy.get("div[role='modal'] i").contains('add')
			.eq(0)
			.click({ force: true })
		cy.get("input[placeholder='Component type']")
			.eq(0)
			.type(componentLevel[componentLevelCounter] + '{enter}', { force: true });
		cy.wait(500);
		//Otherwise the DOM becomes detached for the next step
	}
	cy.get('button').contains('Save').click({ force: true })	
	cy.wait(3000);
	cy.get("[data-test-id*='metamodel-editor-header-close-button']").click({force: true })
})


Cypress.Commands.add('sortComponentsInWs', ()=>{
	cy.get('[data-tooltip-text="Sorting"]').should('be.visible').click();
	cy.get('[data-intercom-target="Name"]').should('be.visible').click();
});