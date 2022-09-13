'use strict';

/**
 * web-page service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::web-page.web-page');
