const { buildSchema } = require('graphql');

module.exports = buildSchema (    
  // buildSchema fn takes a string and that string should define our schema.
  // to define schema, we use schema keyword and inside the curly braces we have 2 keys
  // query - for fetching data (GET),  mutation - for changing data (POST/PUT/PATCH/DELETE)
  // graphql language is typed language. to create a type use type keyword
  // It is recommended to name our queries or mutation in way like accessing property on an object
  `
    type Booking {
      _id: ID!
      event: Event!
      user: User!
      createdAt: String!
      updatedAt: String!
    }

    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String
      creator: User
    }

    type User {
      _id: ID!
      email: String!
      password: String
      createdEvents: [Event!]
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
    
    type RootQuery {
      events: [Event!]!
      bookings: [Booking!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput!): Event
      createUser(userInput: UserInput): User
      bookEvent(eventId: ID!): Booking!
      cancelBooking(bookingId: ID!): Event!
    }

    schema {
      query: RootQuery 
      mutation: RootMutation
    }
  `
)