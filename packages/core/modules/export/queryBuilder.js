import {getOpCardinality} from "../utils/stuff";
import {getFieldConfig, getOperatorConfig} from "../utils/configUtils";
import {defaultConjunction} from "../utils/defaultUtils";
import {formatFieldName} from "../utils/ruleUtils";
import {Map} from "immutable";

/*
 Build tree to http://querybuilder.js.org/ like format

 Example:
 {
    "condition": "AND",
    "rules": [
        {
            "id": "price",
            "field": "price",
            "type": "double",
            "input": "text",
            "operator": "less",
            "value": "10.25"
        },
        {
            "condition": "OR",
            "rules": [
                {
                    "id": "category",
                    "field": "category",
                    "type": "integer",
                    "input": "select",
                    "operator": "equal",
                    "value": "2"
                },
                {
                    "id": "category",
                    "field": "category",
                    "type": "integer",
                    "input": "select",
                    "operator": "equal",
                    "value": "1"
                }
            ]
        }
    ]
 }
 */


export const queryBuilderFormat = (item, config) => {
  //meta is mutable
  let meta = {
    usedFields: []
  };
  // The root item is expected to be an 'if_group' or a similar structure
  // that holds the list of conditions.
  // This needs to be handled according to the new schema.
  if (item.get("type") === "group" && item.getIn(["properties", "conjunction"]) === "IF") {
    // Assuming the root is a group that contains IF/ELSEIF/ELSE blocks
    const conditions = formatIfElseGroup(item, config, meta);
    if (!conditions || conditions.length === 0) {
      return undefined;
    }
    return {
      conditions: conditions,
      ...meta
    };
  } else {
    // Fallback or error for unexpected root type
    // For now, let's try to format it as a single IF condition if it's a group/rule
    // This part might need more refinement based on how root items are structured.
    const conditionItem = formatItem(item, config, meta);
    if (!conditionItem) return undefined;
    // This is a simplified fallback, assuming a single 'if' if not structured as expected
    return {
      conditions: [{
        type: "if", // Defaulting to 'if'
        condition: conditionItem,
        action: item.getIn(["properties", "action"]) || null // Or get action if available
      }],
      ...meta
    };
  }
};


const formatItem = (item, config, meta) => {
  if (!item) return undefined;

  const type = item.get("type");

  if (type === "group" || type === "rule_group") {
    // This is for standard groups inside a condition
    return formatOldGroup(item, config, meta);
  } else if (type === "rule") {
    return formatRule(item, config, meta);
  } else if (type === "if_group") {
    // This is for IF/ELSEIF/ELSE blocks
    return formatIfBlock(item, config, meta);
  }
  return undefined;
};

// Renamed original formatGroup to formatOldGroup to avoid confusion
const formatOldGroup = (item, config, meta) => {
  const properties = item.get("properties") || new Map();
  const children = item.get("children1");

  const list = children
    .map((currentChild) => formatItem(currentChild, config, meta))
    .filter((currentChild) => typeof currentChild !== "undefined");
  if (!list.size) return undefined;

  let conjunction = properties.get("conjunction");
  if (!conjunction) conjunction = defaultConjunction(config);
  const not = properties.get("not");

  // This is the <expression> part of the condition
  return {
    id: item.get("id"),
    rules: list.toList(),
    condition: conjunction.toUpperCase(),
    not,
  };
};

const formatIfBlock = (item, config, meta) => {
  const properties = item.get("properties") || new Map();
  const children = item.get("children1"); // These are the rules/groups forming the condition
  const id = item.get("id");
  const action = properties.get("action");
  let conditionType = properties.get("conjunction"); // IF, ELSEIF, ELSE

  if (!conditionType) return undefined; // Should always have a type

  conditionType = conditionType.toLowerCase();

  let condition = null;
  if (conditionType !== "else") {
    // ELSE blocks don't have a condition, they only have an action
    // The children of an if_group represent its condition
    if (children && children.size) {
      // Create a temporary group for the condition
      const conditionGroup = new Map({
        type: "group", // or rule_group, depending on structure
        id: `${id}_condition`,
        properties: new Map({
          // For inner condition, use AND/OR, not IF/ELSEIF
          conjunction: properties.get("conditionConjunction") || "AND",
          not: properties.get("not")
        }),
        children1: children
      });
      condition = formatOldGroup(conditionGroup, config, meta);
    }
    if (!condition) return undefined; // IF/ELSEIF must have a condition
  }

  const result = {
    type: conditionType,
    action: action || null, // Ensure action is present, defaulting to null
  };

  if (condition) {
    result.condition = condition;
  }

  return result;
};

// This function will iterate over the main group containing IF/ELSEIF/ELSE blocks
const formatIfElseGroup = (topLevelGroup, config, meta) => {
  const children = topLevelGroup.get("children1");
  if (!children) return [];

  return children
    .map((child) => {
      // Each child is expected to be an 'if_group'
      if (child.get("type") === "if_group") {
        return formatIfBlock(child, config, meta);
      }
      // Potentially handle malformed structures or log a warning
      return undefined;
    })
    .filter((conditionBlock) => typeof conditionBlock !== "undefined")
    .toList()
    .toJS(); // Convert to JS array
};


const formatRule = (item, config, meta) => {
  const properties = item.get("properties") || new Map();
  const id = item.get("id");

  const operator = properties.get("operator");
  const options = properties.get("operatorOptions");
  let field = properties.get("field");
  let value = properties.get("value");
  let valueSrc = properties.get("valueSrc");
  let valueType = properties.get("valueType");

  if (field == null || operator == null || !value) // value can be an empty list for some operators
    return undefined;

  const hasUndefinedValues = value.filter(v => v === undefined).size > 0;
  if (hasUndefinedValues) return undefined;

  const fieldDefinition = getFieldConfig(config, field) || {};
  const operatorDefinition = getOperatorConfig(config, operator, field) || {};
  // fieldDefinition.type can be undefined if field is not found in config
  const fieldType = fieldDefinition?.type || "undefined";
  const cardinality = getOpCardinality(operatorDefinition);
  const typeConfig = config.types[fieldDefinition.type] || {};
  const fieldName = formatFieldName(field, config, meta);

  if (value.size < cardinality)
    return undefined;

  if (meta.usedFields.indexOf(field) == -1)
    meta.usedFields.push(field);
  value = value.toArray();
  valueSrc = valueSrc.toArray();
  valueType = valueType?.toArray() || [];
  let values = [];
  for (let i = 0 ; i < value.length ; i++) {
    const val = {
      type: valueType[i],
      value: value[i],
    };
    values.push(val);
    if (valueSrc[i] == "field") {
      const secondField = value[i];
      if (meta.usedFields.indexOf(secondField) == -1)
        meta.usedFields.push(secondField);
    }
  }
  let operatorOptions = options ? options.toJS() : null;
  if (operatorOptions && !Object.keys(operatorOptions).length)
    operatorOptions = null;
      
  let ruleQuery = {
    id,
    fieldName,
    type: fieldType,
    input: typeConfig.mainWidget,
    operator,
  };
  if (operatorOptions)
    ruleQuery.operatorOptions = operatorOptions;
  ruleQuery.values = values;
  return ruleQuery;
};
