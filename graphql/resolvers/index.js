const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');

const events = eventIds => {
  return Event
    .find({ _id: { $in: eventIds }})
    .then(events => {
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          creator: user.bind(this, event._doc.creator)
        };
      });
    })
    .catch(err => {
      throw err;
    })
}

const user = userId => {
  return User
    .findById(userId)
    .then(user => {
      return { 
        ... user._doc, 
        _id: user.id,
        // Only if the query contains this property, then the events function will be called.
        createdEvents: events.bind(this, user._doc.createdEvents) 
      }
    })
    .catch(err => {
      throw err;
    });
}

// Our Resolvers
module.exports = {            
  events: () => {
    // when incoming request queries for events this resolver function is executed.
    return Event
      .find()
      // .populate('creator')
      .then(events => {
        return events.map(event => {
          return { 
            ...event._doc, 
            _id: event.id,
            creator: user.bind(this, event._doc.creator),
            date: new Date(event._doc.date).toISOString()
          };
        });
      })
      .catch(err => {
        // console.log(err);
        throw err;
      });
  },
  createEvent: (args) => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: '63f25d27ee7038fef0dfafd8',
    });
    let createEvent;
    return event
      .save()
      .then(result => {
        createEvent = { 
          ...result._doc, 
          _id: result.id,
          creator: user.bind(this, result._doc.creator),
          date: new Date(event._doc.date).toISOString() 
        };
        return User.findById('63f25d27ee7038fef0dfafd8')
      })
      .then(user => {
        if (!user) {
          throw new Error("User exists already.");
        }
        user.createdEvents.push(event);   // pushes this event id to user's createdEvents
        return user.save();   // updates exisiting user
      })
      .then(result => {
        return createEvent;
      })
      .catch(err => {
        // console.log(err);
        throw err;
      });
  },
  createUser: (args) => {
    return User
      .findOne({ email: args.userInput.email })
      .then(user => {
        if (user) {
          throw new Error("User exists already.");
        }
        return bcrypt.hash(args.userInput.password, 12);
      })
      .then(hashedPassword => {
        const user = new User({
          email: args.userInput.email,
          password: hashedPassword
        });
        return user.save();
      })
      .then(result => {
        return { ...result._doc, password: null, _id: result.id };
      })
      .catch(err => {
        // console.log(err);
        throw err;
      })
  }
}