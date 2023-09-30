class HomePage
{
getName()
{
    return cy.get("div[class='form-group'] input[name*='name']")
}
getTwoWayBinding()
{
    return cy.get('h4 input')
}
getEntrepreneur ()
{
    return cy.get('#inlineRadio3')

}
getGender()
{
return cy.get('select')
}
getShop()
{
return cy.get("a[href*='shop']")
}
}
export default HomePage
