import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core'

export const link = createHttpLink({
  uri: '/graphql',
})

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})
