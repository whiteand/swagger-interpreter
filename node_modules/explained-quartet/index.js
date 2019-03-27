const quartet = require('quartet')
const objExplanation = require('./objExplanation')
const stringExplanation = require('./stringExplanation')

module.exports = {
  v: quartet({ defaultExplanation: stringExplanation }),
  obj: quartet({ defaultExplanation: objExplanation }),
  stringExplanation,
  objExplanation
}
