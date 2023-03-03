const Event = require("../../models/event");
const User = require("../../models/user");
const { transformEvent } = require("./common");

// Event Resolvers
module.exports = {
  events: async () => {
    // when incoming request queries for events this resolver function is executed.
    try {
      const events = await Event.find();
      return events.map((event) => {
        return transformEvent(event);
      });
    } catch (err) {
      throw err;
    }
  },
  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated");
    }
    try {
      const user = await User.findById("63f25d27ee7038fef0dfafd8");
      if (!user) {
        throw new Error("User doesn't exist.");
      }

      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: "63f25d27ee7038fef0dfafd8",
      });
      const result = await event.save();
      let createdEvent = transformEvent(result);
      user.createdEvents.push(event); // pushes this event id to user's createdEvents
      await user.save(); // updates exisiting user
      return createdEvent;
    } catch (err) {
      throw err;
    }
  },
};
