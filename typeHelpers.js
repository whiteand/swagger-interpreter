const R = require('ramda');
const { bfs } = require('js-bfs');
const { v } = require('explained-quartet');
const checkSchema = require('./checkSchema');

const isSchema = swaggerData => v.and({ $ref: 'string' }, checkSchema(swaggerData));

function getTypeByRef(ref, swaggerData) {
  const path = ref.split('/').slice(1);
  const definition = R.path(path, swaggerData);
  // eslint-disable-next-line
  const fullDefinition = replaceInnerRefsWithDefinitions(
    definition,
    swaggerData,
  );
  return fullDefinition;
}

function replaceInnerRefsWithDefinitions(definition, swaggerData) {
  if (!definition) return definition;
  let res = definition;
  const innerSchemaPaths = [];
  bfs(definition, (node, nodePath) => {
    if (!isSchema(swaggerData)(node)) {
      return;
    }
    innerSchemaPaths.push(nodePath);
  });

  for (let i = 0; i < innerSchemaPaths.length; i += 1) {
    const schemaPath = innerSchemaPaths[i];
    const schemaRef = R.path([...schemaPath, '$ref'], res);
    const type = getTypeByRef(schemaRef, swaggerData);
    const prevType = R.omit(['$ref'], R.path(schemaPath, res));
    res = R.assocPath(schemaPath, R.merge(prevType, type), res);
  }
  return res;
}

const mergeSchemaToType = (obj) => {
  if (typeof obj !== 'object' || !obj) return obj;
  let res = obj;
  const nodePaths = [];
  bfs(obj, (node, nodePath) => {
    if (!node) return;
    if (typeof node !== 'object') return;
    if (!node.schema || typeof node.schema !== 'object') return;
    nodePaths.push(nodePath);
  });

  for (let i = nodePaths.length - 1; i >= 0; i -= 1) {
    const nodePath = nodePaths[i];
    const { schema, ...node } = R.path(nodePath, res);
    const newNode = { ...node, ...schema };
    res = R.assocPath(nodePath, newNode, res);
  }

  return res;
};

module.exports = {
  getTypeByRef,
  replaceInnerRefsWithDefinitions,
  mergeSchemaToType,
};
