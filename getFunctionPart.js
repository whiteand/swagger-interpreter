
const tab = require('./tab')
const prefunction = (data) => {
  const resType = data.response.type !== null
    ? data.responseTypeName
    : 'void'
  return `
const doRequest = async (payload: ${data.payloadTypeName}): Promise<any> => {
  // TODO: write this  
}

const deserialize = (response: ${resType}) => {
  return response
}
`.trim()
}

module.exports = endpointData => {
  const name = endpointData.apiModuleName
  const parametersPart = endpointData.parameters.length > 0
    ? `payload: ${endpointData.payloadTypeName}`
    : ''
  const resultType = endpointData.response.type !== null
    ? endpointData.responseTypeName
    : 'void'
  const body = `
v.clearContext()
if (!checkPayload(payload)) {
  console.debug(v.explanation)
  throw new TypeError('Wrong ${endpointData.apiModuleName} payload')
}

const response = await doRequest(payload)

v.clearContext()
if (!checkResponse(response)) {
  console.debug(v.explanation)
  throw new TypeError('Wrong ${endpointData.apiModuleName} response')
}

return deserialize(response as ${resultType})

  `.trim()
  return `
// FUNCTION PART-------------------------------------------------
${prefunction(endpointData)}

export async function ${name}(${parametersPart}): Promise<${resultType}> {
${tab(body, 1)}
}
  `.trim()
}