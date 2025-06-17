const { ruleMessages, validateOptions, report } = require('stylelint').utils;

const ruleName = 'logical-properties/convert-to-logical';
const messages = ruleMessages(ruleName, {
  expected: (physical, logical) => `Replace "${physical}" with its logical counterpart "${logical}".`,
});

const physicalToLogicalMap = {
  'margin-top': 'margin-block-start',
  'margin-bottom': 'margin-block-end',
  'margin-left': 'margin-inline-start',
  'margin-right': 'margin-inline-end',
  'padding-top': 'padding-block-start',
  'padding-bottom': 'padding-block-end',
  'padding-left': 'padding-inline-start',
  'padding-right': 'padding-inline-end',
  'border-top': 'border-block-start',
  'border-bottom': 'border-block-end',
  'border-left': 'border-inline-start',
  'border-right': 'border-inline-end',
  'border-top-width': 'border-block-start-width',
  'border-bottom-width': 'border-block-end-width',
  'border-left-width': 'border-inline-start-width',
  'border-right-width': 'border-inline-end-width',
  'border-top-color': 'border-block-start-color',
  'border-bottom-color': 'border-block-end-color',
  'border-left-color': 'border-inline-start-color',
  'border-right-color': 'border-inline-end-color',
  'border-top-style': 'border-block-start-style',
  'border-bottom-style': 'border-block-end-style',
  'border-left-style': 'border-inline-start-style',
  'border-right-style': 'border-inline-end-style',
  'border-top-right-radius': 'border-start-end-radius',
  'border-top-left-radius': 'border-start-start-radius',
  'border-bottom-right-radius': 'border-end-end-radius',
  'border-bottom-left-radius': 'border-end-start-radius',
  'left': 'inset-inline-start',
  'right': 'inset-inline-end',
};

const justifyContentMap = {
  'left': 'flex-start',
  'right': 'flex-end'
};

const textAlignMap = {
  'left': 'start',
  'right': 'end'
};

const floatMap = {
  'left': 'inline-start',
  'right': 'inline-end'
};

const expandShorthand = (property, values) => {
  const properties = [];
  if (values.length === 2) {
    properties.push(`${property}-block`, `${property}-inline`);
  } else if (values.length === 3) {
    properties.push(`${property}-block-start`, `${property}-inline`, `${property}-block-end`);
  } else if (values.length === 4) {
    properties.push(`${property}-block-start`, `${property}-inline-start`, `${property}-block-end`, `${property}-inline-end`);
  }
  return properties;
};

const splitValues = (value) => {
  const regex = /(\([^()]*\)|[^\s()]+)/g;
  return value.match(regex);
};

const isSingleValue = (value) => {
  return !/\s/.test(value);
};

