const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');
const { dateToString } = require('../../helpers/date');

const transformEvent = event => {
  return {
    ...event._doc,
    _id: event.id,
    date: dateToString(event._doc.date),
    creator: getUser.bind(this, event._doc.creator)
  };
}

const transformBooking = booking => {
  return {
    ...booking._doc,
    _id: booking.id,
    user: getUser.bind(this, booking._doc.user),
    event: getEvent.bind(this, booking._doc.event),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt)
  }
}

const getEvents = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds }});
    return events.map(event => {
      return transformEvent(event);
    });
  } 
  catch (err) {
    throw err;
  }
}

const getEvent = async eventId => {
  try {
    const event = await Event.findById(eventId);
    return transformEvent(event);
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
        return transformEvent(event);
      });
    } 
    catch (err) {
      throw err;
    }
  },
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return transformBooking(booking);
      })
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
      let createdEvent = transformEvent(result);
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
  },
  bookEvent: async args => {
    try {
      const fetchedEvent = await Event.findOne({ _id: args.eventId });
      const booking = new Booking({
        user: '63f25d27ee7038fef0dfafd8',
        event: fetchedEvent
      });
      const createdBooking = await booking.save();
      return transformBooking(createdBooking);
    }
    catch (err) {
      throw err;
    }
  },
  cancelBooking: async args => {
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');
      if (!booking) {
        throw new Error("Booking not found in the system");
      }
      const event = transformEvent(booking.event);
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    }
    catch (err) {
      throw err;
    }
  }
}