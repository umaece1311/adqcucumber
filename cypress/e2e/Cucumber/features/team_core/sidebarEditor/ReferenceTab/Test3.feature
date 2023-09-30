Feature: Order phonefrom ecommerce site
    @regression
    Scenario: Place the order successfully
    Given I open the site
    When Click the shop and Add the items to the cart
    And Validate the Prices
    And Select the country for delivery
    Then Verfiy the sucessfuly place the Order
    @smoke
    Scenario: Filling the form to Shop
    Given I open the site
    When I Fill the form details
    |name|Sex|
    |Sanmita|Female|
    Then Validate the forms behaviour
    |Sanmita|
    And Select the Shop Page
