import React, { useState, useCallback } from 'react';
import { Query, Builder, Utils } from '@react-awesome-query-builder/ui';
import loadedConfigMaterial from './config/index.tsx'; // Material UI config
import '@react-awesome-query-builder/material/css/styles.css'; // Import Material styles

// Initialize Material UI config
const config = loadedConfigMaterial('material');

const initialTree = Utils.checkTree(Utils.loadTree({
  type: "group", // This outer group might be the main container for IFs
  id: Utils.uuid(),
  properties: {
    conjunction: "IF", // The main group itself is an IF container
    // No action directly on the container, actions are on IF/ELSEIF/ELSE blocks
  },
  children1: {
    [Utils.uuid()]: { // ID for the IF block
      type: "if_group",
      properties: {
        conjunction: "IF", // This is an IF block, not an AND/OR for its internal rules
        // The actual conjunction for rules inside this IF block (e.g. AND/OR)
        // would be another property if not default, or handled by its own children structure.
        // For now, assuming the IF block's direct children are rules/groups that form THE condition.
        // The `MaterialIfCondition` expects an internal conjunction for its condition rules.
        // Let's ensure this is represented, assuming 'AND' by default for condition rules.
        conditionConjunction: "AND", // For rules inside THIS if block's condition
        not: false, // For the condition rules
        action: { type: "set_value", value: { field: "status", val: "approved" } }
      },
      children1: { // Children forming the condition for this IF block
        [Utils.uuid()]: {
          type: "rule",
          properties: {
            field: "amount",
            operator: "greater",
            value: [1000],
            valueSrc: ["value"],
            valueType: ["number"]
          }
        }
      }
    },
    [Utils.uuid()]: { // ID for the ELSE IF block
      type: "if_group",
      properties: {
        conjunction: "ELSE IF", // Identifying it as an ELSE IF block
        isElseIf: true,       // Crucial for MaterialIfCondition to label it "ELSE IF"
        conditionConjunction: "AND",
        not: false,
        action: { type: "compute_formula", value: { formula: "amount * 0.1" } } // Formula action
        // targetFieldType for formula validation would be 'number' if 'amount' is number.
        // This is not explicitly in tree, but MaterialActionBlock needs it.
        // For now, the action block might use a default or passed-in targetFieldType.
      },
      children1: { // Children forming the condition for this ELSE IF block
        [Utils.uuid()]: {
          type: "rule",
          properties: {
            field: "duration",
            operator: "less",
            value: [12],
            valueSrc: ["value"],
            valueType: ["number"]
          }
        }
      }
    },
    [Utils.uuid()]: { // ID for the ELSE block
      type: "else_group",
      properties: {
        conjunction: "ELSE", // Identifying it as an ELSE block
        action: { type: "set_value", value: { field: "status", val: "rejected" } }
      }
      // No children1 for ELSE as it doesn't have a condition
    }
  }
}), config);


const ConditionalLogicDemo = () => {
  const [tree, setTree] = useState(initialTree);

  const onChange = useCallback((newTree, newConfig) => {
    setTree(newTree);
    // You can also save newConfig if it's mutable
  }, []);

  const renderBuilder = useCallback((props) => (
    <div className="query-builder-container" style={{ padding: '10px' }}>
      <div className="query-builder qb-lite">
        <Builder {...props} />
      </div>
    </div>
  ), []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Conditional Logic (IF/ELSE IF/ELSE) Demo</h2>
      <Query
        {...config}
        value={tree}
        onChange={onChange}
        renderBuilder={renderBuilder}
      />
      {/* You can add output display here if needed, like in the main demo */}
      {/* <pre>{JSON.stringify(Utils.getTree(tree), undefined, 2)}</pre> */}
    </div>
  );
};

export default ConditionalLogicDemo;
