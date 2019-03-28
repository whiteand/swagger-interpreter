const { replaceInnerRefsWithDefinitions, mergeSchemaToType } = require('./typeHelpers')
module.exports = function getResponse(rawResponse, swaggerData) {
  return mergeSchemaToType(replaceInnerRefsWithDefinitions(rawResponse, swaggerData))
}