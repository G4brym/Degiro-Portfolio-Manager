<template>
  <div class="row">
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
</template>

<script>
export default {
  props: ['selectedTab'],
  methods: {
    buildOpenPositionsData () {
      var processed = []

      Object.entries(this.$store.state.openPositions).forEach(([key, value]) => {
        var units = value.length
        var averagePrice = value.reduce((a, b) => a + b, 0) / units

        processed.push({
          id: key,
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
          id: key,
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
          id: key,
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
