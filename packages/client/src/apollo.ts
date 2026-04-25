import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink, concat } from '@apollo/client/core'

const httpLink = createHttpLink({
  uri: '/graphql',
})

const authMiddleware = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('token')
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
  })
  return forward(operation)
})

export const apolloClient = new ApolloClient({
  link: concat(authMiddleware, httpLink),
  cache: new InMemoryCache(),
})
