<template>
  <div class="body">
    <div class="top-card">
       <Input v-model.trim="serachRole" @keyup.native.enter="searchMemberData(true)" placeholder="搜索姓名" style="width: 200px;margin-top:73px;"></Input>
       <Button type="primary" @click.native="searchMemberData(true)" style="height:32px;height: 32px;margin-top: 73px;margin-left: 11px;" icon="ios-search">搜索</Button>
       <Button v-show="showBack" @click="back" type="info" style="height:32px;float:right;position: absolute;
    right: 34px;;height: 32px;margin-top: 73px;margin-left: 11px;">返回上级</Button>
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
import { ApiGetMemberList, ApiGetMemberChildList,ApiGetMemberBack } from '@/api'
export default {
data () {
  return {
    superiorId: '',
    searchVal: '',
    childId: '',
    serachRole: '',
    showBack: false,
    memberTotal: 0,
    tableStatus: true,
    tablePage: 1,
    tableNum: 7,
    columns7: [
      {
        title: '姓名',
        key: 'nickName',
        render: (h, params) => {
          return h('div', [
              h('Icon', {
                  props: {
                      type: 'person'
                  }
              }),
              h('strong', params.row.nickName)
          ]);
        }
      },
      {
        title: '二级代理数量',
        key: 'subordinateNum'
      },
      {
        title: '二级代理返利',
        key: 'subordinateIntegralRebate'
      },
      {
        title: '三级代理数量',
        key: 'threeLevelNum'
      },
      {
        title: '三级代理返利',
        key: 'threeLevelIntegralRebate'
      },
      {
        title: '消费总额',
        key: 'expenditure'
      },
      {
        title: '我的积分',
        key: 'integral'
      },
      {
        title: '操作',
        key: 'operation',
        width: 150,
        align: 'center',
        render: (h, params) => {
          return h('div', [
            h('Button', {
              props: {
                  type: 'primary',
                  size: 'small'
              },
              style: {
                  marginRight: '5px'
              },
              on: {
                  click: async () => {
                      this.tableStatus = true
                      let data = {
                        page: this.tablePage,
                        num: this.tableNum,
                        id: params.row.id
                      }
                      this.childId = params.row.id
                      let res = await ApiGetMemberChildList(data)
                      this.tableStatus = false
                      if (res.errorCode === -1) {
                        this.$Message.error(res.msg)
                        return false
                      } else if (res.data.length < 1) {
                        this. $Message.info('该用户暂无下级')
                        return false
                      }
                      this.memberData = res.data
                      this.memberTotal = res.msg-0
                      console.log(this.memberTotal)
                      this.superiorId = res.data[0].superiorId
                      this.showBack = true
                  }
              }
            }, '查看下级')
          ])
        }
      }
    ],
    memberData: []
  }
},
mounted () {
  this.searchMemberData()
},
methods: {
  async tableChange (page) {
    this.tablePage = page
    if (this.showBack && this.superiorId) {
      this.tableStatus = true
      let data = {
        page: this.tablePage,
        num: this.tableNum,
        id: this.superiorId
      }
      let res = await ApiGetMemberChildList(data)
      this.tableStatus = false
      if (res.errorCode === -1) {
        this.$Message.error(res.msg)
        return false
      }
      this.memberData = res.data
      this.showBack = true
    } else {
      this.searchMemberData()
    }
  },
  async back () {
    let data = {
      page: this.tablePage,
      num: this.tableNum,
      superiorId: this.superiorId
    }
    console.log(data)
    let res = await ApiGetMemberBack(data)
    this.memberTotal = res.msg-0
    if (res.data[0].superiorId === 0) {
      this.showBack = false
    } else {
      this.superiorId = res.data[0].superiorId
    }
    this.memberData = res.data
  },
  async searchMemberData (flag) {
    let pageNum = this.tablePage
    if (flag) {
      this.searchVal = this.serachRole
      this.tablePage = 1
    }
    let data = {
      num : this.tableNum,
      page : this.tablePage,
      nickName : this.searchVal || ''
    }
    this.tableStatus = true
    this.showBack = false
    let res = await ApiGetMemberList(data)
    if (res.errorCode !== 1) {
      this.$Message.error(res.msg)
      this.searchVal = ''
      this.tablePage = pageNum
      this.tableStatus = false
      return 
    } else {
      this.memberData = res.data
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

