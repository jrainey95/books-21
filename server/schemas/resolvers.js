const { User } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (user) {
        const userData = await User.findById(user._id).select("-__v -password");
        return userData;
      }
      throw new AuthenticationError("Not logged in");
    },
  },

  Mutation: {
    addUser: async (_, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (_, { bookData }, { user }) => {
      if (user) {
        return User.findByIdAndUpdate(
          user._id,
          { $push: { savedBooks: bookData } },
          { new: true }
        );
      }
      throw new AuthenticationError("You need to be logged in");
    },
    removeBook: async (_, { bookId }, { user }) => {
      if (user) {
        return User.findByIdAndUpdate(
          user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
      }
      throw new AuthenticationError("You need to be logged in");
    },
  },
};

module.exports = resolvers;
