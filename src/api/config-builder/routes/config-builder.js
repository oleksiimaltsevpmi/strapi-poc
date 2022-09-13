module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/config-builder/screens',
     handler: 'config-builder.screens',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
