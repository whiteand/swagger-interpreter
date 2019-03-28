const { readFile, writeFile, parseJson } = require('./helpers')
const { v } = require('explained-quartet')
const insplog = require('./insplog')
const getEndpointData = require('./getEndpointData')
const getImportsPart = require('./imports')
const getTypesDefinitionPart = require('./getTypesDefinitionPart')
const getValidatorsPart = require('./getValidatorsPart')
const getFunctionPart = require('./getFunctionPart')
const { bfs } = require('js-bfs')
const R = require('ramda')



async function main(swaggerJsonPath, endpointSearchData=' get', outputFilePath = './output.js', apiModuleName = 'doRequest') {
  var [json, error] = await readFile(swaggerJsonPath)
  if (error !== null) {
    console.log(`Something went wrong with reading of the file "${swaggerJsonPath}"`)
    console.error(error)
    return
  }
  var [swaggerData, error] = parseJson(json)
  if (error !== null) {
    console.log(`Something went wrong with parsing of json`)
    console.error(error)
    return
  }
  var endpointData = getEndpointData(swaggerData, endpointSearchData)
  if (!endpointData) {
    console.log('There is no such endpoint((: \'' + endpointSearchData + '\'')
    console.log('\n\n\n')
    return
  }
  endpointData.apiModuleName = apiModuleName
  endpointData.funcTypeName = apiModuleName.slice(0, 1).toUpperCase() + apiModuleName.slice(1)
  endpointData.hasResponse = Boolean(endpointData.response.type)
  endpointData.hasPayload = endpointData.parameters.length > 0
  endpointData.payloadTypeName = endpointData.hasPayload ? endpointData.funcTypeName + 'Payload' : 'any'
  endpointData.responseTypeName = endpointData.hasResponse ? endpointData.funcTypeName + 'Response' : 'void'
  
  const importsPart = getImportsPart(endpointData)
  const typesPart = getTypesDefinitionPart(endpointData)
  const validatorsPart = getValidatorsPart(endpointData)
  const apiModuleFunctionPart = getFunctionPart(endpointData)
  const content = [
    importsPart,
    typesPart,
    validatorsPart,
    apiModuleFunctionPart
  ].join('\n\n')
  var error = await writeFile(outputFilePath, content)
  if (error) {
    console.error(error)
  }
}

main(...([...process.argv].slice(2)))

const { paths } = require('./swagger.json')
const endpoints = Object.entries(paths).map(([p, endpoints]) => Object.keys(endpoints).map(key => `${p} ${key}`)).reduce((arr, arr2) => arr.concat(arr2), []).sort(() => Math.random() - 0.5)
async function test(endpoints) {
  const endpointsData = []
  for (let ep of endpoints) {
    try {
      const [path, method] = ep.split(' ')
      const outputFilePath = `./../swagger-test/`+`${path.replace(/[\{\}\/]/g, '-').slice(1)}_${method.toUpperCase()}.ts`.slice(-100)
      const actionName = ((m) => {
        if (m === 'post') {
          return 'post'
        }
        if (m === 'get') {
          return 'fetch'
        }
        return 'doRequest'
      })(method)
      const endpointData = await main('./swagger.json', ep, outputFilePath, actionName)
      endpointsData.push(endpointData)
    } catch (error) {
      console.log(`\n\n\nERROR IN ${ep}:\n\n`)
      console.error(error)
      console.log(`END`)
      return
    }
  }
  // const res = []
  // bfs(endpointsData, (node, nodePath) => {
  //   if (!node) return
  //   if (!node.type) return
  //   if (nodePath[nodePath.length-2] === 'parameters') return
  //   if (nodePath[nodePath.length-1] === 'properties') return
  //   res.push(R.omit(['description'], node))
  // })
  // v()
  
  // const isValid = v.arrayOf(v.and({
  //   type: v.enum('string','object', 'integer', 'array', 'number', 'file', 'boolean')
  // }, checkType))(res)
  // if (!isValid) {
  //   insplog(v.explanation)
  // }
  
}

// const VALIDATOR = {
//   string: v({
//     format: ['undefined','string'],
//   }),
//   object: v({
//     format: 'undefined',
//     properties: v.dictionaryOf(checkType)
//   }),
//   integer: v({
//     format: ['string','undefined']
//   }),
//   array: v({
//     format: 'undefined',
//     items: [v => Object.keys(v).length === 0, checkType]
//   }),
//   number: v({
//     format: ['string', 'undefined'],
//   }),
//   file: v({
//     format: 'undefined',
//   }),
//   boolean: v({
//     format: 'undefined',
//   })
// }

// function checkType(value) {
//   const isValid = VALIDATOR[value.type]
//   if (!isValid) {
//     insplog('WITHOUT TYPE', value)
//     return true
//   }
//   return isValid(value)
// }
// test(endpoints)

