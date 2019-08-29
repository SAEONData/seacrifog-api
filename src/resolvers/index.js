import GraphQLJSON from 'graphql-type-json'
import Date from './types/date'

import Variable from './types/variable'
import variables from './queries/variables'

import Protocol from './types/protocol'
import protocols from './queries/protocols'

import DataProduct from './types/data-product'
import dataProducts from './queries/data-products'

import Network from './types/network'
import networks from './queries/networks'

import RadiativeForcing from './types/radiative-forcing'
import radiativeForcings from './queries/radiative-forcings'

export default {
  // Mutations
  // Mutation: {},

  // Queries
  Query: {
    variables,
    protocols,
    dataProducts,
    networks,
    radiativeForcings
  },

  // Types
  JSON: GraphQLJSON,
  Date,

  Variable,
  Protocol,
  Network,
  DataProduct,
  RadiativeForcing
}
