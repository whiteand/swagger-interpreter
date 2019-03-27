const fs = require("fs");
const util = require("util");
const promisedReadFile = util.promisify(fs.readFile);
const promisedWriteFile = util.promisify(fs.writeFile);
const readFile = async path => {
  try {
    const content = await promisedReadFile(path);
    return [content, null];
  } catch (error) {
    return [null, error];
  }
};
const writeFile = async (path, content) => {
  try {
    await promisedWriteFile(path, content);
    return null;
  } catch (error) {
    return error;
  }
};

const parseJson = json => {
  try {
    const content = JSON.parse(json);
    return [content, null];
  } catch (error) {
    return [null, error];
  }
};

module.exports = {
  readFile,
  writeFile,
  parseJson
};
