describe('Login in Ardoq', () => {
  it('Successfully loads', () => {
    cy.visit('http://localhost:8080'); // localhost

    cy.get('#inputEmail') //find by id
      .type('admin@ardoq.com');

    cy.get('#inputPassword') //find by id
      .type('ardoq123');

    cy.get('#loginButton') //find by id
      .click();

    //    cy.get('#title', { timeout: 15000 })
    //    .should('have.value','Ardoq - Home')
  });
});
