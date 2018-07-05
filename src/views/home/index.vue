<style lang="less" scoped>
@import './index.less';
</style>

<template>
  <div class="home">
    <Card class="base-info">
      <p slot="title">商城入口</p>
      <Alert v-if="showAlert" show-icon type="warning">商家未设置公众号无法进入商城</Alert>
      <div class="qrcode" id="qrcode"></div>
      <p class="link">{{ shopWxAddress }}</p>
    </Card>
  </div>
</template>

<script>
import { ApiFindWechatMenu } from '@/api'

export default {
  data () {
    return {
      userInfo: JSON.parse(this.$cookies.get('userInfo')),
      showAlert: false
    }
  },
  computed: {
    shopWxAddress () {
      let host
      if (location.host.indexOf('ceshi') > -1) {
        host = 'csm.zgdz.org.cn'
      } else {
        host = 'cyc8.cn'
      }
      return location.protocol + '//' + host + '/web/pdshop-m/?#/m/home?shopId=' + this.userInfo.id
    }
  },
  methods: {
    async getWxConfig () {
      const res = await ApiFindWechatMenu(this.userInfo.id)
      if (res.errorCode < 0) {
        this.showAlert = true
      }
    },
    renderQRCode () {
      this.utils.qrcode('qrcode', this.shopWxAddress, 120)
    }
  },
  mounted () {
    this.getWxConfig()
    this.renderQRCode()
  }
}
</script>
