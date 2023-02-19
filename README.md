Desgining the GraphQL API:
--------------------------
* you are required to create to event booking API and also a frontend for it.
* Main entities:
  * Events
  * Users
* Users can book events and Events can be booked by users.
* Some users can also able to create an Event.
* Events therefore has CRUD operations.
* Our users are connected to them who creates/updates the events
* While getting the events, you might want to filter by 
  * all events
  * all events created by particular user
  * all events booked by a particular user
* Users can be created and can be logged in essentially.
* Users can able to interact with events by booking or cancel a booking.

Express server:
---------------
* npm install express body-parser

GraphQL:
--------
* Graph QL is basically a specification that defines a query language that clients can send in the body of the post request to the backend.
* The backend needs to parse these incoming queries sent by frontend and deliver the right data back to the frontend or do whatever the query instructs to do.
* To parse a query we need 2 parts
  1. Package or Tool that is capable of understanding graphql queries 
    * For parsing, registering our schema, matching our schema to resolvers which is the code that actually takes care of what need to be done - we can use packages
  2. we need to define our capabilities of our API
    * which kind of queries can we handle
    * which kind of mutations can we take care of
    * For writing the schema and defining it, we are the one who would be doing that.

npm install express-graphql

  * this is a graphql package that can be used as a express middleware that allows us to point at a schema, add resolvers and automatically connect all of that for us and route requests to a parser and then handle them according to our schema and forward them to right resolvers.

npm install graphql

  * This will allow us to define the schema and set up a schema that follows the official graphQL specification and definitions. 
