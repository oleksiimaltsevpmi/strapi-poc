'use strict';

/**
 * A set of functions called "actions" for `config-builder`
 */

module.exports = {
  screensWeb: async (ctx, next) => {
    const service = strapi.service('api::config-builder.config-builder');
    return service.screensWeb();
  },
  screensMobile: async (ctx, next) => {
    const service = strapi.service('api::config-builder.config-builder');
    console.log(service);

    return service.screensMobile();
  }
};
