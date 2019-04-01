module.exports = function getImportsPart({ hasResponse, hasPayload }) {
  const axiosPart = "import axios from 'axios'";
  const quartetPart = hasResponse || hasPayload ? `
import quartet from 'quartet'
const v = quartet()
  `.trim() : '';

  return `
// IMPORTS PART--------------------------------------------------
${axiosPart}
${quartetPart}
`.trim();
};
