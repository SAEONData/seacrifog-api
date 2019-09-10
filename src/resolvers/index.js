import GraphQLJSON from 'graphql-type-json'
import Date from './types/date'

import Variable from './types/variable'
import variable from './queries/variable'
import variables from './queries/variables'

import Protocol from './types/protocol'
import protocol from './queries/protocol'
import protocols from './queries/protocols'

import DataProduct from './types/dataproduct'
import dataProduct from './queries/dataproduct'
import dataProducts from './queries/dataproducts'

import Network from './types/network'
import networks from './queries/networks'

import RadiativeForcing from './types/radiative-forcing'
import radiativeForcings from './queries/radiative-forcings'

import ProtocolXrefVariable from './types/protocol-xref-variable'
import protocolsXrefVariables from './queries/protocols-xref-variables'

export default {
  // Mutations
  // Mutation: {},

  // Queries
  Query: {
    variable,
    variables,

    protocol,
    protocols,

    dataProduct,
    dataProducts,

    networks,
    radiativeForcings,

    protocolsXrefVariables
  },

  // Types
  JSON: GraphQLJSON,
  Date,

  Variable,
  Protocol,
  Network,
  DataProduct,
  RadiativeForcing,

  ProtocolXrefVariable
}
