const { TAB_SIZE } = require('./constants');

module.exports = str => str.split('\n').map(line => Array(TAB_SIZE).fill(' ').join('') + line).join('\n');
