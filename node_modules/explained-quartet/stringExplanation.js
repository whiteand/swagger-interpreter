const quartet = require("quartet");
const TYPES = quartet();

const getPath = require('./getPath')

const renderStringSchemaToExplanation = (value, schema, ...path) => {
  const strPath = getPath(path);
  return `${strPath} is not a ${schema}`;
};
/* eslint-disable no-use-before-define */
const SCHEMA_TO_STRING = {
  [TYPES.ENUM]: schema => schema.extra.schema.map(JSON.stringify).join("|"),
  [TYPES.ARRAY_OF]: schema => {
    const innerType = schemaToString(schema.extra.schema);
    return /[^a-zA-Z_]/.test(innerType) ? `(${innerType})[]` : `${innerType}[]`;
  },
  [TYPES.DICTIONARY_OF]: schema => {
    const innerType = schemaToString(schema.extra.schema);
    return `Dict<${innerType}>`;
  },
  [TYPES.MIN]: schema => `min(${schema.extra.schema})`,
  [TYPES.MAX]: schema => `max(${schema.extra.schema})`,
  [TYPES.REGEX]: schema => `regex(${schema.extra.schema})`,
  [TYPES.AND]: schema =>
    `AND(${schema.extra.schema.map(schemaToString).join(", ")})`
};
/* eslint-enable no-use-before-define */
function schemaToString(schema) {
  if (typeof schema === "string") return schema;
  if (Array.isArray(schema)) return schema.map(schemaToString).join("|");
  if (typeof schema === "object") {
    const innerPropsDescription = Object.entries(schema)
      .map(([key, innerSchema]) => [key, schemaToString(innerSchema)])
      .reduce((prevProps, [key, value]) => {
        if (key === undefined) return prevProps;
        // eslint-disable-next-line
        return prevProps
          ? `${prevProps}; ${key}: ${value}`
          : `${key}: ${value}`;
      }, "");
    return `{ ${innerPropsDescription} }`;
  }
  if (typeof schema !== "function") return "valid";
  if (typeof schema.type !== "string") return "valid";
  if (!SCHEMA_TO_STRING[schema.type]) {
    return "valid";
  }
  return SCHEMA_TO_STRING[schema.type](schema);
}

const RENDER_FUNCTION_TO_EXPLANATION = {
  [TYPES.ENUM]: (value, schema, ...path) =>
    `${getPath(path)} is not one of ${schema.extra.schema
      .map(JSON.stringify)
      .join("|")}`,
  [TYPES.ARRAY_OF]: (value, schema, ...path) => {
    const strPath = getPath(path);

    if (typeof schema.extra.schema === "undefined") {
      return Array.isArray(value)
        ? undefined
        : `${strPath} is not a valid array`;
    }

    const innerSchemaText = schemaToString(schema.extra.schema);
    return /[^a-zA-Z_]/.test(innerSchemaText)
      ? `${strPath} is not (${innerSchemaText})[]`
      : `${strPath} is not ${innerSchemaText}[]`;
  },
  [TYPES.DICTIONARY_OF]: (value, schema, ...path) => {
    const strPath = getPath(path);
    if (schema.extra.schema === "undefined") {
      return `${strPath} is not a valid dictionary`;
    }
    const innerSchemaText = schemaToString(schema.extra.schema);
    return /[^a-zA-Z_]/.test(innerSchemaText)
      ? `${strPath} is not dictionary of (${innerSchemaText})`
      : `${strPath} is not dictionary of ${innerSchemaText}`;
  },
  [TYPES.MIN]: (value, schema, ...path) => {
    const strPath = getPath(path);
    if (schema.extra.schema === "undefined") {
      return `${strPath} is wrong because of v.min`;
    }
    const minValue = schema.extra.schema;
    switch (typeof value) {
      case "string":
      case "object":
        return `${strPath} must have at least ${minValue} length`;
      default:
        return `${strPath} must be not less than ${minValue}`;
    }
  },
  [TYPES.MAX]: (value, schema, ...path) => {
    const strPath = getPath(path);
    if (schema.extra.schema === "undefined") {
      return `${strPath} is wrong because of v.max`;
    }
    const maxValue = schema.extra.schema;
    switch (typeof value) {
      case "string":
      case "object":
        return `${strPath} must have at least ${maxValue} length`;
      default:
        return `${strPath} must be not less than ${maxValue}`;
    }
  },
  [TYPES.REGEX]: (value, schema, ...path) => {
    const strPath = getPath(path);
    if (schema.extra.schema === "undefined") {
      return `${strPath} is wrong because of v.regex`;
    }
    const regex = schema.extra.schema;
    return `${strPath} doesn't match ${regex}`;
  }
};

const renderFunctionSchemaToExplanation = (
  value,
  schema,
  ...path
) => {
  const renderer = RENDER_FUNCTION_TO_EXPLANATION[schema.type];
  return renderer ? renderer(value, schema, ...path) : undefined;
};

const defaultExplanation = (value, schema, ...path) => {
  if (path.length === 0) return `value is not ${schemaToString(schema)}`;

  if (typeof schema === "string")
    return renderStringSchemaToExplanation(value, schema, ...path);
  if (typeof schema === "function")
    return renderFunctionSchemaToExplanation(value, schema, ...path);
  return undefined;
};

module.exports = defaultExplanation