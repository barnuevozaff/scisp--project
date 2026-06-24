// src/middleware/validate.js
const { validationResult } = require('express-validator');

/**
 * Runs after a chain of express-validator checks. If any failed, responds
 * 422 with the field-level errors; otherwise passes control to the route.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  return next();
}

module.exports = validate;
