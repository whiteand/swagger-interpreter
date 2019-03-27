module.exports = endpointData => {
  const name = endpointData.apiModuleName
  const parametersPart = 'payload'
  const body = `// TODO: write this`
  return `
// FUNCTION PART-------------------------------------------------
export async function ${name}(${parametersPart}) {
  ${body}
}
  `.trim()
}