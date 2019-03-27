module.exports = function(swaggerJsonPath, endpointSearchData) {
  return `
// IMPORTS PART--------------------------------------------------
import axios from 'axios'
import quartet from 'quartet'
const v = quartet()
  `.trim()
}