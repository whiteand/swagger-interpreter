module.exports = (endpointData, swaggerData) => {
  const { hasResponse, hasPayload } = endpointData
  if (!hasResponse && !hasPayload) return ''
  return [
    '// VALIDATORS PART ---------------------------------------------',
    ...(hasPayload ? ['const checkPayload = v({}) // TODO: write this'] : []),
    ...(hasResponse ? ['const checkResponse = v({}) // TODO: write this'] : [])
  ].join('\n\n')
}