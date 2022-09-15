module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/config-builder/screens/mobile',
     handler: 'config-builder.screensMobile',
     config: {
       auth: false,
       policies: [],
       middlewares: [],
     },
    },
    {
     method: 'GET',
     path: '/config-builder/screens/web',
     handler: 'config-builder.screensWeb',
     config: {
       auth: false,
       policies: [],
       middlewares: [],
     },
    },
  ],
};
