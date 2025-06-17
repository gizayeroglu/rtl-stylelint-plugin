const convertToLogical = require('./rules/convert-to-logical');
const { createPlugin } = require('stylelint');

module.exports = createPlugin(convertToLogical.ruleName, convertToLogical);
