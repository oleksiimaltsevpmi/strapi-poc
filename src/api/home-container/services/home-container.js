'use strict';

/**
 * home-container service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::home-container.home-container');
