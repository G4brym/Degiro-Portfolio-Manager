<template>
  <div class="row">
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
        <tr>
          <template v-for="(value, key) in tableData[0]" :key="key">
            <td class="fw-bold text-capitalize" v-text="key"></td>
          </template>
        </tr>
        </thead>
        <tbody>
        <tr v-for="row in tableData" :key="row.id">
          <td v-for="(value, key) in row" :key="key" v-text="value"></td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div>
    <button type="button" class="btn btn-success btn-sm me-2" @click="exportAsCsv">Export as CSV</button>
    <button v-if="this.selectedTab === 1" type="button" class="btn btn-success btn-sm" @click="exportTaxReport">Export Tax Report</button>
  </div>
</template>

<script>
export default {
  props: ['selectedTab'],
  methods: {
    exportAsCsv () {
      this.downloadCsv(this.tableData, 'export')
    },
    exportTaxReport () {
      var data = []

      Object.entries(this.$store.state.closedPositions).forEach(([key, rows]) => {
        var sumBuy = 0
        var sumSell = 0
        var commissions = 0
        var units = rows.length

        rows.forEach(function (row) {
          sumBuy += row.openPrice
          sumSell += row.closePrice
          if (!isNaN(row.commission)) {
            commissions += row.commission
          }
        })

        var totalBuys = sumBuy.toFixed(2)
        var totalSells = sumSell.toFixed(2)
        commissions = commissions.toFixed(2)
        var total = (totalSells - totalBuys - commissions).toFixed(2)

        data.push({
          ISIN: key,
          name: this.$store.state.productNames[key].replace(',', ''), // TODO: implement a safe output
          units,
          totalBuys: totalBuys + this.$store.state.currency,
          totalSells: totalSells + this.$store.state.currency,
          commissions: commissions + this.$store.state.currency,
          total: total + this.$store.state.currency
        })
      })

      this.downloadCsv(data, 'tax_report')
    },
    downloadCsv (data, filename) {
      var listData = []

      listData.push(Object.keys(data[0]))
      data.forEach((row) => {
        listData.push(Object.values(row))
      })

      const csvContent = 'data:text/csv;charset=utf-8,' + listData.map(e => e.join(',')).join('\n')

      var encodedUri = encodeURI(csvContent)
      var link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', filename + '.csv')
      document.body.appendChild(link)
      link.click()
    },
    buildOpenPositionsData () {
      var processed = []

      Object.entries(this.$store.state.openPositions).forEach(([key, value]) => {
        var units = value.length
        var averagePrice = value.reduce((a, b) => a + b, 0) / units

        processed.push({
          ISIN: key,
          name: this.$store.state.productNames[key],
          units,
          'average price': averagePrice.toFixed(2) + this.$store.state.currency
        })
      })

      return processed
    },
    buildClosedPositionsData () {
      var processed = []

      Object.entries(this.$store.state.closedPositions).forEach(([key, rows]) => {
        var sumPl = 0
        var sumPlPercentage = 0
        var units = rows.length

        rows.forEach(function (row) {
          sumPl += row.pl
          sumPlPercentage += row.plPercentage
        })

        processed.push({
          ISIN: key,
          name: this.$store.state.productNames[key],
          units,
          pl: sumPl.toFixed(2) + this.$store.state.currency,
          'average pl percentage': (sumPlPercentage / units).toFixed(2) + '%'
        })
      })

      return processed
    },
    buildCommissionsData () {
      var processed = []

      Object.entries(this.$store.state.calculated.commissions.positions).forEach(([key, value]) => {
        processed.push({
          ISIN: key,
          name: this.$store.state.productNames[key],
          'Total Commissions': value.toFixed(2) + this.$store.state.currency
        })
      })

      return processed
    }
  },
  computed: {
    tableData: function () {
      if (this.selectedTab === 0) {
        return this.buildOpenPositionsData()
      } else if (this.selectedTab === 1) {
        return this.buildClosedPositionsData()
      } else if (this.selectedTab === 2) {
        return this.buildCommissionsData()
      }
      return this.$store.state.closedPositions
    }
  }
}
</script>
