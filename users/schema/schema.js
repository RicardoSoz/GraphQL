//This file tells to grapql how exactly what your data application looks like
//including what properties each object has a exactly how each object is related to each other

const graphql = require('graphql');
//It just help us wal through collections of data and work with them
const axios = require('axios');

const { 
    //Tell to GraphQL the presence of a user in our app
    //that has an ID and has a first name property
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    //takes in a root query and returns a graph schema instance
    GraphQLSchema 

} = graphql;

//Why this one goes first?
const CompanyType = new GraphQLObjectType({
    name: 'Company',
    //With the way of closures inside of javascript!!!!:
    //We convert the field property into an arrow function that will return an object
    //that has a keys like id, name, description
    //This function gets defined but does not get executed until after the entire
    //file has been executed
    fields: () => ({
        id: {type: GraphQLString},
        name: {type: GraphQLString},
        description: {type: GraphQLString},

        users: {
            //When we go from a company to a user, we are going to have multiple users
            //associated with that one company
            type: new GraphQLList(UserType),
            
            //parent value is the instance of the company we are currently working with
            resolve(parentValue, args){
                return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
                .then(res=>res.data);
            }
        }
    })
});

//This object instruct GraphQl about what a user objeect looks like 
const UserType = new GraphQLObjectType({
    name: 'User',
    fields:()=> ({
        id:{ type: GraphQLString  },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        //We add our own 
        company: {
            type: CompanyType,
            //return the company associated with the given user from this function
            resolve(parentValue, args){
                return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
                .then(res=>res.data);
            }
        }
    })
});

//The purpose of the root query is to allow GraphQL to jump and land
//on every specific node in the graph of all our data
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: {
                id: {type: GraphQLString}
            },
            //The resolve function is where we actually go into our data base or our data store
            //and we find the actual data that we are looking for
            resolve(parentValue, args){
                //parentValue: no ever really being used ever
                //args: gets called with whatever arguments were passed into 
                //the origina query for example the id
                return axios.get(`http://localhost:3000/users/${args.id}`)
                //{data: { firstName: 'bill'} } 
                .then(resp=>resp.data);
            }
        },
        company: {
            type: CompanyType,
            args: {
                id: {type: GraphQLString}
            },
            resolve(parentValue, args){
                //network request
                return axios.get(`http://localhost:3000/companies/${args.id}`)
                .then(resp=>resp.data);
            }

        }
    }

});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: new GraphQLNonNull(GraphQLInt)},
                company: {type: GraphQLString}
            },
            resolve(parentValue, {firstName, age}){
                return axios.post('http://localhost:3000/users',{firstName, age})
                .then(res=>res.data)
            }
        },
        deleteUser:{
            type: UserType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)}
            },
            // { } -> This is destructuring from ES6
            resolve(parentValue, {id}){
                return axios.delete(`http://localhost:3000/users/${id}`)
                //compatibility between axios and GraphQL
                .then(resp=>resp.data);
            }
        },
        editUser:{
            type: UserType,
            args:{
                id: {type: new GraphQLNonNull(GraphQLString)},
                firstName: { type: GraphQLString },
                age: { type: GraphQLInt },
                company: { type: GraphQLString }
            },
            resolve(parentValue,args){
                return axios.patch(`http://localhost:3000/users/${args.id}`, args)
                .then(resp=>resp.data)
            }
        },
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    //mutation:mutation
    mutation
});