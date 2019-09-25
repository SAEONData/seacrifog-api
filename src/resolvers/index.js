import GraphQLJSON from 'graphql-type-json'
import Date from './types/date'

import Variable from './types/variable'
import variable from './queries/variable'
import variables from './queries/variables'
import updateVariables from './mutations/update-variables'

import Protocol from './types/protocol'
import protocol from './queries/protocol'
import protocols from './queries/protocols'
import updateProtocols from './mutations/update-protocols'

import Dataproduct from './types/dataproduct'
import dataproduct from './queries/dataproduct'
import dataproducts from './queries/dataproducts'
import updateDataproducts from './mutations/update-dataproducts'

import Site from './types/site'
import sites from './queries/sites'

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
  Mutation: {
    updateVariables,
    updateProtocols,
    updateDataproducts
  },

  // Queries
  Query: {
    variable,
    variables,

    protocol,
    protocols,

    dataproduct,
    dataproducts,

    sites,

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
  Site,
  Dataproduct,
  RadiativeForcing,

  ProtocolXrefVariable,
  DataproductXrefVariable
}
