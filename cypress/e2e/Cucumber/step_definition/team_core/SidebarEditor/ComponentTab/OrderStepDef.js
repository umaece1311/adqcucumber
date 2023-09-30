/// <reference types="Cypress" />

import HomePage from '../../../../Pages/team_core/sidebarEditor/Component/HomePage';
import ProductPage from '../../../../Pages/team_core/sidebarEditor/Component/ProductPage.js';
import { Given, When, Then, And, Before } from "@badeball/cypress-cucumber-preprocessor";
const home=new HomePage()
const product=new ProductPage()

Given ('I open the site',() => {

    cy.visit("/angularpractice/")
})

When('Click the shop and Add the items to the cart',function(){
    home.getShop().click()
          this.data.product.forEach(element => {
            cy.selectProduct(element)
        })
        product.getCheckout().click()
})
And('Validate the Prices',()=>{
    var sum=0
            product.getTotalOfIndivudal().each(($productPrice,index,$list)=>{
                var result=$productPrice.text().split(" ")
               result= result[1].trim()
              sum=Number(sum )+ Number(result)
            
        }).then(function()
        {
            cy.log(sum)
        })
        product.getTotal().then(function(total)
        {
          const check=total.text().split(" ")
         expect( Number(check[1].trim())).to.equal(sum)
        })
}
)

And('Select the country for delivery',()=>{
    product.getFinalCheckout().click()
            product.getCountry().type('India')
            Cypress.config("defaultCommandTimeout",10000)
})

Then('Verfiy the sucessfuly place the Order',function(){
    product.getSuggestion().click()
            product.getTerms().click()
            product.getPurchase().click()
       // product.getSucessMsg().should('have.text','Success! Thank you! Your order will be delivered in next few weeks :-).')
       product.getSucessMsg().then(function(ele)
       {
        expect(ele.text().includes('Success')).to.be.true

       })
    })

When('I Fill the form details',function(dataTable)
{
    home.getName().type(dataTable.rawTable[1][0])
    home.getGender().select(dataTable.rawTable[1][1])
})
Then('Validate the forms behaviour',function(dataTable){
    home.getTwoWayBinding().should('have.value',dataTable.rawTable[0][0])
    home.getName().should('have.attr','minlength',2)
    home.getEntrepreneur().should('be.disabled')
    
})
Then('Select the Shop Page',function(){
    home.getShop().click()
})