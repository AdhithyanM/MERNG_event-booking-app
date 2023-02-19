const Booking = require('../../models/booking');
const Event = require('../../models/event');
const { transformBooking, transformEvent } = require('./common');


// Booking Resolvers
module.exports = {            
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