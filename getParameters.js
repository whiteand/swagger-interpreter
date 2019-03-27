const getTypeOfValue = require("./getTypeOfValue");

module.exports = function getParameters(rawParameters, swaggerData) {
  // TODO: write this
  return rawParameters.map(param => {
    const type = getTypeOfValue(param, swaggerData);
    const { name, in: location } = param;
    return {
      name,
      type,
      location
    };
  });
};
