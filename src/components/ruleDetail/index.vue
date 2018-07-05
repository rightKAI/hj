<style lang="less" scoped>
.ruleDetail {
  font-size: 14px;
  line-height: 36px;
}
</style>

<template>
  <div class="ruleDetail">
    <Tabs value="defaultMember">
        <TabPane label="普通会员" name="defaultMember">
          <p v-for="(item, index) in detailList" :key="index" >第{{index+1}}级奖励：<span class="color-red">{{rebateForm=== 0? `${item.rebateValue}%`: `￥${item.rebateValue}`}}</span>，延期时数：{{item.delayDay === 0 ? '即时' : `${item.delayDay}时后`}}到账；<span style="color:red">{{ item.couldWinRebate === 1 ? '能够' : '不能' }}</span> 获得奖励</p>
        </TabPane>
        <TabPane label="VIP会员" name="vipMember">
          <p v-for="(item, index) in vipMemberRuleDetails" :key="index" >第{{index+1}}级奖励：<span class="color-red">{{rebateForm === 0? `${item.rebateValue}%`: `￥${item.rebateValue}`}}</span>，延期时数：{{item.delayDay === 0 ? '即时' : `${item.delayDay}时后`}}到账；<span style="color:red">{{ item.couldWinRebate === 1 ? '能够' : '不能' }}</span> 获得奖励</p>
        </TabPane>
    </Tabs>
  </div>
</template>

<script>
export default {
  props: {
    detailList: {
      type: Array
    },
    vipMemberRuleDetails: {
      type: Array
    },
    rebateForm: {
      type: Number
    }
  }
}
</script>
