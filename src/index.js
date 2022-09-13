'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // const service = strapi.service('api::config-builder.config-builder');
    // const response = await service.screens();
    //
    // console.log(JSON.stringify(response, null, 2));
    // console.log();
    // console.log(strapi);
  },
};
