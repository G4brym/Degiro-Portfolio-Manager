<template>
    <div class="form-group mb-5" v-if="this.selectedTab === 1">
        <label for="exampleSelect1" class="form-label mt-4">Tax year</label>
        <select class="form-select" id="selectedYear" v-model="selectedYear">
            <option :value="null">All</option>
            <option v-for="year in Object.keys($store.state.closedPositions)" :key="year" :value="year"
                    v-text="year"></option>
        </select>
    </div>
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
        <button class="btn btn-success btn-sm me-2" type="button" @click="exportAsCsv">Export as CSV</button>
        <button v-if="this.selectedTab === 1" class="btn btn-success btn-sm" type="button" @click="exportTaxReport">
            Export Tax Report
        </button>
    </div>
</template>

<script>
export default {
  props: ['selectedTab'],
  data: function () {
    return {
      tableData: [],
      selectedYear: null
    }
  },
  methods: {
    exportAsCsv () {
      this.downloadCsv(this.tableData, 'export')
    },
    exportTaxReport () {
      var data = []

      for (const [year, positions] of Object.entries(this.$store.state.closedPositions)) {
        if (this.selectedYear !== null && this.selectedYear !== year) {
          continue
        }

        for (const [key, rows] of Object.entries(positions)) {
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
        }
      }

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

      for (const [year, positions] of Object.entries(this.$store.state.closedPositions)) {
        if (this.selectedYear !== null && this.selectedYear !== year) {
          continue
        }

        for (const [key, rows] of Object.entries(positions)) {
          var sumPl = 0
          var sumPlPercentage = 0
          var units = rows.length

          rows.forEach(function (row) {
            sumPl += row.pl
            sumPlPercentage += row.plPercentage
          })

          processed.push({
            year: year,
            ISIN: key,
            name: this.$store.state.productNames[key],
            units,
            pl: sumPl.toFixed(2) + this.$store.state.currency,
            'average pl percentage': (sumPlPercentage / units).toFixed(2) + '%'
          })
        }
      }

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
  mounted () {
    this.tableData = this.buildOpenPositionsData()
  },
  watch: {
    selectedTab (newValue, oldValue) {
      if (newValue !== oldValue || !this.selectedTab || this.tableData.length === 0) {
        if (this.selectedTab === 0) {
          this.tableData = this.buildOpenPositionsData()
        } else if (this.selectedTab === 1) {
          this.tableData = this.buildClosedPositionsData()
        } else if (this.selectedTab === 2) {
          this.tableData = this.buildCommissionsData()
        } else {
          this.tableData = this.$store.state.closedPositions
        }
      }
    },
    selectedYear () {
      if (this.selectedTab === 1) {
        this.tableData = this.buildClosedPositionsData()
      }
    }
  },
}
</script>
