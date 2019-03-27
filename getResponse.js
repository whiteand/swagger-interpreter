const getTypeOfValue = require('./getTypeOfValue')
module.exports = function getResponse(rawResponse, swaggerData) {
  return {
    type: getTypeOfValue(rawResponse, swaggerData)
  }
}