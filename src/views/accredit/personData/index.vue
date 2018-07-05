<template>
<div class="personnelCard">
  <Card v-for="(item, index) in listData" :key="index" class="personnelCard_itemCard">
    <div slot="title">
      <Avatar class="personnelCard_itemCard_avatar" icon="person" size="large" :src="item.headimgurl" />
      <span class="personnelCard_itemCard_name">{{ item.nickname }}</span>
      <Icon :color="item.sex === 1 ? 'skyblue' : 'pink'" :type="item.sex === 1 ? 'male' : 'female'"></Icon>
    </div>
    <div class="personnelCard_itemCard_extra" slot="extra">
      <p><Icon type="flag"></Icon>&nbsp;所属层级:{{ item.layer }}</p>
      <Tag color="blue">{{ item.userid }}</Tag>
    </div>
    <div class="personnelCard_itemCard_content">
      <div class="personnelCard_itemCard_content_info" style="text-align: left">
        <Tag color="red">累计奖励金额:{{ item.bonusCount || 0 }}</Tag>
        <Tag color="red">订单成交额:{{ item.countMoney || 0 }}</Tag>
        <Tag color="red">达成的订单数:{{ item.orderCount || 0 }}</Tag>
      </div>
      <div class="personnelCard_itemCard_content_info" style="text-align: left">
        <Tag color="blue">直属下级人员数:{{ item.subordinateCount || '无' }}</Tag>
        <Tag color="blue">所有下级人员数:{{ item.subordinateCountSum || '无' }}</Tag>
      </div>
      <div class="personnelCard_itemCard_content_info">
        <Tag type="border" color="blue">授权时间:{{ utils.timeFormat(item.createTime, 'yyyy-MM-dd HH:mm:ss') }}</Tag>
        <Tag type="border" color="blue">授权地址:{{ item.address ? item.address : '授权时未允许获得地理位置信息' }}</Tag>
      </div>
      <div class="personnelCard_itemCard_content_btns">
        <Dropdown trigger="click">
          <Button type="ghost">
            信息查询
            <Icon type="arrow-down-b"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <!-- <DropdownItem @click.native="handleClick('check-order')">查询渠道相关订单</DropdownItem> -->
            <DropdownItem v-if="item.layer !== 3" @click.native="handleClick('node-tree', item)">查看下级人员关系树</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <!-- <Button type="ghost" @click="" icon="android-list">奖励记录</Button> -->
        <Dropdown trigger="click" class="personnelCard_itemCard_content_btns_btngroup" style="float:right;margin-bottom: 20px">
          <Button type="primary">
            人员操作
            <Icon type="arrow-down-b"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="operateByModel('replace', item)">替换人员</DropdownItem>
            <!-- <DropdownItem @click.native="operateByModel('stop', item)">状态切换</DropdownItem> -->
            <DropdownItem @click.native="operateByModel('delete', item)">删除人员</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  </Card>
  <!-- <Page class="personnelCard_page fr" :total="total" :page-size="30" @on-change="handlePageChange"></Page> -->
  <!-- 人员操作Modal -->
  <Modal 
    v-model="replaceModal"
    title="替换人员">
    <div v-if="replaceList.length === 0" style="font-size: 16px;font-weight: bold; text-align: center">无可替换人员</div>
    <div v-else>
      <Alert show-icon type="info">
        替换人员规则:
        <p slot="desc">替换的人员必须是同渠道链中的某人</p>
      </Alert>
      <!-- <p>替换二维码：</p> -->
      <div id="codeContainer" style="text-align: center" ref="codeContainer"></div>
      <Table border :columns="replaceTable" :data="replaceList"></Table>
    </div>
    <div slot="footer"></div>
  </Modal>
</div>
</template>

