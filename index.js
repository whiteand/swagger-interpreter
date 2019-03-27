const { readFile, writeFile, parseJson } = require('./helpers')
const insplog = require('./insplog')
const getEndpointData = require('./getEndpointData')
const getImportsPart = require('./imports')
const getTypesDefinitionPart = require('./getTypesDefinitionPart')
const getValidatorsPart = require('./getValidatorsPart')
const getFunctionPart = require('./getFunctionPart')

const { uniq } = require('ramda')

function temp(swaggerData) {
  // const { paths } = swaggerData
  // const res = Object.keys(paths)
  // insplog(res)
  // const allParameters = Object.values(paths)
  //   .map(pathValue => Object.values(pathValue))
  //   .reduce((arr, arr2) => arr.concat(arr2), [])
  //   .map(endpointValue => endpointValue.parameters)
  //   .reduce((arr, arr2) => arr.concat(arr2), [])
  // const allParametersPropsEntries = allParameters
  //   .map(e => Object.entries(e))
  //   .reduce((arr, arr2) => arr.concat(arr2), [])
  // const allProps = [...allParametersPropsEntries
  //   .map(e => e[0])
  //   .reduce((set, el) => set.add(el), new Set())
  // ]
  // const allPropsValuesDict = allProps
  //   .map(propName => ({
  //     valuesSet: allParameters.map(param => param[propName])
  //       .reduce((set, value) => set.add(value), new Set()),
  //     propName,
  //   }))
  //   .reduce((dict, { propName, valuesSet }) => ({ ...dict, [propName]: uniq([...valuesSet]) }), {})
  // insplog(allPropsValuesDict)
  // const allPaths = Object.values(paths)
  //   .map(pathValue => Object.values(pathValue))
  //   .reduce((arr, arr2) => arr.concat(arr2), [])
  //   .map(e => e.responses)
  //   .map(e => e[200])
  // insplog(allPaths)

}

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
  endpointData.payloadTypeName = endpointData.funcTypeName + 'Payload'
  endpointData.responseTypeName = endpointData.funcTypeName + 'Response'
  
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
}

// const [_node,_indexJs, swaggerJsonPath, endpointSearchData, outputFilePath, apiModuleName] = 
// main([...process.argv].slice(2))

const { paths } = require('./swagger.json')
const endpoints = Object.entries(paths).map(([p, endpoints]) => Object.keys(endpoints).map(key => `${p} ${key}`)).reduce((arr, arr2) => arr.concat(arr2), [])
async function test(endpoints) {
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
      await main('./swagger.json', ep, outputFilePath, actionName)
    } catch (error) {
      console.log(`\n\n\nERROR IN ${ep}:\n\n`)
      console.error(error)
      console.log(`END`)
    }
  }
}
test(endpoints)

