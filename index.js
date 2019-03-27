const { readFile, writeFile, parseJson } = require('./helpers')
const getEndpointData = require('./getEndpointData')
const getImportsPart = require('./imports')
const getTypesDefinitionPart = require('./getTypesDefinitionPart')
const getValidatorsPart = require('./getValidatorsPart')
const getFunctionPart = require('./getFunctionPart')

function temp(swaggerData) {
  const { paths } = swaggerData
  const res = [...Object.values(paths)
    .map(pathValue => Object.values(pathValue))
    .reduce((arr, arr2) => arr.concat(arr2), [])
    .map(endpointValue => endpointValue.parameters)
    .reduce((arr, arr2) => arr.concat(arr2), [])
    .map(e => e.in)
    .reduce((set, el) => set.add(el), new Set())]
  console.log(res)
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
  const importsPart = getImportsPart(endpointData, swaggerData)
  const typesPart = getTypesDefinitionPart(endpointData, swaggerData)
  const validatorsPart = getValidatorsPart(endpointData, swaggerData)
  const apiModuleFunctionPart = getFunctionPart(endpointData, swaggerData)
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