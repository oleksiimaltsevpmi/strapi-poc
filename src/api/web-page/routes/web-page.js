'use strict';

/**
 * web-page router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::web-page.web-page');
