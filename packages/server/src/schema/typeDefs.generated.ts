import type { DocumentNode } from 'graphql'
export const typeDefs = {
  kind: 'Document',
  definitions: [
    {
      name: { kind: 'Name', value: 'Query' },
      kind: 'ObjectTypeDefinition',
      fields: [
        {
          kind: 'FieldDefinition',
          name: { kind: 'Name', value: 'events' },
          arguments: [
            {
              kind: 'InputValueDefinition',
              name: { kind: 'Name', value: 'filter' },
              type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
              directives: [],
            },
          ],
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Event' } } },
            },
          },
          directives: [],
        },
      ],
      directives: [],
      interfaces: [],
    },
    {
      name: { kind: 'Name', value: 'Mutation' },
      kind: 'ObjectTypeDefinition',
      fields: [
        {
          kind: 'FieldDefinition',
          name: { kind: 'Name', value: 'createEvent' },
          arguments: [
            {
              kind: 'InputValueDefinition',
              name: { kind: 'Name', value: 'name' },
              type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
              directives: [],
            },
          ],
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Event' } } },
          directives: [],
        },
      ],
      directives: [],
      interfaces: [],
    },
    {
      kind: 'ObjectTypeDefinition',
      name: { kind: 'Name', value: 'Event' },
      interfaces: [],
      directives: [],
      fields: [
        {
          kind: 'FieldDefinition',
          name: { kind: 'Name', value: 'id' },
          arguments: [],
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
          directives: [],
        },
        {
          kind: 'FieldDefinition',
          name: { kind: 'Name', value: 'name' },
          arguments: [],
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
          directives: [],
        },
        {
          kind: 'FieldDefinition',
          name: { kind: 'Name', value: 'derived' },
          arguments: [],
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
          directives: [],
        },
      ],
    },
    {
      kind: 'SchemaDefinition',
      operationTypes: [
        {
          kind: 'OperationTypeDefinition',
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Query' } },
          operation: 'query',
        },
        {
          kind: 'OperationTypeDefinition',
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Mutation' } },
          operation: 'mutation',
        },
      ],
    },
  ],
} as unknown as DocumentNode
