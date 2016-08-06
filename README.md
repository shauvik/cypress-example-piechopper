# Sample to demonstrate cypress stubbing flakiness

To run, just clone this repo and run `cypress run`. It's flaky; So, you might need to run more than once.

Eventually one of the "Sharing Results" tests fails and generates a screenshot in `cypress/screenshot`.

### Error Message: 
```
CypressError: Timed out retrying: cy.wait() timed out waiting 5000ms for the 1st request to the route: 'proposal'. No request ever occured.
```

### Insights:
I built the example app using grunt and added the `build` dir to git. 
* The app that the tests run against is inside `build/served`. 
* I changed the `index.html` of the generated code to add a function that injects our recording script which is called from `beforeEach()` of the [test](https://github.com/shauvik/cypress-example-piechopper/blob/master/cypress/integration/app_spec.js). This part seems to work well.
* Since everything is stubbed, we don't need to run the server for this test. 
* The tests in "Sharing Results" are what flake due to a timeout, although the request is sent.
Screenshots are also on git [here](https://github.com/shauvik/cypress-example-piechopper/tree/master/cypress/screenshots) but as you pointed out, they don't all the info due to the preceding tests occupying the screen.

<hr>
# PieChopper [![Travis CI](https://travis-ci.org/cypress-io/cypress-example-piechopper.svg?branch=master)](https://travis-ci.org/cypress-io/cypress-example-piechopper) [![Circle CI](https://circleci.com/gh/cypress-io/cypress-example-piechopper.svg?style=svg)](https://circleci.com/gh/cypress-io/cypress-example-piechopper)

![piechopper-gif](https://cloud.githubusercontent.com/assets/1268976/12985444/ad14159c-d0c0-11e5-8e50-2b64a1d389ac.gif)

## Installing

```bash
## install the node_modules
npm install
```

## Development

```bash
## build the app files (once)
npm run build

## start the local webserver
npm start

## if you modify the app source files and
## want the files to auto build (optional)
npm run watch
```

## navigate your browser to
http://localhost:8080

## Running Tests in Cypress

- [Install Cypress](https://on.cypress.io/guides/installing-and-running#section-installing)
- [Add the `cypress-example-piechopper` folder as a project](https://on.cypress.io/guides/installing-and-running#section-adding-projects) in Cypress.
- Click `app_spec.js` or `Run All Tests` in the Cypress runner.
- [Read how to setup Continous Integration in CircleCI](https://on.cypress.io/guides/continuous-integration).

