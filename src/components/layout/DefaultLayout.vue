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
    background-color: rgba(220, 106, 7, 0.052);
  }
</style>