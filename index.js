const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { ApolloServer } = require('@apollo/server');
const { createServer } = require('http');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { expressMiddleware } = require('@apollo/server/express4');

const typeDefs = require('./typedefs');
const { resolvers, pubsub} = require('./resolvers');

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();

const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

const apolloServer = new ApolloServer({
  schema,
  introspection: true,
});

useServer(
  {
    schema,
    context: () => ({
      pubsub,
    }),
    onConnect: (_) => console.log('WebSocket connection established'),
    onDisconnect: (_) => console.log('WebSocket connection closed'),
    onSubscriptionStart: (payload) => console.log('Subscription started:', payload),
    onSubscriptionEnd: (payload) => console.log('Subscription ended for message:', payload),
  },
  wsServer
);

(async () => {
  await apolloServer.start();
  
  app.use('/graphql', cors(), bodyParser.json(), expressMiddleware(
    apolloServer, 
    { context: async () => ({ pubsub }) }
  ));

  const PORT = 8000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Apollo Server ready at http://localhost:${PORT}/graphql`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);
  });
})();
