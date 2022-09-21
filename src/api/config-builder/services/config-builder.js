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

  let loginBlock = result.components[0];
  let loginBlockFormatted = { model: {} };

  Object.keys(loginBlock).forEach((key, index) => {
    const value = loginBlock[key];
    if (ignoreFields.includes(key)) {
      return;
    }

    if (coreFields.includes(key)) {
      loginBlockFormatted[key] = value;
    } else {
      loginBlockFormatted.model[key] = value;
    }
  })

  loginBlockFormatted = deepOmit(loginBlockFormatted, ['id'])

  result.components = [loginBlockFormatted];

  result = deepOmit(result, ['publishedAt', 'createdAt', 'updatedAt'])

  delete result.blocks;

  return result;
}

const fn = (layout, block) => {
  const coreFields = ["meta", "type", "componentId"];
  const renameKeys = {'componentId' : 'id', 'screenId': 'id'};

  console.log("block", layout);

  layout = deepOmit(layout, ['publishedAt', 'createdAt', 'updatedAt', 'body'])
  layout = deepOmit(formatToModelView(layout), ['id']);

  layout.model.header = formatToModelView(layout.model.header);
  layout.model.tapBar = {
    model: {
      items: deepOmit(layout.model.tapBar, ['__component']),
      type: 'TapBar',
    }
  }

  let screen = transformResponse(block);

  screen = replaceKeysDeep(screen, renameKeys);
  layout = replaceKeysDeep(layout, { 'componentId': 'id' });

  return { ...layout, ...screen };
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
    layoutResponse = formatToModelView(layoutResponse);
    layoutResponse.model.navComponent = formatToModelView(layoutResponse.model.navComponent);

    let screen = transformResponse(response);

    screen = replaceKeysDeep(screen, renameKeys);
    layoutResponse = replaceKeysDeep(layoutResponse, { 'componentId': 'id' });

    let result = { ...layoutResponse, ...screen };

    const home = await strapi.entityService.findOne('api::mobile-page.mobile-page', 3, { populate: "deep" });
    let homeLayout = await strapi.entityService.findOne('api::home-container.home-container', 1, { populate: "deep" });

    const resultHomePage = fn(homeLayout, home)

    return {
      rootScreen: 'LoginScreen',
      screens: [
        result,
        resultHomePage,
      ],
    }
  }
});
