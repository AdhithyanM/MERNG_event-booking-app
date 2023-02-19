const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');

const getEvents = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds }});
    return events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        creator: getUser.bind(this, event._doc.creator)
      };
    });
  } 
  catch (err) {
    throw err;
  }
}

const getUser = async userId => {
  try {
    const user = await User.findById(userId);
    return { 
      ... user._doc, 
      _id: user.id,
      // Only if the query contains this property, then the events function will be called.
      createdEvents: getEvents.bind(this, user._doc.createdEvents) 
    }
  } 
  catch (err) {
    throw err;
  }
}

// Our Resolvers
module.exports = {            
  events: async () => {
    // when incoming request queries for events this resolver function is executed.
    try {
      const events = await Event.find();
      return events.map(event => {
        return { 
          ...event._doc, 
          _id: event.id,
          creator: getUser.bind(this, event._doc.creator),
          date: new Date(event._doc.date).toISOString()
        };
      });
    } 
    catch (err) {
      throw err;
    }
  },
  createEvent: async (args) => {
    try {
      const user = await User.findById('63f25d27ee7038fef0dfafd8');
      if (!user) {
        throw new Error("User doesn't exist.");
      }

      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: '63f25d27ee7038fef0dfafd8',
      });
      const result = await event.save();
      let createdEvent = { 
        ...result._doc, 
        _id: result.id,
        creator: getUser.bind(this, result._doc.creator),
        date: new Date(event._doc.date).toISOString() 
      };
      user.createdEvents.push(event);   // pushes this event id to user's createdEvents
      await user.save();   // updates exisiting user
      return createdEvent;
    } 
    catch (err) {
      throw err;
    }
  },
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