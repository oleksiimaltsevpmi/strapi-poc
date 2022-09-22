const _ = require('lodash');
'use strict';

/**
 * config-builder service
 */

function deepOmit(obj, keysToOmit) {
  var keysToOmitIndex =  _.keyBy(Array.isArray(keysToOmit) ? keysToOmit : [keysToOmit] ); // create an index object of the keys that should be omitted

  function omitFromObject(obj) { // the inner function which will be called recursivley
    return _.transform(obj, function(result, value, key) { // transform to a new object
      if (key in keysToOmitIndex) { // if the key is in the index skip it
        return;
      }

      result[key] = _.isObject(value) ? omitFromObject(value) : value; // if the key is an object run it through the inner function - omitFromObject
    })
  }

  return omitFromObject(obj); // return the inner function result
}

function replaceKeysDeep(obj, keysMap) { // keysMap = { oldKey1: newKey1, oldKey2: newKey2, etc...
  return _.transform(obj, function(result, value, key) { // transform to a new object

    var currentKey = keysMap[key] || key; // if the key is in keysMap use the replacement, if not use the original key

    result[currentKey] = _.isObject(value) ? replaceKeysDeep(value, keysMap) : value; // if the key is an object run it through the inner function - replaceKeys
  });
}

const formatToModelView = (response) => {
  let result = {...response};
  const coreFields = ["meta", "type", "componentId"]
  let resultFormatted = { model: {} };

  Object.keys(result).forEach((key, index) => {
    const value = result[key];

    if (coreFields.includes(key)) {
      resultFormatted[key] = value;
    } else {
      resultFormatted.model[key] = value;
    }
  })

  return resultFormatted;
}

const transformResponse = (response) => {
  let result = {...response};

  const coreFields = ["meta", "type", "componentId"]
  const ignoreFields = ["id", "__component"]

  result.components = response.blocks;

  let resultComponents = [];

  result.components.forEach((component) => {
    let block = component;
    let blockFormatted = { model: {} };
    block.componentId = block.type;

    Object.keys(block).forEach((key, index) => {
      const value = block[key];
      if (ignoreFields.includes(key)) {
        return;
      }

      if (coreFields.includes(key)) {
        blockFormatted[key] = value;
      } else {
        blockFormatted.model[key] = value;
      }
    })

    resultComponents.push(blockFormatted);
  })

  result.components = resultComponents;

  result = deepOmit(result, ['publishedAt', 'createdAt', 'updatedAt'])

  delete result.blocks;

  return result;
}

const fn = (container, block) => {
  const coreFields = ["meta", "type", "componentId"];
  const renameKeys = {'componentId' : 'id', 'screenId': 'id'};

  container = deepOmit(container, ['publishedAt', 'createdAt', 'updatedAt', 'body'])
  container = deepOmit(container, ['id']);

  container.tabBar = {
    items: deepOmit(container.tabBar, ['__component']),
    type: 'TabBar',
  }

  container.id = container.screenId;
  delete container.screenId;

  let screen = transformResponse(block);

  screen.parentScreenId = container.id;

  screen = replaceKeysDeep(screen, renameKeys);
  container = replaceKeysDeep(container, { 'componentId': 'id' });

  return [container, screen];
}

module.exports = () => ({
  screensWeb: async (ctx, next) => {

    const response = await strapi.entityService.findOne('api::web-page.web-page', 1, { populate: "deep" });

    return {
      rootScreen: 'Login',
      screens: [transformResponse(response)],
    }
  },

  screensMobile: async (ctx, next) => {
    const response = await strapi.entityService.findOne('api::mobile-page.mobile-page', 2, { populate: "deep" });
    let layoutResponse = await strapi.entityService.findOne('api::mobile-layout.mobile-layout', 1, { populate: "deep" });

    const coreFields = ["meta", "type", "componentId"];
    const renameKeys = {'componentId' : 'id', 'screenId': 'id'};

    layoutResponse = deepOmit(layoutResponse, ['id', 'publishedAt', 'createdAt', 'updatedAt', 'body'])

    let screen = transformResponse(response);

    screen = replaceKeysDeep(screen, renameKeys);
    layoutResponse = replaceKeysDeep(layoutResponse, { 'componentId': 'id' });

    let result = { ...layoutResponse, ...screen };

    const home = await strapi.entityService.findOne('api::mobile-page.mobile-page', 3, { populate: "deep" });
    let homeContainer = await strapi.entityService.findOne('api::home-container.home-container', 1, { populate: "deep" });

    const resultHomePage = fn(homeContainer, home)

    return {
      rootScreen: 'LoginScreen',
      screens: [
        result,
        ...resultHomePage,
      ],
    }
  }
});
