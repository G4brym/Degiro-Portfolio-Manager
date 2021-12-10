export default {
  currency: 'EUR',
  processData (rows) {
    var parsedRows = this.parseType(rows)
    var commissions = this.calculateCommissions(parsedRows)
    var positions = this.calculatePositions(parsedRows)
    var products = this.loadProductNames(rows)

    return {
      transactions: parsedRows,
      commissions,
      positions,
      products
    }
  },
  parseType (rows) {
    var buyAndSell = {}
    var dividends = []
    var commissions = []
    var deposits = []
    var withdraws = []
    var unknownRows = []

    rows.forEach(function (row) {
      const description = row.description.trim().toLowerCase()

      // commissions are ment to be a duplicated list of transactions
      if (description.includes('comissão')) {
        commissions.push(row)
      }

      if (row.orderId !== '') {
        if (!(row.orderId in buyAndSell)) {
          buyAndSell[row.orderId] = []
        }
        buyAndSell[row.orderId].push(row)
      } else if (description.includes('dividendo')) {
        dividends.push(row)
      } else if (description === 'flatex deposit') {
        deposits.push(row)
      } else if (description === 'flatex withdrawal') {
        withdraws.push(row)
      } else {
        unknownRows.push(row)
      }
    })

    return {
      buyAndSell,
      dividends,
      commissions,
      deposits,
      withdraws,
      unknownRows
    }
  },
  calculateCommissions (parsedRows) {
    var commissions = {}

    parsedRows.commissions.forEach(function (row) {
      if (!(row.changeCurrency in commissions)) {
        commissions[row.changeCurrency] = 0
      }

      commissions[row.changeCurrency] += row.changeAmount
    })

    if (commissions.length > 1) {
      console.log('WARNING: Found more than 1 currency for commissions')
    }
    return commissions[this.currency]
  },
  calculatePositions (parsedRows) {
    // This implements FIFO algorithm for realized PL
    var realizedPl = {}
    var closedPositions = {}
    var openPositions = {}

    var self = this
    Object.values(parsedRows.buyAndSell).forEach(function (order) {
      order.forEach(function (row) {
        const description = row.description.trim().toLowerCase()

        if (description.includes('compra') || description.includes('venda')) {
          const isPurchase = row.changeAmount < 0

          var amount = description.match('[0-9]+')
          var averagePrice = description.match('@[0-9,]+')[0].replace('@', '').replace(',', '.') // TODO: improve this regex

          averagePrice = parseFloat(averagePrice)

          var currency = row.changeCurrency
          if (currency !== self.currency) {
            var exchangeRate = self.findExchangeRateForOrder(order)

            if (exchangeRate === null) {
              console.log('WARNING: Exchange rate not found for order id ' + row.orderId)
            } else {
              averagePrice = averagePrice / exchangeRate
              currency = self.currency
            }
          }

          if (isPurchase === true) {
            // Add product code to active positions
            if (!(row.productCode in openPositions)) {
              openPositions[row.productCode] = []
            }

            // Insert 1 record for every unit bought
            for (let i = 0; i < amount; i++) {
              openPositions[row.productCode].push(averagePrice)
            }
          } else {
            // Operation is sell

            // Just to make sure the product is in our past purchases
            if (!(row.productCode in openPositions)) {
              console.log('WARNING: ' + row.productCode + ' was not found in previous purchases, using 0 as purchase price')

              openPositions[row.productCode] = []
              for (let i = 0; i < amount; i++) {
                openPositions[row.productCode].push(0)
              }
            }

            // Make sure closed product is in closed positions
            if (!(row.productCode in closedPositions)) {
              closedPositions[row.productCode] = []
            }

            // Add close currency to realized pl
            if (!(currency in realizedPl)) {
              realizedPl[currency] = 0
            }

            for (let i = 0; i < amount; i++) {
              var purchasePrice = openPositions[row.productCode].shift()
              var pl = averagePrice - purchasePrice

              realizedPl[currency] += pl

              // Register closed position
              closedPositions[row.productCode].push({
                productCode: row.productCode,
                openPrice: purchasePrice,
                closePrice: averagePrice,
                pl: pl,
                plPercentage: averagePrice * 100 / purchasePrice - 100
              })
            }
          }
        }
      })
    })

    if (realizedPl.length > 1) {
      console.log('WARNING: Found more than 1 currency for realizedPl')
    }

    return {
      realizedPl: realizedPl[this.currency],
      closedPositions,
      openPositions: Object.fromEntries(
        Object.entries(openPositions).filter(([key, value]) => value.length > 0))
    }
  },
  loadProductNames (rows) {
    var productsNames = {}
    rows.forEach(function (row) {
      if (!(row.productCode in productsNames) && row.productCode !== '') {
        productsNames[row.productCode] = row.product
      }
    })

    return productsNames
  },
  findExchangeRateForOrder (order) {
    var rate = null

    order.forEach(function (row) {
      if (row.exchangeRate !== '') {
        rate = row.exchangeRate
      }
    })

    return rate
  }
}
