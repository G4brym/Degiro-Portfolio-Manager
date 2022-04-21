export default {
  processData (rows) {
    var positions = this.calculatePositions(rows)
    var commissions = this.calculateCommissions(rows)
    var products = this.loadProductNames(rows)

    return {
      commissions,
      positions,
      products
    }
  },
  calculateCommissions (parsedRows) {
    var commissions = {}
    var sum = 0

    parsedRows.forEach(function (order) {
      if (!isNaN(order.commission)) {
        if (!(order.productCode in commissions)) {
          commissions[order.productCode] = 0
        }

        commissions[order.productCode] += order.commission
        sum += order.commission
      }
    })

    return {
      positions: commissions,
      sum
    }
  },
  calculatePositions (parsedRows) {
    // This implements FIFO algorithm for realized PL
    var realizedPl = 0
    var closedPositions = {}
    var openPositions = {}

    parsedRows.forEach(function (order) {
      if (order.isPurchase === true) {
        // Add product code to active positions
        if (!(order.productCode in openPositions)) {
          openPositions[order.productCode] = []
        }

        // Insert 1 record for every unit bought
        for (let i = 0; i < order.quantityChange; i++) {
          openPositions[order.productCode].push(order.averagePrice)
        }
      } else {
        // Operation is sell

        // Just to make sure the product is in our past purchases
        if (!(order.productCode in openPositions)) {
          console.log('WARNING: ' + order.productCode + ' was not found in previous purchases, using 0 as purchase price')

          openPositions[order.productCode] = []
          for (let i = 0; i < order.quantityChange; i++) {
            openPositions[order.productCode].push(0)
          }
        }

        // Make sure closed product is in closed positions
        if (!(order.productCode in closedPositions)) {
          closedPositions[order.productCode] = []
        }

        var commissionPerUnit = 0
        if (!isNaN(order.commission)) {
          commissionPerUnit = order.commission / order.quantityChange
        }

        for (let i = 0; i < order.quantityChange; i++) {
          var purchasePrice = openPositions[order.productCode].shift()
          var pl = order.averagePrice - purchasePrice

          realizedPl += pl

          // Register closed position
          closedPositions[order.productCode].push({
            productCode: order.productCode,
            openPrice: purchasePrice,
            closePrice: order.averagePrice,
            pl: pl,
            plPercentage: order.averagePrice * 100 / purchasePrice - 100,
            commission: commissionPerUnit
          })
        }
      }
    })

    return {
      realizedPl: realizedPl,
      closedPositions,
      openPositions: Object.fromEntries(
        Object.entries(openPositions).filter(([key, value]) => value.length > 0))
    }
  },
  loadProductNames (rows) {
    var productsNames = {}
    rows.forEach(function (row) {
      if (!(row.productCode in productsNames) && row.productCode !== '') {
        productsNames[row.productCode] = row.productName
      }
    })

    return productsNames
  }
}
