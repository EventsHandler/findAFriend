import { createYoga, createSchema } from 'graphql-yoga'
import { createServer } from 'http'
import { typeDefs } from './schema/typeDefs.generated'
import { resolvers } from './schema/resolvers.generated'

const yoga = createYoga({ schema: createSchema({ typeDefs, resolvers }) })
const server = createServer(yoga)
server.listen(process.env.PORT || 3000)
