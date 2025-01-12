const { RedisPubSub } = require('graphql-redis-subscriptions');

const MESSAGE_ADDED = 'MESSAGE_ADDED';

const messages = [];

const pubsub = new RedisPubSub({
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

const resolvers = {
  Query: {
    messages: () => messages,
  },
  Mutation: {
    addMessage: (_, { content }) => {
      const message = {
        id: messages.length + 1,
        content,
        createdAt: new Date().toISOString(),
      };
      messages.push(message);
      pubsub.publish(MESSAGE_ADDED, { newMessage: message });
      return message;
    },
  },
  Subscription: {
    newMessage: {
      subscribe: () => pubsub.asyncIterator([MESSAGE_ADDED]),
    },
  },
};

module.exports = { pubsub, resolvers};
