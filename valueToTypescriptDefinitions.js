module.exports = function valueToTypescriptDefinition(value, typeName) {
  if (!value.type) {
    throw new TypeError('Wrong value to be translated into typescript definition')
  }
  return `interface ${typeName} {}`
}