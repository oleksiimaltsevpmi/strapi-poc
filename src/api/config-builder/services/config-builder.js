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

module.exports = () => ({
  screens: async (ctx, next) => {

    const response = await strapi.entityService.findOne('api::web-page.web-page', 1, { populate: "deep" });

    return {
      screens: [transformResponse(response)],
    }

    return response;
  }
});
