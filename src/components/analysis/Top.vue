<template>
  <div class="row row-cols-1 row-cols-md-3 g-4">
    <div class="col">
      <div class="card" :class="{ selected: selectedTab === 0 }" @click="$emit('update:selectedTab', 0)">
        <div class="card-title">
          <span class="badge bg-info text-dark">
            <i class="bi bi-card-checklist"></i>
          </span>
        </div>
        <div class="card-body">
          <p class="card-text">{{Object.keys($store.state.openPositions).length}} Open Positions</p>
        </div>
      </div>
    </div>
    <div class="col">
      <div class="card" :class="{ selected: selectedTab === 1 }" @click="$emit('update:selectedTab', 1)">
        <div class="card-title">
          <span class="badge bg-success text-dark">
            <i class="bi bi-currency-euro"></i>
          </span>
        </div>
        <div class="card-body">
          <p class="card-text">{{$store.state.calculated.realizedPl.toFixed(2)}}{{$store.state.currency}} Profit/Loss</p>
        </div>
      </div>
    </div>
    <div class="col">
      <div class="card" :class="{ selected: selectedTab === 2 }" @click="$emit('update:selectedTab', 2)">
        <div class="card-title">
          <span class="badge bg-warning text-dark">
            <i class="bi bi-currency-exchange"></i>
          </span>
        </div>
        <div class="card-body">
          <p class="card-text">{{$store.state.calculated.commissions.sum.toFixed(2)}}{{$store.state.currency}} commissions</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    selectedTab: Number
  },
  emits: ['update:selectedTab']
}
</script>

<style scoped lang="scss">
.card {
  flex-direction: row;
  cursor: pointer;
  padding: 5px;
  min-height: 100%;

  .card-title {
    font-size: 40px;
    display: flex;
    align-items: center;
    margin: 0 5px;
  }

  &:hover, &.selected {
    background-color: #f1f1f1;
  }

  &.selected {
    cursor: auto
  }

  .bg-success {
    background-color: #66BB6A !important;
  }
}
</style>
