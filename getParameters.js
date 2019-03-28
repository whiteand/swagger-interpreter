const { replaceInnerRefsWithDefinitions, mergeSchemaToType } = require('./typeHelpers')

module.exports = function getParameters(rawParameters, swaggerData) {
  // TODO: write this
  return rawParameters.map(param => {
    const { name, in: location, required, ...type } = param;
    return {
      name,
      type: mergeSchemaToType(replaceInnerRefsWithDefinitions(type, swaggerData)),
      location,
      required,
    };
  });
};
