const tab = require("./tab");
const insplog = require("./insplog");
const { PARAMETER_LOCATION } = require("./constants");

const doRequestDict = {
  getheaders: ({ parameters, hasResponse }) => {
    const headerParamsNames = parameters
      .filter(p => p.location === PARAMETER_LOCATION.HEADER)
      .map(e => e.name);
    let res = [
      `const { ${headerParamsNames.join(", ")} } = payload`,
      (hasResponse ? "const response = " : "") +
        `await axios.get(URL, { headers: { ${headerParamsNames.join(", ")} } })`
    ].join("\n");
    return res;
  },
  patchheaders: ({ parameters, hasResponse }) => {
    const headerParamsNames = parameters
      .filter(p => p.location === PARAMETER_LOCATION.HEADER)
      .map(e => e.name);
    let res = [
      `const { ${headerParamsNames.join(", ")} } = payload`,
      (hasResponse ? "const response = " : "") +
        `await axios.patch(URL, null, { headers: { ${headerParamsNames.join(", ")} } })`
    ].join("\n");
    return res;
  }
};

const doRequestPart = (data, hasPayload, hasResponse) => {
  const isDynamicUrl = data.parameters.some(
    p => p.location === PARAMETER_LOCATION.PATH
  );
  const insertValuesIntoUrl = str =>
    "`" + str.replace(/{/g, "${payload.") + "`";
  const urlPart = isDynamicUrl
    ? `const URL = ${insertValuesIntoUrl(data.path)}`
    : JSON.stringify(data.path);
  const axiosMethod = data.method.toLowerCase();
  const headerParams = data.parameters.filter(
    p => p.location === PARAMETER_LOCATION.HEADER
  );
  const queryParams = data.parameters.filter(
    p => p.location === PARAMETER_LOCATION.QUERY
  );
  const bodyParams = data.parameters.filter(
    p => p.location === PARAMETER_LOCATION.BODY
  );
  const formDataParams = data.parameters.filter(
    p => p.location === PARAMETER_LOCATION.FORM_DATA
  );
  const key = `${axiosMethod}${headerParams.length ? "headers" : ""}${
    queryParams.length ? "query" : ""
  }${bodyParams.length ? "body" : ""}${
    formDataParams.length ? "formData" : ""
  }`;

  insplog({ key, hasResponse, hasPayload })

  // TODO: write form Data
  /**
   * PATH: 'path',
   * HEADER: 'header',
   * QUERY: 'query',
   * BODY: 'body',
   * FORM_DATA: 'formData'
   */
  return [
    urlPart,
    doRequestDict[key]({ ...data, hasPayload, hasResponse })
  ].join("\n");
};

const deserializePart = data => {
  return "const result = response// TODO: write this";
};

function getBody(data) {
  const hasPayload = data.parameters.length > 0;
  const hasResponse = Boolean(data.response.type);
  const getValidationPart = (variableName, message) =>
    `
v.clearContext()
if (!checkPayload(${variableName})) {
  console.debug(v.explanation)
  throw new TypeError(${JSON.stringify(message)})
}
  `.trim();
  return [
    hasPayload
      ? getValidationPart("payload", `Wrong ${data.apiModuleName} payload`)
      : "",
    doRequestPart(data, hasPayload, hasResponse), // transforms payload to right axios request
    ...(hasResponse ? [
      getValidationPart("response", `Wrong ${data.apiModuleName} payload`),
      deserializePart(data), // transforms response and saves into result
      `return result as ${data.responseTypeName}`
    ] : [])
  ].join("\n\n");
}
module.exports = endpointData => {
  const name = endpointData.apiModuleName;
  const parametersPart =
    endpointData.parameters.length > 0
      ? `payload: ${endpointData.payloadTypeName}`
      : "";
  const resultType =
    endpointData.response.type !== null
      ? endpointData.responseTypeName
      : "void";
  const body = getBody(endpointData);
  return `
// FUNCTION PART-------------------------------------------------
// url: ${endpointData.path}, method: ${endpointData.method}
export async function ${name}(${parametersPart}): Promise<${resultType}> {
${tab(body, 1)}
}
  `.trim();
};
