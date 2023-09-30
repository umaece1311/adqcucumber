class ProductPage
{
getCheckout()
{
    return cy.get("a[class*='btn']")
}
getAddedItem()
{
    return cy.get('h4 a')
}
getTotalOfIndivudal(){
return cy.get('tbody td:nth-child(4) strong')
}
getTotal(){
    return cy.get('h3 strong')
    }
getFinalCheckout()
{
    return cy.get("button[class='btn btn-success']")

}
getCountry()
{
return  cy.get('#country')
}
getSuggestion()
{
return cy.get("div[class='suggestions'] ul li a")
}
getTerms()
{
return cy.get('.checkbox')
}
getPurchase()
{
return cy.get('.ng-untouched > .btn')
}
getSucessMsg()
{
    return cy.get('.alert') 
}
}
export default ProductPage
