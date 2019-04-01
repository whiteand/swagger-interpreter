const {
  replaceInnerRefsWithDefinitions,
  mergeSchemaToType,
} = require('./typeHelpers');
const { PARAMETER_LOCATION, PARAMETER_TYPE } = require('./constants');

module.exports = function getParameters(rawParameters, swaggerData) {
  // TODO: write this

  return rawParameters.reduce((arr, param) => {
    const {
      name, in: location, required, ...type
    } = param;
    const transformedType = mergeSchemaToType(
      replaceInnerRefsWithDefinitions(type, swaggerData),
    );
    if (
      location === PARAMETER_LOCATION.BODY
      && transformedType.type === PARAMETER_TYPE.OBJECT
    ) {
      const props = Object.entries(transformedType.properties);
      const res = [
        ...arr,
        ...props.map(
          ([bodyItemName, bodyItemType]) => ({
            name: bodyItemName,
            type: bodyItemType,
            location: PARAMETER_LOCATION.BODY,
            required,
          }),
        ),
      ];
      return res;
    }
    return [
      ...arr,
      {
        name,
        type: transformedType,
        location,
        required,
      },
    ];
  }, []);
};
