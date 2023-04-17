<template>
    <h1>In depth analysis on all your positions</h1>
    <p class="fs-5 col-md-10">
        This tools is a quickly and easy way to build your taxes statements and know where you could save a buck or
        more.
        <br>
        Get started by Selecting a Transactions History Report from Degiro in .csv format.
    </p>

    <div class="mb-5">
        <input ref="fileInput" accept=".csv" class="visually-hidden" type="file" @change="loadCsv">
        <button class="btn btn-primary btn-lg px-4" @click.prevent="this.$refs.fileInput.click()">Select Transactions
            CSV
        </button>
    </div>

    <hr class="col-3 col-md-2 mb-5">

    <div class="row g-5">
        <div class="col-md-6">
            <h2>Privacy First</h2>
            <p>
                Everything is processed locally on your browser, and the file that you pick never leaves your machine.
                <br>
                This is an open source project, soo you can see by yourself what is being done to your data.
            </p>
            <ul class="icon-list">
                <li><a href="https://github.com/G4brym/Degiro-Portfolio-Manager" rel="noopener" target="_blank">Degiro
                    Portfolio Manager on Github</a></li>
            </ul>
        </div>

        <div class="col-md-6">
            <h2>Guides</h2>
            <p>Read more detailed instructions and documentation on using the Degiro Portfolio Manager.</p>
            <ul class="icon-list">
                <li>
                    <a href="https://github.com/G4brym/Degiro-Portfolio-Manager/tree/master/docs/extract-transactions-list.md"
                       rel="noopener" target="_blank">How to extract your Transactions history from Degiro</a></li>
            </ul>
        </div>
    </div>
</template>

<script>
import Papa from 'papaparse'

export default {
  data: function () {
    return {
      columnMapping: {
        0: 'date',
        2: 'productName',
        3: 'productCode',
        6: 'quantityChange',
        11: 'totalBalanceChange',
        14: 'commission',
        17: 'currency'
      },
      currencySymbols: {
        EUR: '€',
        USD: '$'
      }
    }
  },
  methods: {
    loadCsv (event) {
      const file = event.target.files[0]
      const reader = new FileReader()

      reader.onload = (res) => {
        this.parseCsv(res.target.result)
      }
      reader.onerror = (err) => console.log(err)
      reader.readAsText(file)
    },
    parseCsv (fileContents) {
      var rawLines = Papa.parse(fileContents).data.reverse()
      var parsedLines = []

      // Loop ends in length -1, because the list is reversed, soo last line is headers
      for (let i = 0; i < (rawLines.length - 1); i++) {
        const lineData = {}
        Object.entries(this.columnMapping).forEach(([key, value]) => {
          lineData[value] = rawLines[i][key]
        })

        lineData.quantityChange = Math.abs(parseInt((lineData.quantityChange || '')))
        lineData.totalBalanceChange = parseFloat((lineData.totalBalanceChange || '').replace(',', '.'))
        lineData.commission = parseFloat((lineData.commission || '').replace(',', '.'))

        lineData.currencySymbol = (lineData.currency || '').toUpperCase()
        if (lineData.currencySymbol in this.currencySymbols) {
          lineData.currencySymbol = this.currencySymbols[lineData.currencySymbol]
        }

        lineData.isPurchase = (lineData.totalBalanceChange < 0)
        lineData.totalBalanceChange = Math.abs(lineData.totalBalanceChange)
        lineData.averagePrice = lineData.totalBalanceChange / lineData.quantityChange

        if (lineData.date !== '') {
          parsedLines.push(lineData)
        }
      }

      this.$store.commit('loadRawRows', parsedLines)
      this.$store.dispatch('processData').then(() => {
        this.$router.push({ name: 'Analysis' })
      })
    },
  }
}
</script>

<style scoped>
.icon-list {
    padding-left: 0;
    list-style: none;
}

.icon-list li {
    display: flex;
    align-items: flex-start;
    margin-bottom: .25rem;
}

.icon-list li::before {
    display: block;
    flex-shrink: 0;
    width: 1.5em;
    height: 1.5em;
    margin-right: .5rem;
    content: "";
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23212529' viewBox='0 0 16 16'%3E%3Cpath d='M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z'/%3E%3C/svg%3E") no-repeat center center / 100% auto;
}
</style>
