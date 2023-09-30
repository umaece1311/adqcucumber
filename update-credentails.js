const fs = require('fs');

const getCredentailsJSON = () => {
  const jsonString = fs.readFileSync('cypress.env.json');
  return JSON.parse(jsonString.toString());
};

const getEnvVars = () => process.env;

const getUpdatedCredentails = () => {
  const credJSON = getCredentailsJSON();
  const envVars = getEnvVars();

  credJSON.production.users.admin.email = envVars.ADMIN_EMAIL || '';
  credJSON.production.users.admin.password = envVars.ADMIN_PASSWORD || '';

  credJSON.production.users.writer.email = envVars.WRITER_EMAIL || '';
  credJSON.production.users.writer.password = envVars.WRITER_PASSWORD || '';

  credJSON.production.users.writer2.email = envVars.WRITER2_EMAIL || '';
  credJSON.production.users.writer2.password = envVars.WRITER2_PASSWORD || '';

  credJSON.production.users.reader.email = envVars.READER_EMAIL || '';
  credJSON.production.users.reader.password = envVars.READER_PASSWORD || '';

  credJSON.production.users.contributor.email = envVars.CONTRIBUTOR_EMAIL || '';
  credJSON.production.users.contributor.password = envVars.CONTRIBUTOR_PASSWORD || '';

  return credJSON;
};

const createCredentailsFile = () => {
  fs.writeFile(
    'cypress.env.json',
    JSON.stringify(getUpdatedCredentails(), null, 2),
    () => {
      console.log('Credentails JSON file has been created.');
    }
  );
};

createCredentailsFile();
