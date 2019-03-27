const getTypeByRef = require('./getTypeByRef')
const { PARAMETER_TYPE } = require('./constants')
const getElementType = function(value, swaggerData) {
  return getTypeOfValue(value.items, swaggerData)
}
function getTypeOfValue(value, swaggerData, addRaw = false) {
  if (!value) return null
  if (value.schema && typeof value.schema.$ref === 'string') {
    return getTypeByRef(value.schema.$ref, swaggerData)
  }
  if (!value.type) {
    return {
      ...(addRaw ? { _raw: value } : {}),
      type: 'any'
    }
  }

  if (value.type === PARAMETER_TYPE.ARRAY) {
    return {
      ...(addRaw ? { _raw: value } : {}),
      type: PARAMETER_TYPE.ARRAY,
      elementType: getElementType(value, swaggerData)
    }
  }
  if (value.type === PARAMETER_TYPE.OBJECT) {
    return {
      ...(addRaw ? { _raw: value } : {}),
      type: PARAMETER_TYPE.OBJECT,
      properties: Object.entries(value.properties).map(([propName, propValue]) => [
        propName,
        getTypeOfValue(propValue, swaggerData)
      ]).reduce((dict, [propName, propType]) => ({
        ...dict,
        [propName]: propValue
      }))
    }
  }
  return {
    type: value.type
  }
}
module.exports = getTypeOfValue