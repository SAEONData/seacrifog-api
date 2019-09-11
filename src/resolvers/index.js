import GraphQLJSON from 'graphql-type-json'
import Date from './types/date'

import Variable from './types/variable'
import variable from './queries/variable'
import variables from './queries/variables'

import Protocol from './types/protocol'
import protocol from './queries/protocol'
import protocols from './queries/protocols'

import Dataproduct from './types/dataproduct'
import dataproduct from './queries/dataproduct'
import dataproducts from './queries/dataproducts'

import Network from './types/network'
import networks from './queries/networks'

import RadiativeForcing from './types/radiative-forcing'
import radiativeForcings from './queries/radiative-forcings'

import ProtocolXrefVariable from './types/protocol-xref-variable'
import protocolsXrefVariables from './queries/protocols-xref-variables'

import DataproductXrefVariable from './types/dataproduct-xref-variable'
import dataproductsXrefVariables from './queries/dataproducts-xref-variables'

export default {
  // Mutations
  // Mutation: {},

  // Queries
  Query: {
    variable,
    variables,

    protocol,
    protocols,

    dataproduct,
    dataproducts,

    networks,
    radiativeForcings,

    protocolsXrefVariables,
    dataproductsXrefVariables
  },

  // Types
  JSON: GraphQLJSON,
  Date,

  Variable,
  Protocol,
  Network,
  Dataproduct,
  RadiativeForcing,

  ProtocolXrefVariable,
  DataproductXrefVariable
}
