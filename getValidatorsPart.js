const { bfs } = require('js-bfs');
const _ = require('lodash');
const tab = require('./tab');
const { PARAMETER_TYPE } = require('./constants');

// eslint-disable-next-line
const getArraySchema = t => `v.arrayOf(${getSchema(t.items)})`;

const getObjectSchema = (t) => {
  const propertiesList = [];
  if (!t.properties) {
    return '"object!"';
  }
  const entries = Object.entries(t.properties);
  for (let i = 0; i < entries.length; i += 1) {
    const [propName, propType] = entries[i];
    // eslint-disable-next-line
    const propSchema = getSchema(propType, propName);
    propertiesList.push(`${JSON.stringify(propName)}: ${propSchema}`);
  }
  const propertyPart = propertiesList.join(',\n');
  return `{\n${tab(propertyPart)}\n}`;
};

function getSchema(t, propName = 'Response') {
  if (!t.type) return '() => true';
  if (t.type === PARAMETER_TYPE.ARRAY) {
    return getArraySchema(t);
  }
  if (t.type === PARAMETER_TYPE.INTEGER) return '"safe-integer"';
  if (t.type === PARAMETER_TYPE.STRING && !t.enum) return '["string", "null"]'; // TODO: Add enum
  if (t.type === PARAMETER_TYPE.STRING && t.enum) {
    const enumTypeConstantsName = _.upperFirst(propName);
    return `checkEnumResponse(${enumTypeConstantsName})`;
  }
  if (t.type === PARAMETER_TYPE.FILE) return '"string"';
  if (t.type === PARAMETER_TYPE.BOOLEAN) return '"boolean"';
  if (t.type === PARAMETER_TYPE.OBJECT) return getObjectSchema(t);
  if (t.type === PARAMETER_TYPE.NUMBER) return '"finite"';
  return '"required"';
}
const getPayloadValidator = (endpointData) => {
  const fieldsValidators = [];
  const { parameters } = endpointData;
  for (let i = 0; i < parameters.length; i += 1) {
    const param = parameters[i];
    fieldsValidators.push(
      `${JSON.stringify(param.name)}: ${getSchema(param.type)}`,
    );
  }
  const objSchema = `{\n${tab(fieldsValidators.join(',\n'))}\n}`;
  return `const checkPayload = v(${objSchema})`;
};
const getResponseValidator = (data) => {
  const res = `const checkResponse = v(${getSchema(
    data.response,
  )})`;
  return res;
};

const hasEnumCheck = (endpointData) => {
  if (!endpointData.hasResponse && !endpointData.hasPayload) return false;
  let hasEnums = false;
  bfs(endpointData, (node) => {
    if (!node || !node.type || !node.enum) return;
    hasEnums = true;
  });
  return hasEnums;
};

const getEnumCheckerPart = () => `
const checkEnumResponse = (constants, separator = ",") => value => {
  if (value === 0) return true
  if (typeof value !== 'string') return false
  const validValues = Object.values(constants)
  const isValidValue = value => validValues.includes(value)
  return value
    .split(separator)
    .every(isValidValue);
}
    
`.trim();

module.exports = (endpointData) => {
  const { hasResponse, hasPayload } = endpointData;
  if (!hasResponse && !hasPayload) return '';
  const res = [];
  if (hasEnumCheck(endpointData)) {
    res.push(getEnumCheckerPart());
  }
  if (hasPayload) res.push(getPayloadValidator(endpointData));
  if (hasResponse) res.push(getResponseValidator(endpointData));

  return res.join('\n\n');
};
