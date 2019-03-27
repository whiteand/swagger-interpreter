const R = require('ramda')
module.exports = swaggerData => schema => {
  const { $ref: ref } = schema
  if (!/#(\/\S+)+/.test(ref)) {
    console.log('Wrong ref: ' + ref)
    return false
  }
  const path = ref.split('/').slice(1)
  const definitionFromRef = R.path(path, swaggerData)
  return Boolean(definitionFromRef)
}