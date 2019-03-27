const { PARAMETER_TYPE } = require('./constants')
const valueToTypescriptDefinitions = require('./valueToTypescriptDefinitions')

const payloadTypes = endpointData => {
  const properties = endpointData.parameters.reduce((dict, parameter) => ({
    ...dict,
    [parameter.name]: parameter.type
  }), {});
  return valueToTypescriptDefinitions({ 
    type: PARAMETER_TYPE.OBJECT,
    properties
  }, endpointData.payloadTypeName);
};

const responseTypes = endpointData => {
  return valueToTypescriptDefinitions(endpointData.response, endpointData.responseTypeName);
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
