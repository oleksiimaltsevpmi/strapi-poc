module.exports = ({ env }) => ({
  navigation: {
    enabled: true,
    config: {
      contentTypes: ['api::web-page.web-page'],
      contentTypesNameFields: {
        'api::web-page.web-page': ['title']
      },
      allowedLevels: 2,
    }
  }
});
