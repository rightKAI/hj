<style lang="less" scoped>
@import './index.less';
</style>

<template>
  <div class="header">
    <Breadcrumb>
      <BreadcrumbItem
        v-for="(item, index) in breadcrumb"
        :key="item.name"
        :to="index !== breadcrumb.length - 1 ? {name: item.name} : ''">
        {{ item.title }}
      </BreadcrumbItem>
    </Breadcrumb>
    <div class="header-tools">
        <Button type="text">
          <Badge class="notify" dot count="3">
            <Icon size="22" type="android-notifications"></Icon>
          </Badge>
        </Button>
      <Button type="text" icon="log-out" @click="logout">退出登录</Button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'breadcrumb'
    ])
  },
  methods: {
    logout () {
      this.$cookies.remove('userInfo')
      this.$router.push({name: 'login'})
    }
  }
}
</script>
