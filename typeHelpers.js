const R = require("ramda");
const { bfs } = require("js-bfs");
const { v } = require("explained-quartet");
const insplog = require('./insplog')
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
  if (!definition) return definition
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
    const prevType = R.omit(['$ref'], R.path(schemaPath, definition))
    definition = R.assocPath(schemaPath, R.merge(prevType, type), definition)
  }
  return definition;
}

const mergeSchemaToType = obj => {
  if (typeof obj !== 'object' || !obj) return obj
  let nodePaths = []
  bfs(obj, (node, nodePath) => {
    if (!node) return
    if (typeof node !== 'object') return
    if (!node.schema || typeof node.schema !== 'object') return
    nodePaths.push(nodePath)
  })
  
  for (let i = nodePaths.length - 1; i >= 0 ; i-=1) {
    const nodePath = nodePaths[i]
    const { schema, ...node } = R.path(nodePath, obj)
    const newNode = { ...node, ...schema }
    obj = R.assocPath(nodePath, newNode, obj)
  }

  return obj
}

module.exports = { getTypeByRef, replaceInnerRefsWithDefinitions, mergeSchemaToType }
