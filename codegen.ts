import type { CodegenConfig } from '@graphql-codegen/cli'
import { defineConfig } from '@eddeee888/gcg-typescript-resolver-files'

const config: CodegenConfig = {
  schema: 'packages/server/src/schema/**/schema.graphql',
  documents: ['packages/client/src/graphql/**/*.graphql'],
  generates: {
    'packages/server/src/schema': defineConfig({
      emitLegacyCommonJSImports: false,
      typesPluginsConfig: {
        contextType: '../types/context.js#UserContext',
      },
    }),
    'packages/client/src/api/': {
      preset: 'client',
      config: {
        useTypeImports: true,
        enumsAsConst: true,
      },
      presetConfig: {
        fragmentMasking: false,
      },
    },
  },
  hooks: { afterOneFileWrite: ['prettier --write'] },
}
export default config
