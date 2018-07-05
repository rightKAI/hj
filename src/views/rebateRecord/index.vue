<template>
  <div class="body">
    <div class="top-card">
      <div style="margin-top:72px;padding-right:20px;">
        <span style="vertical-align: middle;font-size: 14px;font-weight: bold;">查找方式:</span>
        <Select v-model="chooseWay" style="width:200px">
            <Option v-for="item in chooseWayList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
      </div>
       <Input v-model.trim="serachRole" @keyup.native.enter="searchMemberData(true)" placeholder="请输入查询信息" style="width: 200px;margin-top:73px;"></Input>
       <div style="padding-top:72px;margin-left:20px;">
        <DatePicker type="daterange" placement="top-start" @on-change="datePiker" :start-date="new Date()" placeholder="选择日期" style="width: 200px"></DatePicker>
       </div>
       <Button type="primary" @click.native="searchMemberData(true)" style="height:32px;height: 32px;margin-top: 73px;margin-left: 11px;" icon="ios-search">搜索</Button>
    </div>
    <div class="card">
      <div style="height:390px">
        <Table :stripe="true" :loading="tableStatus" :highlight-row="true" no-data-text="暂无会员数据" border :columns="columns7" :data="memberData"></Table>
      </div>
      <div style="text-align:center;margin-top:20px;">
        <Page :total="memberTotal" :current="tablePage" @on-change="tableChange" :page-size="tableNum"></Page>
      </div>
    </div>
  </div>
</template>

<script>
import { ApiGetRebateRecordList, ApiGetMemberChildList,ApiGetMemberBack } from '@/api'
export default {
data () {
  return {
    superiorId: '',
    searchVal: '',
    childId: '',
    serachRole: '',
    chooseWay: 'name',
    date: [],
    chooseWayList: [
      {
          value: 'name',
          label: '会员名称'
      },
      {
          value: 'userId',
          label: '手机号码'
      },
      {
          value: 'orderNumber',
          label: '订单号'
      }
    ],
    memberTotal: 0,
    tableStatus: true,
    tablePage: 1,
    tableNum: 7,
    columns7: [
      {
        title: '会员名称',
        key: 'name'
      },
      {
        title: '联系方式',
        key: 'userId'
      },
      {
        title: '会员类型',
        key: 'memberType'
      },
      {
        title: '商品名称',
        key: 'goodsName'
      },
      {
        title: '订单号',
        key: 'orderNumber'
      },
      {
        title: '返利规则',
        key: 'ruleName'
      },
      {
        title: '角色',
        key: 'role'
      },
      {
        title: '返利方式',
        key: 'rebateWay'
      },
      {
        title: '返利值',
        key: 'rebateValue'
      },
      {
        title: '发放时间',
        key: 'createTime'
      }
    ],
    memberData: []
  }
},
mounted () {
  this.searchMemberData()
},
methods: {
  datePiker (val) {
    this.date = val
  },
  async tableChange (page) {
    this.tablePage = page
    if (this.showBack && this.superiorId) {
      this.tableStatus = true
      let data = {
        page: this.tablePage,
        num: this.tableNum
      }
      let res = await ApiGetRebateRecordList(data)
      this.tableStatus = false
      if (res.errorCode === -1) {
        this.$Message.error(res.msg)
        return false
      }
      this.memberData = res.data
      let isChange = await this.changeType()
      this.showBack = true
    } else {
      this.searchMemberData()
    }
  },
  changeType () {
    for (let item of this.memberData) {
      item.memberType = item.memberType === 1 ? 'VIP会员' : '普通会员'
      switch (item.rebateWay) {
        case 0:
          item.rebateWay = '积分'
          break;
        case 1:
          item.rebateWay = '优惠券'
          break;
        case 2:
          item.rebateWay = '余额'
          break;
      }
      switch (item.role) {
        case 0:
          item.role = '消费者'
          break;
        case 1:
          item.role = '父级消费者'
          break;
        case 2:
          item.role = '祖级消费者'
          break;
      }
      item.createTime = this.fmtDate(item.createTime)
    }
    return true
  },
  fmtDate (obj) {
    var date =  new Date(obj);
    var y = 1900+date.getYear()
    var m = "0"+(date.getMonth()+1)
    var d = "0"+date.getDate()
    return y+"-"+m.substring(m.length-2,m.length)+"-"+d.substring(d.length-2,d.length)
  },
  async searchMemberData (flag) {
    let pageNum = this.tablePage
    if (flag) {
      this.searchVal = this.serachRole
      this.tablePage = 1
    }
    let data = {
      num : this.tableNum,
      page : this.tablePage
    }
    if (this.date.length === 2) {
      data.startDate = this.date[0]
      data.endDate = this.date[1]
    }
    let postData = {
    }
    let chooseWay = ''
    switch (this.chooseWay) {
      case 'name': 
        postData.name = this.searchVal
        break;
      case 'orderNumber': 
        postData.orderNumber = this.searchVal
        break;
      case 'userId': 
        postData.userId = this.searchVal
        break;
    }
    this.tableStatus = true
    this.showBack = false
    let res = await ApiGetRebateRecordList(postData,data)
    if (res.errorCode !== 1) {
      this.$Message.error(res.msg)
      this.searchVal = ''
      this.tablePage = pageNum
      this.tableStatus = false
      return 
    } else {
      this.memberData = res.data
      this.changeType()
      this.memberTotal = res.msg-0
    }
    this.tableStatus = false
  }
}
}
</script>

<style  lang="less" scoped>
.body{
  height: 100%;
  width: 100%;
  background: #f5f5f5;
  overflow: hidden;
}
.top-card{
  width: 98%;
  margin: 0 auto;
  min-height: 126px;
  display: flex;
  margin-top: 37px;
  margin-bottom: 25px;
  background-color: #fff;
  border-radius: 5px;
  padding: 20px;
  box-sizing: border-box;
  &:hover{
    box-shadow: 0 1px 6px rgba(0,0,0,.2);
    border-color: #eee;
  }
}
.card{
  width: 98%;
  margin: 0 auto;
  height: 450px;
  background: #fff;
  box-sizing:border-box;
  border-radius: 5px;
  &:hover{
    box-shadow: 0 1px 6px rgba(0,0,0,.2);
    border-color: #eee;
  }
}
</style>

