import React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MaterialActionBlock from "./MaterialActionBlock";
import MaterialButton from "./MaterialButton"; // For potential add rule/group buttons
import MaterialConjs from "./MaterialConjs"; // For AND/OR inside the condition

// Helper to get props for MaterialConjs
const conjsProps = (props) => ({
  id: props.id,
  readonly: props.readonly,
  disabled: props.disabled,
  selectedConjunction: props.selectedConjunction,
  setConjunction: props.setConjunction,
  conjunctionOptions: props.conjunctionOptions,
  config: props.config,
  not: props.not,
  setNot: props.setNot,
  showNot: props.showNot,
  isSubGroup: true, // Conditions are like sub-groups
});


const MaterialIfCondition = (props) => {
  const {
    id,
    type, // "IF" or "ELSE IF" - passed from parent
    children, // This should render the rules/groups for the condition
    action,
    setAction, // Callback to update the action
    // Props for the internal conjunction (AND/OR for the condition rules)
    selectedConjunction,
    setConjunction,
    conjunctionOptions,
    not,
    setNot,
    showNot,
    // Standard tree props
    config,
    readonly,
    disabled,
    // Callbacks for adding/removing rules/groups within this condition
    addRule,
    addGroup,
    removeSelf // To remove the whole IF/ELSEIF block
  } = props;

  const setSelfAction = (newAction) => {
    // Assuming `setAction` is a function that updates the action for this specific IF/ELSEIF block
    // This might come from `props.setField` or a similar mechanism if action is a "property" of the group
    if (props.setField) { // A common way to set properties in the library
        props.setField("action", newAction);
    } else if (setAction) { // Direct prop
        setAction(newAction);
    }
  };

  const currentAction = props.properties?.get("action") || action;


  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        border: "1px solid",
        borderColor: type === "IF" ? "primary.main" : "secondary.main",
        borderRadius: "4px",
        backgroundColor: "background.paper",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography variant="h6" component="div" sx={{ color: type === "IF" ? "primary.dark" : "secondary.dark" }}>
          {type}
        </Typography>
        {!readonly && removeSelf && (
          <MaterialButton
            label="Remove"
            onClick={removeSelf}
            config={config}
            type="delGroup" // Or a more specific type if available
          />
        )}
      </Box>

      <Box sx={{ pl: 2, borderLeft: "2px solid lightgrey", mb: 2 }}>
        {/* Condition Conjunction (AND/OR for rules within this IF/ELSEIF) */}
        <MaterialConjs {...conjsProps(props)} />

        {/* Render children (rules/groups for the condition) */}
        {children}

        {/* Add Rule/Group buttons for the condition */}
        {!readonly && (
          <Box sx={{ mt: 1 }}>
            <MaterialButton
              label="Add Rule"
              onClick={addRule}
              config={config}
              type="addRule"
            />
            <MaterialButton
              label="Add Group"
              onClick={addGroup}
              config={config}
              type="addGroup"
              style={{ marginLeft: "8px" }}
            />
          </Box>
        )}
      </Box>

      <Typography variant="subtitle1" component="div" sx={{ mt: 2, mb: 1 }}>
        Action:
      </Typography>
      <MaterialActionBlock
        action={currentAction}
        setAction={setSelfAction}
        readonly={readonly}
      />
    </Box>
  );
};

MaterialIfCondition.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["IF", "ELSE IF"]).isRequired,
  children: PropTypes.element, // Rules/groups for the condition
  action: PropTypes.object, // Action object from MaterialActionBlock
  setAction: PropTypes.func, // To update the action
  properties: PropTypes.object, // Immutable map of properties
  setField: PropTypes.func, // Function to set a property (like 'action')

  // Conjunction props for the condition (AND/OR)
  selectedConjunction: PropTypes.string,
  setConjunction: PropTypes.func,
  conjunctionOptions: PropTypes.object,
  not: PropTypes.bool,
  setNot: PropTypes.func,
  showNot: PropTypes.bool,

  config: PropTypes.object.isRequired,
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  addRule: PropTypes.func,
  addGroup: PropTypes.func,
  removeSelf: PropTypes.func, // Function to remove this IF/ELSE IF block
};

export default MaterialIfCondition;
