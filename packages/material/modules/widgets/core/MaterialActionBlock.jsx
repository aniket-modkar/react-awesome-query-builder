import React, { useState } from "react";
import PropTypes from "prop-types";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import FormHelperText from "@mui/material/FormHelperText";
// Assuming formulaUtils.js is within the core package and accessible like this.
// The exact import path might need adjustment based on the project's module resolution.
import { validateFormula } from "@react-awesome-query-builder/core/modules/utils/formulaUtils.js";

const MaterialActionBlock = ({ action, setAction, readonly, targetFieldType, fields }) => {
  const [formulaError, setFormulaError] = useState(null);
  // Store selected field for "Set Value" mode
  const [targetSetValueField, setTargetSetValueField] = useState(action?.value?.field || "");

  const handleActionTypeChange = (event) => {
    const newActionType = event.target.value;
    const defaultValue = newActionType === "set_value"
      ? { field: targetSetValueField, val: "" }
      : { formula: "" };
    setAction(prevAction => ({
      ...prevAction,
      type: newActionType,
      value: defaultValue
    }));
    if (newActionType === "compute_formula" && targetSetValueField) {
      // Keep targetSetValueField for potential switch back, or clear it:
      // setTargetSetValueField("");
    }
    setFormulaError(null);
  };

  const handleTargetSetValueFieldChange = (event) => {
    const newField = event.target.value;
    setTargetSetValueField(newField);
    // Reset value when field changes
    setAction(prevAction => ({
      ...prevAction,
      value: { ...prevAction.value, field: newField, val: "" }
    }));
  };

  const handleSetValueChange = (event) => {
    setAction(prevAction => ({
      ...prevAction,
      value: { ...prevAction.value, val: event.target.value }
    }));
  };

  const handleFormulaChange = (event) => {
    const newFormula = event.target.value;
    setAction(prevAction => ({
      ...prevAction,
      value: { ...(prevAction.value || {}), formula: newFormula }
    }));

    // Perform validation
    // Use targetFieldType if provided, otherwise default to a generic type or skip type-specific validation
    const validationResult = validateFormula(newFormula, targetFieldType || "number"); // Using "number" as a placeholder
    if (!validationResult.isValid) {
      setFormulaError(validationResult.error);
    } else {
      setFormulaError(null);
    }
  };

  // Ensure action and action.value are defined
  const currentAction = action || { type: "set_value", value: { field: "", val: "" } };
  const actionType = currentAction.type || "set_value";
  // For "set_value", actionValue is an object { field: string, val: any }
  // For "compute_formula", actionValue is an object { formula: string }
  const actionValue = currentAction.value ||
    (actionType === "set_value" ? { field: targetSetValueField, val: "" } : { formula: "" });

  const selectedFieldConfig = fields && actionType === "set_value" && actionValue.field ? fields[actionValue.field] : null;

  const renderSetValueInput = () => {
    if (!selectedFieldConfig) {
      return (
        <TextField
          fullWidth
          label="Value"
          value={actionValue.val || ""}
          onChange={handleSetValueChange}
          disabled={readonly || !actionValue.field}
          margin="dense"
          helperText={!actionValue.field ? "Select a field first" : ""}
        />
      );
    }

    if (selectedFieldConfig.type === "number") {
      return (
        <TextField
          fullWidth
          label={selectedFieldConfig.label || "Value"}
          type="number"
          value={actionValue.val || ""}
          onChange={handleSetValueChange}
          disabled={readonly}
          margin="dense"
        />
      );
    } else if (selectedFieldConfig.type === "select" && selectedFieldConfig.fieldSettings?.listValues) {
      return (
        <FormControl fullWidth margin="dense" disabled={readonly}>
          <InputLabel>{selectedFieldConfig.label || "Value"}</InputLabel>
          <Select
            value={actionValue.val || ""}
            onChange={handleSetValueChange}
            label={selectedFieldConfig.label || "Value"}
          >
            {(Array.isArray(selectedFieldConfig.fieldSettings.listValues)
              ? selectedFieldConfig.fieldSettings.listValues
              : Object.entries(selectedFieldConfig.fieldSettings.listValues).map(([value, title]) => ({value, title}))
            ).map(option => (
              typeof option === 'string' ?
              <MenuItem key={option} value={option}>{option}</MenuItem> :
              <MenuItem key={option.value} value={option.value}>{option.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    } else { // Default to text field for "string" or other types
      return (
        <TextField
          fullWidth
          label={selectedFieldConfig.label || "Value"}
          value={actionValue.val || ""}
          onChange={handleSetValueChange}
          disabled={readonly}
          margin="dense"
        />
      );
    }
  };

  return (
    <Box sx={{ p: 1, mt: 1, border: "1px dashed gray", borderRadius: "4px" }}>
      <FormControl fullWidth margin="dense">
        <InputLabel id="action-type-label">Action Type</InputLabel>
        <Select
          labelId="action-type-label"
          value={actionType}
          onChange={handleActionTypeChange}
          disabled={readonly}
          label="Action Type"
        >
          <MenuItem value="set_value">Set Value</MenuItem>
          <MenuItem value="compute_formula">Compute Formula</MenuItem>
        </Select>
      </FormControl>

      {actionType === "set_value" && fields && (
        <>
          <FormControl fullWidth margin="dense" disabled={readonly}>
            <InputLabel id="set-value-field-label">Target Field</InputLabel>
            <Select
              labelId="set-value-field-label"
              value={actionValue.field || ""}
              onChange={handleTargetSetValueFieldChange}
              label="Target Field"
            >
              {Object.keys(fields).map(fieldName => (
                <MenuItem key={fieldName} value={fieldName}>
                  {fields[fieldName].label || fieldName} ({fields[fieldName].type})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {renderSetValueInput()}
        </>
      )}

      {actionType === "compute_formula" && (
        <TextField
          fullWidth
          label="Formula"
          value={actionValue.formula || ""}
          onChange={handleFormulaChange}
          disabled={readonly}
          margin="dense"
          multiline
          rows={2}
          error={!!formulaError}
        />
      )}
      {formulaError && actionType === "compute_formula" && (
        <FormHelperText error>{formulaError}</FormHelperText>
      )}
    </Box>
  );
};

MaterialActionBlock.propTypes = {
  action: PropTypes.shape({
    type: PropTypes.string, // "set_value" or "compute_formula"
    value: PropTypes.oneOfType([ // value can be an object for set_value or compute_formula
      PropTypes.shape({ // For set_value
        field: PropTypes.string,
        val: PropTypes.any,
      }),
      PropTypes.shape({ // For compute_formula
        formula: PropTypes.string
      })
    ])
  }),
  setAction: PropTypes.func.isRequired,
  readonly: PropTypes.bool,
  targetFieldType: PropTypes.string, // e.g., "number", "text", "boolean" - for formula validation for "compute_formula"
  fields: PropTypes.object, // List of available fields for "set_value" mode
};

export default MaterialActionBlock;
