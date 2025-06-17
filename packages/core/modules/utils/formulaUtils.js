export const FormulaMaxDepth = 10; // Max depth of nested formulas, not used yet but good for future
export const FormulaMaxLength = 1000; // Max length of formula string

export const numericOperations = ["+", "-", "*", "/"];
export const stringOperations = ["+"]; // Concatenation

// Basic validation placeholder - can be expanded
// For now, this is more about defining the allowed ops than implementing complex validation logic
export const validateFormula = (formula, fieldType) => {
  if (!formula || typeof formula !== "string") {
    return { isValid: false, error: "Formula is empty or not a string." };
  }

  if (formula.length > FormulaMaxLength) {
    return { isValid: false, error: `Formula exceeds maximum length of ${FormulaMaxLength}.` };
  }

  // Very basic validation: check for unsupported characters or patterns.
  // This is not a full parser but a quick check.
  // Allowed: field names (alphanumeric + underscore), numbers, defined operators, parentheses, spaces.
  const allowedPattern = /^[a-zA-Z0-9_.\s()+\-*/]+$/;
  if (!allowedPattern.test(formula)) {
    return { isValid: false, error: "Formula contains invalid characters." };
  }

  let opsToCheck = [];
  if (fieldType === "number") {
    opsToCheck = numericOperations;
  } else if (fieldType === "text" || fieldType === "string") { // Assuming 'text' or 'string' type for strings
    opsToCheck = stringOperations;
  } else {
    // For other types, perhaps no operations are allowed or validation is different
    return { isValid: true, error: null }; // Or { isValid: false, error: "Formula not supported for this field type." }
  }

  // Simplistic check: ensure only allowed operators for the type are present for any actual operation characters
  // This doesn't validate syntax, just character set for ops.
  const operatorChars = formula.split('').filter(char => ['+', '-', '*', '/'].includes(char));
  for (const char of operatorChars) {
    if (!opsToCheck.includes(char)) {
      return { isValid: false, error: `Operator "${char}" is not allowed for ${fieldType} type.` };
    }
  }

  // Placeholder for more advanced syntax, type checking, etc.
  // e.g., prevent mismatched parentheses, validate field names against a list, etc.

  return { isValid: true, error: null };
};

// Example of how field types might be passed (actual field type from config)
// validateFormula("field1 + field2", "number");
// validateFormula("firstName + ' ' + lastName", "text");
