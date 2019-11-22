import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'
import { logError } from '../../lib/log'
/*
Order of chain for editing a Date through seacrifog edit form(e.g. Dataproduct - date published):
-react-md DatePicker holds a value as a String. This value can only be a Date appropriate String
-editor-dataproducts.saveButtonOnClick() fires and passes the String to the mutation still as a String
-The mutation speaks to the API by passing the String as the value of Date.parseValue(value)
-parseValue verifies that value is able to be converted to a Date(which should always succeed since it comes from a DatePicker)
-value is returned as a String to be entered into the Postgres DB as a Postgres Date
-The value is in String format for the entirety of the order of chain except for once it is inserted into the postgres DB
Serialize
*/

//Custom GraphQL DataType. Apollo documentation: https://www.apollographql.com/docs/graphql-tools/scalars/
//Type acts as a Date. It is returned as a String. e.g.  "2015-12-03"
export default new GraphQLScalarType({
  name: 'Date',
  description: 'Custom scalar type for date objects represented as a string',

  //value from the client(reading input)
  //seacrifog edit forms make use of this
  parseValue(value) {
    const parsed = new Date(value)

    if (isNaN(parsed.getTime())) {
      console.log('parseValue error!')
      throw new Error('GraphQL scalar type (Date) error: Cannot parse value')
    }
    return parsed.toDateString() //STEVEN: changed to a string instead of Date
  },

  //value sent to the client(output). Value is a Date here as it comes from the DB, it is returned to the user as a String
  serialize(value) {
    try {
      return value.toISOString()
    } catch (error) {
      /* TODO */
      console.log('serialize error!')
    }
    return null
  },

  //value from the client(reading input).
  //Similar to parseValue. GraphQL input is similar to but not JSON. The input is taken as AST
  //JSON could be taken as input as well, which is where parseValue is used.
  //"Difference between parseValue and parseLiteral": https://stackoverflow.com/questions/41510880/whats-the-difference-between-parsevalue-and-parseliteral-in-graphqlscalartype
  //AST = Abstract Syntax Tree
  //GraphiQL interface makes use of this
  parseLiteral(ast) {
    //STEVEN: changed this to return a String instead of a JS Date.
    //JS Date can cause issues by applying the browsers time zone to the input.
    //This might be a known Node.JS bug on Windows: https://stackoverflow.com/questions/25753537/daylight-savings-time-wrongly-identified-by-node-js
    if (ast.kind === Kind.STRING) return new Date(ast.value).toDateString() //ast value is always in string format
    return null
  }
})
