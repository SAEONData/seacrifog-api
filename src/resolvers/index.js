import Variable from './types/variable'
import variables from './queries/variables'

import Protocol from './types/protocol'
import protocols from './queries/protocols'

export default {
  // Mutations
  // Mutation: {},

  // Queries
  Query: {
    variables,
    protocols
  },

  // Types
  Variable,
  Protocol
}
