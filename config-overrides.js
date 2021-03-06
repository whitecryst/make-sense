const {
    override,
    addDecoratorsLegacy,
    disableEsLint
  } = require("customize-cra");

  /*module.exports = function override(config, env) {
    
    config = rewireLess.withLoaderOptions({
            javascriptEnabled: true,
    })(config, env);
    
    return config;
};*/

  module.exports = override(
    // enable legacy decorators babel plugin
    addDecoratorsLegacy(),
  
    // disable eslint in webpack
    disableEsLint()
  );
