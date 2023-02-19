const bcrypt = require('bcryptjs');
const User = require('../../models/user');



// User and Auth related Resolvers
module.exports = {            
  createUser: async (args) => {
    try {
      const user = await User.findOne({ email: args.userInput.email });
      if (user) {
        throw new Error("User exists already.");
      }
          
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      const newUser = new User({
        email: args.userInput.email,
        password: hashedPassword
      });
      const createdUser = await newUser.save();
      return { 
        ...createdUser._doc, 
        password: null, 
        _id: createdUser.id 
      };
    } 
    catch (err) {
      throw err;
    }
  }
}