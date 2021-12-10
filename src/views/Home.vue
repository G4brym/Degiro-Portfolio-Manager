<template>
  <h1>In depth analysis on all your positions</h1>
  <p class="fs-5 col-md-8">
    This tools is a quickly and easy way to build your taxes statements and know where you could save a buck or more.
    <br>
    Get started by Selecting a account statement report in .csv format.
  </p>

  <div class="mb-5">
    <input ref="fileInput" type="file" @change="loadCsv" class="visually-hidden" accept=".csv">
    <button class="btn btn-primary btn-lg px-4" @click.prevent="this.$refs.fileInput.click()">Select positions CSV</button>
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
        <li><a href="https://github.com/G4brym/Degiro-Portfolio-Manager" rel="noopener" target="_blank">Degiro Portfolio Manager on Github</a></li>
      </ul>
    </div>

    <div class="col-md-6">
      <h2>Guides</h2>
      <p>Read more detailed instructions and documentation on using or contributing to Bootstrap.</p>
      <ul class="icon-list">
        <li class="text-muted">How to extract an account statement (coming soon!)</li>
      </ul>
    </div>
  </div>
</template>

<script>
import Papa from 'papaparse'

export default {
  name: 'Home',
  data: function () {
    return {
      columnMapping: {
        0: 'date',
        1: 'hour',
        3: 'product',
        4: 'productCode',
        5: 'description',
        6: 'exchangeRate',
        7: 'changeCurrency',
        8: 'changeAmount',
        9: 'balanceCurrency',
        10: 'balanceAmount',
        11: 'orderId'
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

        lineData.exchangeRate = parseFloat((lineData.exchangeRate || '').replace(',', '.'))
        lineData.changeAmount = parseFloat((lineData.changeAmount || '').replace(',', '.'))
        lineData.balanceAmount = parseFloat((lineData.balanceAmount || '').replace(',', '.'))

        if (lineData.date !== '') {
          parsedLines.push(lineData)
        }
      }

      this.$store.commit('loadRawRows', parsedLines)
      this.$store.dispatch('processData').then(() => {
        this.$router.push({ name: 'Analysis' })
      })
    }
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
