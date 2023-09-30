// in cypress/support/index.d.ts
// load type definitions that come with Cypress module
/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
        /**
         * Custom command to select DOM element by data-cy attribute.
         * @example cy.dataCy('greeting')
         */
        createField(name): Chainable<Element>
        createScenario(): Chainable<Element>
        createInstance():Chainable<Element>
        updateLastAddedComponent():Chainable<Element>
        StartMappingColumn6():Chainable<Element>
        ChangeColumn5FieldName(fieldNameText):Chainable<Element>
        openWorkspaceOrScenario(source,name):Chainable<Element>
        componentVisibilityEnabler(componentOption1,componentOption2)
        openWorkspace(workspaceId)
        addComponent(componentName,type)
        updateWorkspace()
        updateModelOrContent(type, source)
        createModelOrContent(type, source)
        plusbuttonEnabler()
        addComponentInScenario()
        OpenView(viewName)
        sidebarFindAndClickButtonUnderWorkspace(buttonName)
    }
}