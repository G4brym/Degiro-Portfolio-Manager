import { createStore } from 'vuex'
import processor from '@/processor'

export default createStore({
  state: {
    calculated: {
      commissions: 0,
      realizedPl: 0
    },
    closedPositions: [],
    openPositions: [],
    transactions: {
      buyAndSell: {},
      dividends: [],
      commissions: [],
      deposits: [],
      withdraws: [],
      unknownRows: []
    },
    productNames: {},
    rawRows: []
  },
  mutations: {
    loadRawRows (state, rawRows) {
      state.rawRows = rawRows
      state.currency = rawRows[0].currencySymbol
    },
    loadProcessedData (state, payload) {
      state.transactions = payload.transactions

      state.closedPositions = payload.positions.closedPositions
      state.openPositions = payload.positions.openPositions
      state.productNames = payload.products

      state.calculated = {
        commissions: payload.commissions,
        realizedPl: payload.positions.realizedPl
      }
    }
  },
  actions: {
    processData (context) {
      var processedData = processor.processData(context.state.rawRows)

      context.commit('loadProcessedData', processedData)
    }
  },
  modules: {}
})
