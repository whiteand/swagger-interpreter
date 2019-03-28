const { v } = require('explained-quartet')
const { PARAMETER_LOCATION, PARAMETER_TYPE } = require('./constants')
const getParameters = require('./getParameters')
const getResponse = require('./getResponse')
const checkSchema = require('./checkSchema')
const insplog = require('./insplog')
const R = require('ramda')

const checkParameter = swaggerData => v.and(
  {
    name: 'string',
    in: v.enum(...Object.values(PARAMETER_LOCATION)),
    required: 'boolean',
    type: v.enum(undefined, ...Object.values(PARAMETER_TYPE)),
    schema: [
      'undefined',
      v.and(
        {
          $ref: 'string',
        },
        checkSchema(swaggerData)
      )
    ]
  },
  param => param.type || param.schema
)
const check200Response = swaggerData => v([
  {
    schema: [
      'undefined',
      v.and(
        {
          $ref: 'string',
        },
        checkSchema(swaggerData)
      )
    ]
  },
  {
    type: v.enum(...Object.values(PARAMETER_TYPE))
  }])

const checkendPointDescription = swaggerData => v({
  parameters: v.arrayOf(checkParameter(swaggerData)),
  responses: {
    200: check200Response(swaggerData)
  }
})

const deserialize = (endpointDescription, swaggerData) => {
  v()
  if (!checkendPointDescription(swaggerData)(endpointDescription)) {
    console.log('Error while parsing endpoint data: ')
    insplog(v.explanation.join(';\n'))
    return null
  }
  const { path, method } = endpointDescription
  return {
    path,
    method,
    parameters: getParameters(endpointDescription.parameters, swaggerData),
    response: getResponse(endpointDescription.responses['200'], swaggerData)
  }
}

module.exports = (swaggerData, searchData) => {
  const [searchPath, searchMethod] = searchData.trim().split(/\s+/);
  if (![searchPath, searchMethod].every(Boolean)) {
    return null;
  }

  const { paths } = swaggerData;

  let pathEntry = Object.entries(paths).find(([path, value]) =>
    path === searchPath && Object.keys(value).includes(searchMethod.toLowerCase())
  );
  pathEntry = pathEntry || Object.entries(paths).find(([path, value]) =>
    path.includes(searchPath) && Object.keys(value).includes(searchMethod.toLowerCase())
  );
  if (!pathEntry) { 
    return null;
  }

  const [path, endpoints] = pathEntry;
  const endpointEntry = Object.entries(endpoints).find(([method]) =>
    method.toLowerCase().includes(searchMethod.toLowerCase())
  );

  if (!endpointEntry) {
    return null;
  }

  const [method, endpointDescription] = endpointEntry;
  const res = deserialize({
    ...endpointDescription,
    path,
    method
  }, swaggerData);
  // insplog(res)
  return res
};
