module.exports = function(endpointData) {
  const { parameters } = endpointData
  const axiosPart = `import axios from 'axios'`
  const quartetPart = `
import quartet from 'quartet'
const v = quartet()
  `.trim()

  return `
// IMPORTS PART--------------------------------------------------
${axiosPart}
${quartetPart}
`.trim()
}