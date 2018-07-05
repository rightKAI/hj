<template>
  <div class="layout-default">
    <div class="left-content">
      <!-- 侧边栏 -->
      <sidebar></sidebar>
    </div>
    <div class="right-content">
      <!-- 头部 -->
      <s-header></s-header>
      <div class="main-content">
        <transition mode="out-in">
          <router-view></router-view>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import sidebar from '@/components/sidebar'
import sHeader from '@/components/header'

export default {
  components: {
    sHeader,
    sidebar
  }
}
</script>

<style lang="less" scoped>
@import './default.less';
</style>
