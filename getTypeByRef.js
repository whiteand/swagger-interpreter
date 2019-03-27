const R = require("ramda");
const { bfs } = require("js-bfs");
const { v } = require("explained-quartet");
const checkSchema = require("./checkSchema");

const isSchema = swaggerData => v.and(
  { $ref: 'string' },
  checkSchema(swaggerData)
)

function getTypeByRef(ref, swaggerData) {
  const path = ref.split("/").slice(1);
  const definition = R.path(path, swaggerData);
  const fullDefinition = replaceInnerRefsWithDefinitions(definition, swaggerData);
  return fullDefinition;
}

function replaceInnerRefsWithDefinitions(definition, swaggerData) {
  let innerSchemaPaths = []
  bfs(definition, (node, nodePath) => {
    if (!isSchema(swaggerData)(node)) {
      return
    }
    innerSchemaPaths.push(nodePath)
  });
  for (let schemaPath of innerSchemaPaths) {
    const schemaRef = R.path([...schemaPath, '$ref'], definition)
    const type = getTypeByRef(schemaRef, swaggerData)
    definition = R.assocPath(schemaPath, type, definition)
  }
  return definition;
}

module.exports = getTypeByRef;
