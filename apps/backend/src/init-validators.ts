import { ajv } from 'utils/validator';
import { editDirectorySchema } from 'validators/directory';

export const initValidators = () => {
  ajv.addSchema(editDirectorySchema, 'editDirectory');
};
