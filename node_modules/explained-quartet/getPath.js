const getPathReducer = (str, key) => {
  switch (typeof key) {
    case "number":
      return `${str}[${key}]`;
    case "string":
      return /^[a-zA-Z_0-9]+$/.test(key)
        ? [str, key].filter(Boolean).join(".")
        : `${str}['${key}']`;
    default:
      return key;
  }
};

const getPath = path =>
  path
    .map(({ key }) => key)
    .reverse()
    .reduce(getPathReducer, "");

module.exports = getPath