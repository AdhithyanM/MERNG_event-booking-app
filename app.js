const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');   // gives a middleware fn.
const mongoose = require('mongoose');
require("dotenv").config();

const graphqlSchema = require('./graphql/schema/index');
const graphqlResolvers = require('./graphql/resolvers/index');

const app = express();
app.use(bodyParser.json());




// with graphql, we only have one endpoint to which all req are sent.
app.use(
  '/graphql', 
  graphqlHTTP({
    // 2 properties for this middleware
    schema: graphqlSchema,   // points to a valid graphql schema
    rootValue: graphqlResolvers,   // point at an Object which has all the resolver functions
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