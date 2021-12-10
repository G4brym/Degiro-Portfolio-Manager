<template>
  <Top class="mb-4" v-model:selectedTab="selectedTab" />
  <List :selectedTab="selectedTab"/>
</template>

<script>
import Top from '@/components/analysis/Top'
import List from '@/components/analysis/List'
export default {
  name: 'Analysis',
  mounted () {
    if (this.$store.state.rawRows.length === 0) {
      this.$router.push({ name: 'Home' })
    }
  },
  components: { List, Top },
  data: function () {
    return {
      selectedTab: 0
    }
  }
}
</script>
