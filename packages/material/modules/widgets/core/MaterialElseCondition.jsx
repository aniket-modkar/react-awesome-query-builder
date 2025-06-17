import React from "react";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import MaterialActionBlock from "./MaterialActionBlock";
import MaterialButton from "./MaterialButton";

const MaterialElseCondition = (props) => {
  const {
    action,
    setAction, // Callback to update the action
    config,
    readonly,
    removeSelf, // To remove the whole ELSE block
    properties, // Immutable map of properties
    setField, // Function to set a property (like 'action')
    id,
  } = props;

  const setSelfAction = (newAction) => {
    if (setField) {
      setField("action", newAction);
    } else if (setAction) {
      setAction(newAction);
    }
  };

  const currentAction = properties?.get("action") || action;

  return (
    <Box
      p={2}
      mb={2}
      border="1px solid grey"
      borderRadius="4px"
      bgcolor="background.paper"
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={1}
      >
        <Typography variant="h6" component="div" color="textSecondary">
          ELSE
        </Typography>
        {!readonly && removeSelf && (
          <MaterialButton
            label="Remove"
            onClick={removeSelf}
            config={config}
            type="delGroup" // Or a more specific type
          />
        )}
      </Box>

      <Box mt={2} mb={1}>
        <Typography variant="subtitle1" component="div">
          Action:
        </Typography>
      </Box>
      <MaterialActionBlock
        action={currentAction}
        setAction={setSelfAction}
        readonly={readonly}
      />
    </Box>
  );
};

MaterialElseCondition.propTypes = {
  id: PropTypes.string.isRequired,
  action: PropTypes.object, // Action object from MaterialActionBlock
  setAction: PropTypes.func, // To update the action
  properties: PropTypes.object, // Immutable map of properties
  setField: PropTypes.func, // Function to set a property (like 'action')

  config: PropTypes.object.isRequired,
  readonly: PropTypes.bool,
  removeSelf: PropTypes.func, // Function to remove this ELSE block
};

export default MaterialElseCondition;
