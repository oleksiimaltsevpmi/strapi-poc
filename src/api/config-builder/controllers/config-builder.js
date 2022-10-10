'use strict';

/**
 * A set of functions called "actions" for `config-builder`
 */
const signUpJson = require('./sign-up-otp.json');

module.exports = {
  screensWeb: async (ctx, next) => {
    const service = strapi.service('api::config-builder.config-builder');
    return service.screensWeb();
  },
  screensMobile: async (ctx, next) => {
    const service = strapi.service('api::config-builder.config-builder');
    console.log(service);

    return service.screensMobile();
  },
  screensMobileOtpSignUp: async (ctx, next) => {
    return signUpJson
  }
};
