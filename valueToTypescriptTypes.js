const _ = require('lodash');
const R = require('ramda');
const { PARAMETER_TYPE } = require('./constants');
const tab = require('./tab');

const isAnyType = value => !value.type;
const isString = value => [PARAMETER_TYPE.STRING, PARAMETER_TYPE.FILE].includes(value.type)
  && !value.enum;
const isNumber = value => [PARAMETER_TYPE.NUMBER, PARAMETER_TYPE.INTEGER].includes(value.type);
const isArray = value => PARAMETER_TYPE.ARRAY === value.type;
const isObject = value => PARAMETER_TYPE.OBJECT === value.type;
const isBoolean = value => PARAMETER_TYPE.BOOLEAN === value.type;
const isEnum = value => value.type === PARAMETER_TYPE.STRING && value.enum;

/**
 *
 * @param {{}} value
 * @return {string} type of type
 */
function getType(value) {
  if (isAnyType(value)) {
    return 'any';
  }
  if (isString(value)) {
    return 'string';
  }
  if (isNumber(value)) {
    return 'number';
  }
  if (isArray(value)) {
    return 'array';
  }
  console.log(value, PARAMETER_TYPE.BOOLEAN);
  if (isBoolean(value)) {
    return 'boolean';
  }
  if (isObject(value)) {
    return 'object';
  }
  if (isEnum(value)) {
    return 'enum';
  }
  return 'any';
}

/**
 * @param {{}} value
 * @param {string} typeName
 * @returns {{
 *   typeName: string
 *   type: string
 *   declaration: string
 *   innerUsage: string,
 *   outerTypes: object[]
 * }}
 */
function valueToTypescriptTypes(value, typeName) {
  const type = getType(value);
  if (type === 'object') {
    // eslint-disable-next-line
    return objectToTypescriptDefinition(value, typeName);
  }

  if (type === 'array') {
    // eslint-disable-next-line
    return arrayToTypescriptDefinition(value, typeName);
  }

  if (type === 'enum') {
    // eslint-disable-next-line
    return enumToTypescriptDefinition(value, typeName);
  }

  if (type === 'string') {
    return {
      typeName,
      type: 'string',
      innerUsage: '(string | null)',
      declaration: 'type BackendString = string | null',
      outerTypes: [],
    };
  }
  console.log(value, type);

  if (type === 'boolean') {
    return {
      typeName,
      type: 'boolean',
      innerUsage: 'boolean',
      declaration: `type ${typeName} = ${type}`,
      outerTypes: [],
    };
  }

  return {
    typeName,
    type,
    declaration: `type ${typeName} = ${type}`,
    innerUsage: type,
    outerTypes: [],
  };
}

function enumToTypescriptDefinition(value, typeName) {
  const { enum: enumValues } = value;
  const body = enumValues
    .map(enumValue => `${enumValue} = ${JSON.stringify(enumValue)}`)
    .join(',\n');
  return {
    typeName,
    type: getType(value),
    declaration: `
enum ${typeName} {
${tab(body, 1)}
}

`.trim(),
    innerUsage: `${typeName}[]`,
    outerTypes: [],
  };
}

function objectToTypescriptDefinition(value, typeName) {
  const { properties } = value;
  if (Object.keys(properties).length === 0) {
    return {
      typeName,
      type: 'object',
      declaration: `type ${typeName} = {}`,
      innerUsage: 'object',
      outerTypes: [],
    };
  }
  const getPropTypeName = (propName) => {
    const propValue = value.properties[propName];
    if (propValue.enum) {
      return _.upperFirst(propName);
    }
    return `${typeName}${_.upperFirst(propName)}`;
  };

  const propsTypes = Object.entries(value.properties)
    .map(([propName, propValue]) => [
      propName,
      valueToTypescriptTypes(propValue, getPropTypeName(propName)),
    ])
    .reduce(
      (obj, [key, typescriptType]) => R.assoc(key, typescriptType, obj),
      {},
    );

  const propsPart = Object.keys(value.properties)
    .map(e => `${e}: ${propsTypes[e].innerUsage}`)
    .join('\n');
  const outerTypes = Object.values(propsTypes).reduce((outer, t) => {
    if (t.type === 'array') {
      outer.push(...t.outerTypes);
    }
    if (['object', 'enum'].includes(t.type)) {
      outer.push(t);
    }
    return outer;
  }, []);
  return {
    typeName,
    type: 'object',
    declaration: `type ${typeName} = {\n${tab(propsPart, 1)}\n}`,
    innerUsage: typeName,
    outerTypes,
  };
}

function arrayToTypescriptDefinition(value, typeName) {
  const itemTypeName = R.last(typeName) === 's' ? typeName.slice(0, -1) : `${typeName}Item`;

  const itemType = valueToTypescriptTypes(value.items, itemTypeName);
  if (!['object', 'enum', 'array'].includes(itemType.type)) {
    const innerUsage = `${itemType.innerUsage}[]`;
    return {
      typeName,
      type: 'array',
      declaration: `type ${typeName} = ${innerUsage}`,
      innerUsage,
      outerTypes: [],
    };
  }
  const innerUsage = `${itemTypeName}[]`;
  return {
    typeName,
    type: 'array',
    declaration: `type ${typeName} = ${innerUsage}`,
    innerUsage,
    outerTypes: [itemType],
  };
}

module.exports = {
  valueToTypescriptTypes,
  getType,
};
