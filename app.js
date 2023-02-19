const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');   // gives a middleware fn.
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require("dotenv").config();

const Event = require('./models/event');
const User = require('./models/user');

const app = express();
app.use(bodyParser.json());


// with graphql, we only have one endpoint to which all req are sent.
app.use(
  '/graphql', 
  graphqlHTTP({
    // 2 properties for this middleware
    schema: buildSchema(    
      // points to a valid graphql schema
      // buildSchema fn takes a string and that string should define our schema.
      // to define schema, we use schema keyword and inside the curly braces we have 2 keys
      // query - for fetching data (GET),  mutation - for changing data (POST/PUT/PATCH/DELETE)
      // graphql language is typed language. to create a type use type keyword
      // It is recommended to name our queries or mutation in way like accessing property on an object
      `
        type Event {
          _id: ID!
          title: String!
          description: String!
          price: Float!
          date: String
        }

        type User {
          _id: ID!
          email: String!
          password: String
        }

        type RootQuery {
          events: [Event!]!
        }

        input EventInput {
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        input UserInput {
          email: String!
          password: String!
        }

        type RootMutation {
          createEvent(eventInput: EventInput!): Event
          createUser(userInput: UserInput): User
        }

        schema {
          query: RootQuery 
          mutation: RootMutation
        }
      `
    ),
    rootValue: {            
      // point at an Object which has all the resolver functions
      events: () => {
        // when incoming request has the propety events this resolver function is executed.
        return Event
          .find()
          .then(events => {
            return events.map(event => {
              return { ...event._doc, _id: event.id };
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
            createEvent = { ...result._doc, _id: result.id };
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
    }, 
    graphiql: true    // For development puporse we can have a playground to play with graphql
  })
);

mongoose
  .connect (
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.xw64yz5.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`
  )
  .then (() => {
    app.listen(3000, () => {
      console.log("Connected to mongodb atlas!");
      console.log("Server is listening to port 3000....");
    })
  })
  .catch (err => {
    console.log(err)
  });