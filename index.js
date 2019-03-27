const { readFile, writeFile, parseJson } = require('./helpers')
const insplog = require('./insplog')
const getEndpointData = require('./getEndpointData')
const getImportsPart = require('./imports')
const getTypesDefinitionPart = require('./getTypesDefinitionPart')
const getValidatorsPart = require('./getValidatorsPart')
const getFunctionPart = require('./getFunctionPart')

const { uniq } = require('ramda')

function temp(swaggerData) {
  const { paths } = swaggerData
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

async function main(swaggerJsonPath, endpointSearchData, outputFilePath) {
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
  temp(swaggerData)
  var endpointData = getEndpointData(swaggerData, endpointSearchData)
  if (!endpointData) {
    console.log('There is no such endpoint :(')
    return
  }
  insplog(endpointData)
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

const [_node,_indexJs, swaggerJsonPath, endpointSearchData, outputFilePath] = process.argv
main(swaggerJsonPath, endpointSearchData, outputFilePath)