'use strict';

/**
 * A set of functions called "actions" for `config-builder`
 */

module.exports = {
  screens: async (ctx, next) => {

    const response = await strapi.entityService.findOne('api::web-page.web-page', 1);

    return response;
    console.log(response);
    try {
      ctx.body = 'ok';
    } catch (err) {
      ctx.body = err;
    }
  }
};
