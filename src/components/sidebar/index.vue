<style lang="less" scoped>
@import './index.less';
</style>

<template>
  <Menu theme="light" :active-name="$route.name" @on-select="handleMenuItemSelect" width="auto" class="sidebar">
    <!-- logo -->
    <div @click="jumpToHome" class="logo">
      黄金竹乡
    </div>
    <MenuItem v-if="userInfo && userInfo.parentid === 0" name="merchant"><Icon type="ios-albums"></Icon>子商户管理</MenuItem>
    <Submenu name="goodsManager">
      <template slot="title">
        <Icon type="bag"></Icon>
        商品管理
      </template>
      <MenuItem name="goods"><Icon type="ios-list"></Icon>商品列表</MenuItem>
      <MenuItem v-if="userInfo && userInfo.parentid === 0" name="verify"><Icon type="compose"></Icon>子商户商品审核</MenuItem>
    </Submenu>
    <Submenu name="orderManager">
      <template slot="title">
        <Icon type="ios-paper-outline"></Icon>
        订单管理
      </template>
      <MenuItem name="shopOrder"><Icon type="ios-cart"></Icon>商城订单管理</MenuItem>
      <MenuItem name="dispatchingOrder"><Icon type="printer"></Icon>配送单管理</MenuItem>
    </Submenu>
    <Submenu name="giftCenter">
      <template slot="title">
        <Icon type="ios-paper-outline"></Icon>
        礼品中心
      </template>
      <MenuItem name="gift"><Icon type="android-add-circle"></Icon>新增礼品</MenuItem>
      <MenuItem name="giftOrder"><Icon type="ios-list-outline"></Icon>礼品订单</MenuItem>
    </Submenu>
    <Submenu name="channelManager">
      <template slot="title">
        <Icon type="ios-barcode"></Icon>
        渠道管理
      </template>
      <MenuItem name="accredit"><Icon type="ios-personadd"></Icon>人员管理</MenuItem>
      <MenuItem name="reward"><Icon type="social-yen"></Icon>奖励设置</MenuItem>
    </Submenu>
    <!-- <MenuItem name="gift"><Icon type="iphone" size=18 style="margin: 0 12px 0 2px"></Icon>礼品中心</MenuItem> -->
    <MenuItem name="view"><Icon type="iphone" size=18 style="margin: 0 12px 0 2px"></Icon>页面设置</MenuItem>
    <Submenu name="wechatManager">
      <template slot="title">
        <Icon type="chatbubbles"></Icon>
        公众号设置
      </template>
      <MenuItem name="wxconfig"><Icon type="gear-b"></Icon>开发配置</MenuItem>
      <MenuItem name="wxmenu"><Icon type="navicon-round"></Icon>菜单设置</MenuItem>
    </Submenu>
    <Submenu name="member">
      <template slot="title">
        <Icon type="chatbubbles"></Icon>
        会员管理
      </template>
      <MenuItem name="memberPM"><Icon type="gear-b"></Icon>人员管理</MenuItem>
      <MenuItem name="rebateRecord"><Icon type="gear-b"></Icon>返利记录</MenuItem>
      <MenuItem name="memberRebate"><Icon type="navicon-round"></Icon>返利设置</MenuItem>
    </Submenu>
    <MenuItem name="users"><Icon type="person-stalker"></Icon>用户管理</MenuItem>
    <!-- <MenuItem name="statistics"><Icon type="pie-graph"></Icon>统计分析</MenuItem> -->
  </Menu>
</template>

<script>
export default {
  data () {
    return {
      logoImg: require('@/assets/logo.png'),
      userInfo: JSON.parse(this.$cookies.get('userInfo'))
    }
  },
  methods: {
    handleMenuItemSelect (name) {
      this.$router.push({name})
    },
    jumpToHome () {
      this.$router.push({name: 'home'})
    }
  }
}
</script>
