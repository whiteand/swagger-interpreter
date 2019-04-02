#!/usr/bin/env node
const { readFile, writeFile, parseJson } = require('./helpers');
const getEndpointData = require('./getEndpointData');
const getImportsPart = require('./imports');
const getTypesDefinitionPart = require('./getTypesDefinitionPart');
const getValidatorsPart = require('./getValidatorsPart');
const getFunctionPart = require('./getFunctionPart');


async function main(swaggerJsonPath, endpointSearchData = ' get', outputFilePath = './output.js', apiModuleName = 'doRequest') {
  const [json, error] = await readFile(swaggerJsonPath);
  if (error !== null) {
    // eslint-disable-next-line
    console.log(`Something went wrong with reading of the file "${swaggerJsonPath}"`);
    // eslint-disable-next-line
    console.error(error);
    return;
  }
  const [swaggerData, swaggerJsonParseError] = parseJson(json);
  if (swaggerJsonParseError !== null) {
    // eslint-disable-next-line
    console.log('Something went wrong with parsing of json');
    // eslint-disable-next-line
    console.error(swaggerJsonParseError);
    return;
  }
  const endpointData = getEndpointData(swaggerData, endpointSearchData);
  if (!endpointData) {
    // eslint-disable-next-line
    console.log(`There is no such endpoint((: '${endpointSearchData}'`);
    // eslint-disable-next-line
    console.log('\n\n\n');
    return;
  }
  endpointData.apiModuleName = apiModuleName;
  endpointData.funcTypeName = apiModuleName.slice(0, 1).toUpperCase() + apiModuleName.slice(1);
  endpointData.hasResponse = Boolean(endpointData.response.type);
  endpointData.hasPayload = endpointData.parameters.length > 0;
  endpointData.payloadTypeName = endpointData.hasPayload ? `${endpointData.funcTypeName}Payload` : 'any';
  endpointData.responseTypeName = endpointData.hasResponse ? `${endpointData.funcTypeName}Response` : 'void';

  const importsPart = getImportsPart(endpointData);
  const typesPart = getTypesDefinitionPart(endpointData);
  const validatorsPart = getValidatorsPart(endpointData);
  const apiModuleFunctionPart = getFunctionPart(endpointData);
  const content = [
    importsPart,
    typesPart,
    validatorsPart,
    apiModuleFunctionPart,
  ].join('\n\n');
  const writeFileError = await writeFile(outputFilePath, content);
  if (writeFileError) {
    // eslint-disable-next-line
    console.error(writeFileError);
  }
}

main(...([...process.argv].slice(2)));
