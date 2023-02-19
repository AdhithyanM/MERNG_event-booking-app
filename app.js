const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');   // gives a middleware fn.
const { buildSchema } = require('graphql');

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
        type RootQuery {
          events: [String!]!
        }

        type RootMutation {
          createEvent(name: String!): String
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
        return ['abc', 'def', 'ghi'];
      },
      createEvent: (args) => {
        const eventName = args.name;
        return eventName;
      }
    }, 
    graphiql: true    // For development puporse we can have a playground to play with graphql
  })
);


app.listen(3000, () => {
  console.log("Server is listening to port 3000...");
});