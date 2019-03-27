const checkResult = (res) => {
  // TODO: write this
  return true
}

module.exports = (swaggerData, searchData) => {
  const [searchPath, searchMethod] = searchData.split(/\s+/);
  if ([searchPath, searchMethod].some(e => !e)) {
    return null;
  }

  const { paths } = swaggerData;

  const pathEntry = Object.entries(paths).find(([path]) =>
    path.includes(searchPath)
  );

  if (!pathEntry) return null;

  const [path, endpoints] = pathEntry;
  const endpointEntry = Object.entries(endpoints).find(([method]) =>
    method.toLowerCase().includes(searchMethod.toLowerCase())
  );

  if (!endpointEntry) return null;

  const [method, endpointData] = endpointEntry;
  const res = {
    ...endpointData,
    path,
    method
  };
  if (!checkResult(res)) {
    return null
  }
  return res
};
