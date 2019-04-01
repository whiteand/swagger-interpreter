const PARAMETER_LOCATION = {
  PATH: 'path',
  HEADER: 'header',
  QUERY: 'query',
  BODY: 'body',
  FORM_DATA: 'formData',
};

const PARAMETER_TYPE = {
  STRING: 'string',
  ARRAY: 'array',
  INTEGER: 'integer',
  FILE: 'file',
  OBJECT: 'object',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
};
const url = '/api/backoffice/matchings';
const method = 'get';
module.exports = {
  PARAMETER_LOCATION,
  PARAMETER_TYPE,
  TAB_SIZE: 2,
  endpointSearchData: `${url} ${method}`,
};
