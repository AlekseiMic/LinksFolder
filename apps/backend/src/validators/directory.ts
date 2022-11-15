import { JSONSchemaType } from 'ajv';

export const editDirectorySchema: JSONSchemaType<{
  name?: string;
  parent?: number;
}> = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 4,
      maxLength: 50,
      nullable: true,
    },
    parent: {
      type: 'integer',
      nullable: true,
    },
  },
  anyOf: [
    {
      required: ['name'],
    },
    {
      required: ['parent'],
    },
  ],
  required: [],
};
