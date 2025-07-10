<template>
    <div >
    <!--Header-->
  <PageHeader/>

  <!--Main Content-->

  <main class = "main-content">
    <router-view></router-view>
  </main>

  <!--Footer-->
  <PageFooter/>
  </div>
</template>

<script>
import PageHeader from '../../PageHeader.vue'
import PageFooter from './PageFooter.vue'

export default {
    components:{
        PageHeader, 
        PageFooter,
    }
}
</script>
<style scoped>
  .main-content{
    padding-top: 8px;
    background-color: rgba(214, 100, 0, 0.066);
  }
</style>