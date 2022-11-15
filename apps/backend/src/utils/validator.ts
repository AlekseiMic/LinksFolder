import { BadRequestException } from '@nestjs/common';
import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import ajvKeywords from 'ajv-keywords';

const ajv = new Ajv({
  removeAdditional: true,
  coerceTypes: true,
  allErrors: true,
  messages: false,
});

addFormats(ajv);

ajvKeywords(ajv, 'transform');

const defaultKeywordErrors: Record<string, string> = {
  required: 'IS_REQUIRED',
  string: 'MUST_BE_STRING',
  email: 'INVALID_FORMAT',
  between: 'INVALID_LENGTH',
  integer: 'MUST_BE_INTEGER',
  minLength: 'MIN_LENGTH',
  maxLength: 'MAX_LENGTH',
};

function formatErrors(errors: ErrorObject[] | null | undefined) {
  const fieldErrors: Record<string, string[]> = {};
  // eslint-disable-next-line
  errors?.forEach((error: any) => {
    let { instancePath: property, keyword: errorMessage } = error;
    if (error.keyword === 'required')
      property =
        (property.length > 0 ? `${property}/` : '') +
        error.params.missingProperty;
    if (error.keyword === 'format') errorMessage = error.params.format;
    if (!property) return;

    errorMessage = defaultKeywordErrors[errorMessage] ?? errorMessage;
    property = property.replace(/^\//g, '');
    fieldErrors[property] = errorMessage;
  });

  return fieldErrors;
}

function validate(
  data: Record<string, unknown>,
  schema: string,
  returnErrors = false
): boolean | Record<string, string[]> {
  console.time(`VALIDATION: ${schema}`);
  const validator = ajv.getSchema(schema);
  if (typeof validator !== 'function') {
    throw new Error(`Cannot find validator for \`${schema}\` schema.`);
  }
  const result = validator(data);
  console.timeEnd(`VALIDATION: ${schema}`);
  if (result) return true;
  const errors = formatErrors(validator.errors);
  if (!returnErrors) throw new BadRequestException(errors);
  return errors;
}

export { ajv, validate };