const isVariableOrFunction = (value) => {
  return /var\(|calc\(|\(--/.test(value);
};

const rule = (primaryOption, opts, context) => {
  const isAutofix = isContextAutofixing(context);

  return (root, result) => {
    const validOptions = validateOptions(result, ruleName, {
      actual: primaryOption,
      possible: [true, false],
    });

    if (!validOptions) {
      return;
    }

    root.walkDecls((decl) => {
      const physicalProperty = decl.prop;
      const logicalProperty = physicalToLogicalMap[physicalProperty];

      if (physicalProperty === 'justify-content' && justifyContentMap[decl.value]) {
        if (isAutofix) {
          decl.value = justifyContentMap[decl.value];
        } else {
          report({
            message: messages.expected(`${physicalProperty}: ${decl.value}`, `${physicalProperty}: ${justifyContentMap[decl.value]}`),
            node: decl,
            result,
            ruleName,
          });
        }
      } else if (physicalProperty === 'text-align' && textAlignMap[decl.value]) {
        if (isAutofix) {
          decl.value = textAlignMap[decl.value];
        } else {
          report({
            message: messages.expected(`${physicalProperty}: ${decl.value}`, `${physicalProperty}: ${textAlignMap[decl.value]}`),
            node: decl,
            result,
            ruleName,
          });
        }
      } else if (physicalProperty === 'float' && floatMap[decl.value]) {
        if (isAutofix) {
          decl.value = floatMap[decl.value];
        } else {
          report({
            message: messages.expected(`${physicalProperty}: ${decl.value}`, `${physicalProperty}: ${floatMap[decl.value]}`),
            node: decl,
            result,
            ruleName,
          });
        }
      } else if (logicalProperty) {
        if (isAutofix) {
          decl.prop = logicalProperty;
        } else {
          report({
            message: messages.expected(physicalProperty, logicalProperty),
            node: decl,
            result,
            ruleName,
          });
        }
      } else if (physicalProperty === 'margin' || physicalProperty === 'padding') {
        if (isSingleValue(decl.value) || isVariableOrFunction(decl.value)) {
          if (isAutofix) {
            decl.prop = `${physicalProperty}-block`;
            decl.cloneBefore({ prop: `${physicalProperty}-inline`, value: decl.value });
          } else {
            report({
              message: messages.expected(physicalProperty, `${physicalProperty}-block and ${physicalProperty}-inline`),
              node: decl,
              result,
              ruleName,
            });
          }
        } else {
          const values = splitValues(decl.value);
          const logicalProperties = expandShorthand(physicalProperty, values);

          if (logicalProperties.length) {
            if (isAutofix) {
              if (values.length === 2) {
                const blockValue = values[0];
                const inlineValue = values[1];
                if (blockValue === inlineValue) {
                  decl.cloneBefore({ prop: physicalProperty, value: blockValue });
                } else {
                  decl.cloneBefore({ prop: `${physicalProperty}-block`, value: blockValue });
                  decl.cloneBefore({ prop: `${physicalProperty}-inline`, value: inlineValue });
                }
              } else if (values.length === 3) {
                const blockStartValue = values[0];
                const inlineValue = values[1];
                const blockEndValue = values[2];
                if (blockStartValue === inlineValue && inlineValue === blockEndValue) {
                  decl.cloneBefore({ prop: physicalProperty, value: blockStartValue });
                } else if (blockStartValue === blockEndValue) {
                  decl.cloneBefore({ prop: `${physicalProperty}-block`, value: blockStartValue });
                  decl.cloneBefore({ prop: `${physicalProperty}-inline`, value: inlineValue });
                } else {
                  decl.cloneBefore({ prop: `${physicalProperty}-block-start`, value: blockStartValue });
                  decl.cloneBefore({ prop: `${physicalProperty}-inline`, value: inlineValue });
                  decl.cloneBefore({ prop: `${physicalProperty}-block-end`, value: blockEndValue });
                }
              } else if (values.length === 4) {
                const blockStartValue = values[0];
                const inlineEndValue = values[1];
                const blockEndValue = values[2];
                const inlineStartValue = values[3];
                if (blockStartValue === inlineEndValue && inlineEndValue === blockEndValue && blockEndValue === inlineStartValue) {
                  decl.cloneBefore({ prop: physicalProperty, value: blockStartValue });
                } else if (blockStartValue === blockEndValue && inlineStartValue === inlineEndValue) {
                  decl.cloneBefore({ prop: `${physicalProperty}-block`, value: blockStartValue });
                  decl.cloneBefore({ prop: `${physicalProperty}-inline`, value: inlineStartValue });
                } else if (blockStartValue === blockEndValue) {
                  decl.cloneBefore({ prop: `${physicalProperty}-block`, value: blockStartValue });
                  decl.cloneBefore({ prop: `${physicalProperty}-inline-end`, value: inlineEndValue });
                  decl.cloneBefore({ prop: `${physicalProperty}-inline-start`, value: inlineStartValue });
                } else if (inlineStartValue === inlineEndValue) {
                  decl.cloneBefore({ prop: `${physicalProperty}-block-start`, value: blockStartValue });
                  decl.cloneBefore({ prop: `${physicalProperty}-inline`, value: inlineStartValue });
                  decl.cloneBefore({ prop: `${physicalProperty}-block-end`, value: blockEndValue });
                } else {
                  decl.cloneBefore({ prop: `${physicalProperty}-block-start`, value: blockStartValue });
                  decl.cloneBefore({ prop: `${physicalProperty}-inline-end`, value: inlineEndValue });
                  decl.cloneBefore({ prop: `${physicalProperty}-block-end`, value: blockEndValue });
                  decl.cloneBefore({ prop: `${physicalProperty}-inline-start`, value: inlineStartValue });
                }
              }
              decl.remove();
            } else {
              logicalProperties.forEach((prop, index) => {
                report({
                  message: messages.expected(`${physicalProperty}-${index + 1}`, prop),
                  node: decl,
                  result,
                  ruleName,
                });
              });
            }
          }
        }
      }
    });
  };
};

const isContextAutofixing = context => Boolean(Object(context).fix);

rule.ruleName = ruleName;
rule.messages = messages;
module.exports = rule;