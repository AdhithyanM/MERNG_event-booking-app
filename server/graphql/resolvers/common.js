const Event = require('../../models/event');
const User = require('../../models/user');
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

exports.transformBooking = transformBooking;
exports.transformEvent = transformEvent;

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

// exports.getUser = getUser;
exports.getEvent = getEvent;
exports.getEvents = getEvents;