const express = require('express');
//This give us the tool 
const expressGraphQL = require('express-graphql');
const schema = require('./schema/schema')

const app = express();

//Any request that comes into our app looking for the route /grapql
//we want the grapql library to handle it
app.use('/graphql', expressGraphQL({
        //"graphical" is a developvemt tool that allow us to make queries
        //against our development server

        //schema: schema
        schema,
        graphiql: true
    })
);

app.listen(4000, ()=>{
    console.log("Listening")
});