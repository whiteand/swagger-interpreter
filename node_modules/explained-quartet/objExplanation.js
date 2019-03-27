const getPath = require('./getPath')
const schemas = []
const schemaToObj = schema => {
  if (typeof schema === 'object' || typeof schema === 'string') {
    return schema
  }
  if (typeof schema === 'function' && !schema.type) {
    return schema.toString()
  }
  return {
    type: schema.type,
    extra: schema.extra
  }
}

module.exports = (value, schema, ...parents) => {
  const path = getPath(parents)
  const id = schemas.includes(schema) ? schemas.indexOf(schema) : schemas.length
  schemas.push(schema)
  return {
    id,
    value,
    path: 'invalidValue'+(path && '.'+path),
    schema: schemaToObj(schema),
  }
}