<script>
import Axios, { env, ApiFindPersonnel, ApiReplacePersonnel, ApiDeleteChannel } from '@/api'
export default {
  data () {
    return {
      id: JSON.parse(this.$cookies.get('userInfo')).id,
      replaceModal: false,
      replaceId: '',
      loading: true,
      selectItem: '',
      finalList: [],
      replaceTable: [
        {
          type: 'index',
          title: '序号',
          align: 'center'
        },
        {
          title: '昵称',
          align: 'center',
          key: 'nickname'
        },
        {
          title: '操作',
          align: 'center',
          render: (h, params) => {
            return (
              <i-button type="text" onClick={
                async () => {
                  this.$Modal.confirm({
                    title: '替换确认',
                    content: `是否将${this.selectItem.nickname}替换为${params.row.nickname}？`,
                    onOk: async () => {
                      const res = await ApiReplacePersonnel(this.id, params.row.openid, this.selectItem.openid)
                      if (res.errorCode > 0) {
                        this.$Message.success('替换成功')
                        this.replaceModal = false
                        this.$emit('refreshData')
                      } else {
                        this.$Notice.error({
                          title: '替换失败',
                          desc: res.msg
                        })
                      }
                    }
                  })
                }
              }>选择替换</i-button>
            )
          }
        }
      ]
    }
  },
  props: {
    data: null,
    layer: Number
  },
  computed: {
    listData () {
      if (this.data && this.layer === 0) {
        this.openTree(this.data)
        this.finalList = this._.reverse(this._.sortBy(this.finalList, function (o) {
          return o.createTime
        }))
        return this.finalList
      } else {
        return this.data
      }
    },
    replaceList () {
      if (this.selectItem !== '') {
        let tempArr = []
        for (let i of this.listData) {
          if (i.layer === this.selectItem.layer && i.id !== this.selectItem.id) {
            tempArr.push(i)
          }
        }
        return tempArr
      } else {
        return []
      }
    }
  },
  methods: {
    // 人员操作
    operateByModel (events, data) {
      this.selectItem = data
      events === 'replace' ? this.replaceModal = true : this.delete()
    },
    // 确定替换人员
    async confirmReplace () {
      if (this.listData.length < 2) {
        this.replaceModal = false
        return
      }
      if (this.replaceId === '') {
        this.$Message.warning('请选择人员')
        this.loading = false
        this.$nextTick(() => {
          this.loading = true
        })
      } else {
        const data = {
          enterpriseid: this.id,
          channelId: 0,
          userId: this.selectId,
          replaceId: this.replaceId
        }
        const res = await ApiReplacePersonnel(data)
        if (res.errorCode > 0) {
          this.$Message.success('替换成功')
        } else {
          this.$Message.warning(res.msg)
        }
      }
    },
    // 删除人员
    delete () {
      this.$Modal.confirm({
        content: '确定删除该人员吗？',
        onOk: async () => {
          const data = {
            enterpriseid: this.id,
            channelId: this.selectItem.id
          }
          const res = await ApiDeleteChannel(data)
          if (res.errorCode > 0) {
            this.$Message.success('删除成功')
            this.$emit('refreshData')
          } else {
            this.$Message.warning(res.msg)
          }
        }
      })
    },
    // 获取测试数据
    async getTestData () {
      const res = await Axios.get('/static/testData.json', {
        baseURL: ''
      })
      let list = res.data
      this.finalList = []
      this.openTree(list)
      this.finalList = this._.reverse(this._.sortBy(this.finalList, function (o) {
        return o.createTime
      }))
    },
    // 展开子树数据
    openTree (list, t = 0) {
      if (t === 0) {
        this.finalList = [ ...list ]
      }
      for (let i in list) {
        if (list[i].personnelVoList && !list[i].personnelVoList[0].$ref) {
          this.openTree(list[i].personnelVoList, t + 1)
          this.finalList = [...this.finalList, ...list[i].personnelVoList]
        }
      }
    },
    // 点击信息查询
    handleClick (name, data) {
      this.$emit('on-message-click', name, [data])
    }
  },
  mounted () {
    if (env === 'development') {
      this.getTestData()
    }
    // this.getPersonnel()
  }
}
</script>

<style lang='less' scoped>
@import './index.less';
</style>
