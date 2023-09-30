import promisify from 'cypress-promise';

const mapAssetsObjectToIdAndTypeArray = assetsObject =>
  Object.entries(assetsObject).flatMap(([assetTypePrular, assetsArray]) => {
    const assetType = assetTypePrular.replace(/s$/, '');
    console.log(assetType);
    return assetsArray.map(({ _id }) => ({
      _id,
      type: assetType === 'folder' ? 'workspacefolder' : assetType,
    }));
  });

export const deleteAssets = assets =>
  cy.request('POST', '/api/asset/delete', { assets });

export const fetchWorkspaces = async () =>
  await promisify(
    cy.request('GET', '/api/workspace/summary').then(({ body }) => body)
  );

export const fetchPresentations = async () =>
  await promisify(
    cy.request('GET', '/api/presentation').then(({ body }) => body)
  );

export const fetchSurveys = async () =>
  await promisify(cy.request('GET', '/api/survey').then(({ body }) => body));

export const fetchMetamodels = async () =>
  await promisify(cy.request('GET', '/api/metamodel').then(({ body }) => body));

export const fetchScenarios = async () =>
  await promisify(cy.request('GET', '/api/scenario').then(({ body }) => body));

export const fetchFolders = async () =>
  await promisify(
    cy.request('GET', '/api/workspacefolder').then(({ body }) => body)
  );
export const fetchReports = async () =>
    await promisify(
        cy.request('GET', '/api/report').then(({ body }) => body)
    );

export const fetchDashboard = async () =>
    await promisify(
        cy.request('GET', '/api/dashboard').then(({ body }) => body)
    );


export const fetchAllAssets = () =>
  Promise.all([
    fetchWorkspaces(),
    fetchPresentations(),
    fetchSurveys(),
    fetchMetamodels(),
    fetchScenarios(),
    fetchFolders(),
      fetchReports(),
      fetchDashboard(),
  ]).then(
    ([workspaces, presentations, surveys, metamodels, scenarios, folders,reports,dashboards]) => ({
      workspaces,
      presentations,
      surveys,
      metamodels,
      scenarios,
      folders,
        reports,
        dashboards
    })
  );

export const deleteAllAssetsAndFolders = () =>
  fetchAllAssets().then(assetsObject => {
    const idAndTypeAssetsArray = mapAssetsObjectToIdAndTypeArray(assetsObject);
    return deleteAssets(idAndTypeAssetsArray);
  });

export const loginUser = ({ email, password }) =>
  cy
    .request('POST', '/login', {
      email,
      password,
      remember: false,
      url: null,
    })
    .then(response => {
      expect(response.status).to.eq(200);
    });

export const logoutUser = () => cy.request('GET', '/logout');

export const createFolder = folderName =>
  cy.request('POST', '/api/workspacefolder', {
    name: folderName,
    description: '',
    content: [],
    workspaces: [],
  });

let persistedWorkspaceModels = null;
const fetchWorkspaceModels = ({ forceRequest = false } = {}) =>
  persistedWorkspaceModels && !forceRequest
    ? new Cypress.Promise(resolve => resolve(persistedWorkspaceModels))
    : cy.request('GET', '/api/model?includeCommon=true').then(({ body }) => {
        persistedWorkspaceModels = body;
        return body;
      });

let persistedWorkspaceId = null;
let persistedWorkspaceResponse = null;
let persistedComponentResponse = null;
let persistedComponentId = null;

const createWorkspaceRequest = ({
  name,
  views,
  model,
  description = '',
  startView = null,
}) =>
  cy
    .request({
      method: 'POST',
      url: '/api/workspace/create',
      failOnStatusCode: false,
      body: {
        name: name || model.name,
        views: views || model.defaultViews,
        componentTemplate: model._id,
        description,
        startView: 'blockDiagram',
      },
    })
    .then(response => {
      persistedWorkspaceResponse = response.body;
      return response.body;
    });

export const createWorkspace = (name, modelName) => {
  var workspaceId = null;
  fetchWorkspaceModels().then(workspaceModels => {
    const model = workspaceModels.find(({ name }) => name === modelName);
    if (model) {
      createWorkspaceRequest({ name, model }).then(workspaceResponse => {
        persistedWorkspaceId = JSON.parse(JSON.stringify(workspaceResponse));
        workspaceId = persistedWorkspaceId.workspace._id;
        const modelId = workspaceResponse.workspace.componentModel;
        const typeId = workspaceResponse.model.root.id;
        createComponents({
          modelId,
          workspaceId,
          typeId,
          componentName: 'AutoComponent1',
        }).then(componentResponse => {
          persistedComponentId = JSON.parse(JSON.stringify(componentResponse));
          const componentFrom = persistedComponentId._id;
          createComponents({
            modelId,
            workspaceId,
            typeId,
            componentName: 'AutoComponent2',
          }).then(componentResponse => {
            persistedComponentId = JSON.parse(
              JSON.stringify(componentResponse)
            );
            
            const componentTo = persistedComponentId._id;
           
            createReference(componentFrom, componentTo, workspaceId);
            createComponents({
              modelId,
              workspaceId,
              typeId,
              componentName: 'AutoComponent3',
            }).then(componentResponse => {
              persistedComponentId = JSON.parse(
                JSON.stringify(componentResponse)
              );    });    
              });
        });
        return cy.wrap(workspaceId).as('workspaceID');
      });
    } else {
      throw new Error(
        `Workspace template "${modelName}" not found. Please choose one of:
        \n${workspaceModels.map(({ name }) => `"${name}"`).join(',\n')}.`
      );
    }
  });
};

export const createComponents = ({ modelId, workspaceId, typeId, componentName }) =>
  cy
    .request('POST', '/api/component', {
      name: componentName,
      model: modelId,
      description: '',
      parent: null,
      typeId: typeId,
      rootWorkspace: workspaceId,
      type: 'Application',
      _order: 1,
    })
    .then(response => {
      persistedComponentResponse = response.body;
      return response.body;
    });

const createReference = (componentFrom, componentTo, workspaceId) =>
  cy
    .request('POST', '/api/reference', {
      source: componentFrom,
      target: componentTo,
      type: 2,
      order: 0,
      description: 'Ref1',
      rootWorkspace: workspaceId,
    })
    .then(response => {
      persistedComponentResponse = response.body;
      return response.body;
    });

const createField = modelId =>
  cy
    .request('POST', '/api/field', {
      label: 'NewField_1',
      model: modelId,
      _order: 10000,
      type: 'Text',
      global: false,
      componentType: [],
      referenceType: [],
      description: 'NewFieldCreatedByApi',
    })
    .then(response => {
      persistedComponentResponse = response.body;
      return response.body;
    });