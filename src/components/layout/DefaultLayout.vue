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
  <CityConfirmModal />
  </div>
</template>

<script>
import PageHeader from '../../PageHeader.vue'
import PageFooter from './PageFooter.vue'
import CityConfirmModal from './CityConfirmModal.vue'

export default {
    components:{
        PageHeader, 
        PageFooter,
        CityConfirmModal,
    }
}
</script>
<style scoped>
  .main-content{
    background-color: rgba(243, 181, 127, 0.066);
  }
</style>