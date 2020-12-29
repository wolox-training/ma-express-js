const { checkSchema, validationResult } = require('express-validator');
const errors = require('../errors');

const throwValidationErrors = (req, _, next) => {
  const validationErrors = validationResult(req);
  return next(
    !validationErrors.isEmpty() &&
      errors.invalidParamsError(validationErrors.array({ onlyFirstError: true }).map(e => e.msg))
  );
};
exports.validateSchema = schema => checkSchema(schema);
exports.validateSchemaAndFail = schema => [exports.validateSchema(schema), throwValidationErrors];
