<template>
    <div class="col-lg-8 mx-auto p-3 py-md-5">
        <Header/>
        <main>
            <router-view/>
        </main>
        <footer class="pt-5 my-5 text-muted border-top">
            Created by Gabriel Massadas
        </footer>
    </div>
</template>

<script>
import Header from '@/components/Header'

export default {
  components: { Header }
}
</script>

<style>
.bd-placeholder-img {
    font-size: 1.125rem;
    text-anchor: middle;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
}

@media (min-width: 768px) {
    .bd-placeholder-img-lg {
        font-size: 3.5rem;
    }
}
</style>
