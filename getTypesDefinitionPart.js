const { PARAMETER_TYPE } = require('./constants')
const insplog = require('./insplog')
const { bfs } = require('js-bfs')
const valueToTypescriptTypes = require('./valueToTypescriptTypes')

const payloadTypes = endpointData => {
  if (endpointData.parameters.length === 0) {
    return ''
  }

  const properties = endpointData.parameters.reduce((dict, parameter) => ({
    ...dict,
    [parameter.name]: parameter.type
  }), {});
  const res = valueToTypescriptTypes({ 
    type: PARAMETER_TYPE.OBJECT,
    properties
  }, endpointData.payloadTypeName);
  const additionalDeclarations = []
  bfs(res, (node) => {
    if (!node) return
    if (!node.outerTypes) return
    additionalDeclarations.push(...node.outerTypes)
  })

  return [
    ...additionalDeclarations.reverse().map(t => t.declaration),
    res.declaration
  ].join('\n\n')
};

const responseTypes = endpointData => {
  const { response } = endpointData
  if (!response.type) {
    return ''
  }
  const res = valueToTypescriptTypes(response, endpointData.responseTypeName)
  const additionalDeclarations = []
  bfs(res, (node) => {
    if (!node) return
    if (!node.outerTypes) return
    additionalDeclarations.push(...node.outerTypes)
  })

  return [
    ...additionalDeclarations.reverse().map(t => t.declaration),
    res.declaration
  ].join('\n\n')
};

const functionDeclaration = ({ funcTypeName, payloadTypeName, responseTypeName }) => {
  return `type ${funcTypeName} = (payload: ${payloadTypeName}) => Promise<${responseTypeName}>`
};

module.exports = endpointData => {
  return `
// TYPE DEFINITIONS PART-----------------------------------------
${payloadTypes(endpointData)}

${responseTypes(endpointData)}
  `.trim();
};
