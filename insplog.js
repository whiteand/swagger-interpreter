const util = require('util');

module.exports = (...xs) => {
  const strings = xs.map(x => (typeof x === 'string' ? x : util.inspect(x, { colors: true, depth: 100 })));
  // eslint-disable-next-line
  console.log(strings.join(' '));
};
