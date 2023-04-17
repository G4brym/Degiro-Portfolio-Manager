<template>
    <template v-if="this.$store.state.rawRows.length>0">
        <Top v-model:selectedTab="selectedTab" class="mb-4"/>
        <List :selectedTab="selectedTab"/>
    </template>
</template>

<script>
import Top from '@/components/analysis/Top'
import List from '@/components/analysis/List'

export default {
  mounted () {
    if (this.$store.state.rawRows.length === 0) {
      this.$router.push({ name: 'Home' })
    }
  },
  components: {
    List,
    Top
  },
  data: function () {
    return {
      selectedTab: 0
    }
  }
}
</script>
