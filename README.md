# ardoq-automated-front-tests

### This repository contains Automated end to end tests written in Cypress.

#### Installation:

1. Clone the repository
2. Run `yarn install`
3. Run `yarn update-credentials` - This will create cypress.env.json file. It should not be tracked by Git.
4. Update the credentials in cypress.env.json corresponding to the environment you want to test
5. Run the following command:  
    `yarn test:prod` - For running in Production  
    `yarn test:local` - For running in local environment

#### For Windows:
If you're on Windows with Yarn version 1.xx.x, you will have to do the following to be able to run `yarn` commands.
First clone the repository. Then:

* Follow this step from yarnpkg.com/getting-started/install
`yarn set version stable`
and then do
`yarn install`
After that, `yarn test:test` or `yarn test:local` etc. should work and open up the Cypress window.

* Other ways used by the team to run the tests in Windows are:
    * `NPX cypress open`
    * `yarn run cypress open`

### Conventions and Best Practices

1. It is recommended to run the tests either in local environment or in Production's automatedtests environment.
2. When making new Chai helpers (alias Utility files, Page Object Models), keep in mind that they *need to be reusable* in other test cases. If it can't be used again, it shouldn't be a helper. All helpers go into the cypress/support/ folder.
3. When a test step takes too long because it's waiting for GUI to respond, we can use our APIs instead. Examples of some being currently used:
    * For creating Workspaces and Components
    * For logging in
    * To delete all items created in a test after the test is finished

    The full list can be found in cypress/support/apiRequests.js. There's many, so it's useful to search there if you think you need one, and new ones can be added.

#### Things to remember

* When running tests with Cucumber, the following have to have the same name in order to work properly:  
(see more in cypress\integration\Cucumber\ )
    * .feature file
    * folder that holds .js files
    * .js step definition file
* If adding another framework to the online repository, make sure that it can be integrated with CircleCI! This is a requirement for our automation suite.
* Screenshots (and recordings?) are saved in CircleCI for 60 days.

#### Test setup:

1. By default, `yarn test:prod` will launch https://automatedtests.ardoq.com/ for organization automatedtests
2. Tests are set to run in the following intervals:
    * Daily, during the night, through CircleCI (defined in .circleci/config.yml)
    * On anyone pushing code to ardoq-e2e-tests master branch
    * Tests can also be triggered manually (and individually) at any time in CircleCI (app.circleci.com)
3. Slack is set up with CircleCI (also defined in .circleci/config.yml), so notifications will show up for everyone in the Slack channel #cypress-test whenever a test is run.
4. The number of retries for failed tests is 2, defined in cypress.json

#### Troubleshooting:
- If running your tests in a subdomain on localhost, like `test.localhost:8081`, you need to explicitly specify this subdomain in your etc/hosts file for your automated tests to work:
127.0.0.1 test.localhost

! This is in addition to already having added localhost in your etc/hosts file:
127.0.0.1 localhost
