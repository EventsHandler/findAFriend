export default {
  client: {
    service: {
      name: 'events',
      localSchemaFile: './packages/server/src/schema/schema.generated.graphqls',
    },
    includes: ['./packages/client/src/graphql/**/*.graphql'],
  },
}
