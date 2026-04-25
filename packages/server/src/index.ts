import { createYoga, createSchema } from 'graphql-yoga'
import { createServer } from 'http'
import { typeDefs } from './schema/typeDefs.generated'
import { resolvers } from './schema/resolvers.generated'
import { prisma } from './prisma'
import jwt from 'jsonwebtoken'
import { UserContext } from './types/context'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

const yoga = createYoga<UserContext>({
  schema: createSchema({ typeDefs, resolvers }),
  context: async ({ request }) => {
    const auth = request.headers.get('authorization')
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.substring(7)
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
        })
        return { user }
      } catch (e) {
        return { user: null }
      }
    }
    return { user: null }
  },
})
const server = createServer(yoga)
server.listen(process.env.PORT || 3000)
