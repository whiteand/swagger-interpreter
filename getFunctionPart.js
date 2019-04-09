const { bfs } = require('js-bfs');
const R = require('ramda');
const _ = require('lodash');
const { PARAMETER_LOCATION } = require('./constants');
const tab = require('./tab');

const axiosRequestGenerator = (method, params, hasResponse) => {
  let res = `${
    hasResponse ? 'const { data: response } = ' : ''
  }await axios.${method.toLowerCase()}`;
  const isSoLong = params.join(', ').length > 40;
  res = isSoLong
    ? `${res}(\n${tab(params.join(',\n'))}\n)`
    : `${res}(${params.join(', ')})`;

  return res;
};

const getAxiosParams = (method, parameters) => {
  let res = ['URL', null, null];
  const configIndex = ['post', 'put', 'patch'].includes(method) ? 2 : 1;
  const headersLens = R.lensPath([configIndex, 'headers']);
  const queryLens = R.lensPath([configIndex, 'query']);
  const bodyLens = R.lensPath(
    ['post', 'put', 'patch'].includes(method) ? [1] : [1, 'data'],
  );
  for (let i = 0; i < parameters.length; i += 1) {
    const p = parameters[i];
    // eslint-disable-next-line
    if (p.location === PARAMETER_LOCATION.PATH) continue;
    // eslint-disable-next-line
    if (p.location === PARAMETER_LOCATION.FORM_DATA) continue;
    if (p.location === PARAMETER_LOCATION.BODY) {
      res = R.over(
        bodyLens,
        R.ifElse(Boolean, R.append(p.name), R.always([p.name])),
        res,
      );
    }
    if (p.location === PARAMETER_LOCATION.QUERY) {
      res = R.over(
        queryLens,
        R.ifElse(Boolean, R.append(p.name), R.always([p.name])),
        res,
      );
    }
    if (p.location === PARAMETER_LOCATION.HEADER) {
      res = R.over(
        headersLens,
        R.ifElse(Boolean, R.append(p.name), R.always([p.name])),
        res,
      );
    }
  }

  if (parameters.some(p => p.location === PARAMETER_LOCATION.FORM_DATA)) {
    res = R.over(
      headersLens,
      R.ifElse(
        Boolean,
        R.append("'Content-type': 'multipart/form-data'"),
        R.always(["'Content-type': 'multipart/form-data'"]),
      ),
      res,
    );
    res[1] = 'formData';
  }

  while (res[res.length - 1] === null) {
    res.splice(-1, 1);
  }

  const transformToString = (value) => {
    if (typeof value === 'string') return value;
    if (value === null) return 'null';
    const json = JSON.stringify(value);
    return json
      .replace(/\[/g, '{')
      .replace(/\]/g, '}')
      .replace(/"/g, '')
      .replace(/\{/g, '{ ')
      .replace(/\}/g, ' }')
      .replace(/:\{/g, ': {')
      .replace(/,/g, ', ')
      .split("'")
      .join("'");
  };

  const stringRes = res.map(transformToString);
  return stringRes;
};

const getUrlPart = (parameters, url) => {
  const isDynamicUrl = parameters.some(
    p => p.location === PARAMETER_LOCATION.PATH,
  );
  const insertValuesIntoUrl = str => `\`${str.replace(/{/g, '${payload.')}\``;
  const urlPart = `const URL = ${
    isDynamicUrl ? insertValuesIntoUrl(url) : JSON.stringify(url)
  }`;
  return urlPart;
};

const getDestructuring = (parameters) => {
  const parametersNames = parameters
    .filter(p => p.location !== PARAMETER_LOCATION.PATH)
    .map(p => p.name);

  const isSoLong = parametersNames.length > 40;

  const result = isSoLong
    ? `const {\n${tab(parametersNames.join(',\n'))}\n} = payload`
    : `const { ${parametersNames.join(', ')} } = payload`;
  return result;
};

const makeFormData = (parameters) => {
  const res = ['const formData = new FormData()', ''];

  for (let i = 0; i < parameters.length; i += 1) {
    const p = parameters[i];
    if (
      ![PARAMETER_LOCATION.BODY, PARAMETER_LOCATION.FORM_DATA].includes(
        p.location,
      )
    ) {
      // eslint-disable-next-line
      continue;
    }
    res.push(`formData.append(${JSON.stringify(p.name)}, ${p.name})`);
  }

  return res.join('\n');
};

const doRequestPart = (data, hasPayload, hasResponse) => {
  const axiosMethod = data.method.toLowerCase();
  const axiosParameters = getAxiosParams(axiosMethod, data.parameters);
  const hasFormData = data.parameters.some(
    p => p.location === PARAMETER_LOCATION.FORM_DATA,
  );
  const res = [
    getUrlPart(data.parameters, data.path),
    getDestructuring(data.parameters),
    ...(hasFormData ? [makeFormData(data.parameters)] : []),
    axiosRequestGenerator(axiosMethod, axiosParameters, hasResponse),
  ].join('\n');
  return res;
};

const deserializePart = (data) => {
  const listOfEnumPaths = [];
  const getExamplePath = path => `// response${path.reduce((p, item) => {
    if (item === 'items') return `${p}[]`;
    if (item === 'properties') return p;
    return `${p}.${item}`;
  }, '')}`;
  bfs(data.response, (node, nodePath) => {
    if (!node || !node.type || !node.enum) return;
    listOfEnumPaths.push(getExamplePath(nodePath));
  });
  const comments = `
${listOfEnumPaths.length > 0 ? '// TODO: write deserialization for enum string lists:' : ''}
${listOfEnumPaths.join(';\n')}
  `.trim();
  return comments;
};

function getBody(data) {
  const hasPayload = data.parameters.length > 0;
  const hasResponse = Boolean(data.response.type);
  const getValidationPart = (variableName, message) => `
v.clearContext()
if (!check${_.upperFirst(variableName)}(${variableName})) {
  console.debug(v.explanation)
  throw new TypeError(${JSON.stringify(message)})
}
  `.trim();
  return [
    hasPayload
      ? getValidationPart('payload', `Wrong ${data.apiModuleName} payload`)
      : '',
    doRequestPart(data, hasPayload, hasResponse), // transforms payload to right axios request
    ...(hasResponse
      ? [
        getValidationPart('response', `Wrong ${data.apiModuleName} response`),
        deserializePart(data),
        `return response as ${data.responseTypeName}`,
      ]
      : []),
  ].join('\n\n');
}
module.exports = (endpointData) => {
  const name = endpointData.apiModuleName;
  const parametersPart = endpointData.parameters.length > 0
    ? `payload: ${endpointData.payloadTypeName}`
    : '';
  const resultType = endpointData.response.type !== null
    ? endpointData.responseTypeName
    : 'void';
  const body = getBody(endpointData);
  return `
// FUNCTION PART-------------------------------------------------
// url: ${endpointData.path}, method: ${endpointData.method}
export async function ${name}(${parametersPart}): Promise<${resultType}> {
${tab(body, 1)}
}
  `.trim();
};
