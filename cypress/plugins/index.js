/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)


//For image comparison
const {
  addMatchImageSnapshotPlugin,
} = require('cypress-image-snapshot/plugin');
const {tagify} = require('cypress-tags');

module.exports = (on, config) => {
  addMatchImageSnapshotPlugin(on, config);
  require('cypress-grep/src/plugin')(config);
    on('file:preprocessor', tagify(config));
    return config
}

//For Cucumber Integration
const createEsbuildPlugin = require('@badeball/cypress-cucumber-preprocessor/esbuild').createEsbuildPlugin;
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const nodePolyfills = require('@esbuild-plugins/node-modules-polyfill').NodeModulesPolyfillPlugin;
const addCucumberPreprocessorPlugin = require('@badeball/cypress-cucumber-preprocessor').addCucumberPreprocessorPlugin;
module.exports = async (on, config) => {
  await addCucumberPreprocessorPlugin(on, config); // to allow json to be produced
  // To use esBuild for the bundler when preprocessing
  on(
      'file:preprocessor',
      createBundler({
        plugins: [nodePolyfills(), createEsbuildPlugin(config)],
      }),
  );
  return config;
}

//For Adding Tags to Tests
const selectTestsWithGrep = require('cypress-select-tests/grep')