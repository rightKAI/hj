<style lang="less" scoped>
@import './index.less';
.relation-tree {
  max-height: 80vh;
}
.tree-list {
  max-height: 70vh;
  overflow: auto;
}
</style>

<template>
  <Row class="relation-tree">
    <Col span="12">
      <div class="tree-list">
        <Tree :data="treeData || tempData" :render="treeRender"></Tree>
      </div>
    </Col>
    <Col span="12">
      <Card class="detail-card">
        <p slot="title">详细信息</p>
        <p>微信昵称：{{ details.nickname || '' }}</p>
        <p>性别：{{ details.sex === 1 ? '男' : '女' }}</p>
        <p>累计奖励金额:{{ details.bonusCount || 0 }}</p>
        <p>订单成交额:{{ details.countMoney || 0 }}</p>
        <p>达成的订单数:{{ details.orderCount || 0 }}</p>
        <p>手机号码：{{ details.userid || '' }}</p>
        <p>直属下级数量：{{ details.subordinateCount || '无' }}</p>
        <p>所有下级数量：{{ details.subordinateCountSum || '无' }}</p>
        <p>授权时间：{{ utils.timeFormat(details.createTime, 'yyyy-MM-dd HH:mm:ss') || '' }}</p>
        <p>授权地址：{{ details.address || '' }}</p>
      </Card>
    </Col>
  </Row>
</template>

<script>
import Axios from '@/api'

export default {
  data () {
    return {
      details: {},
      tempData: []
    }
  },
  props: {
    data: null
  },
  computed: {
    treeData () {
      let data = this.data
      if (data) {
        for (let obj of data) {
          this.handleData(obj)
        }
        return data
      } else {
        return null
      }
    }
  },
  methods: {
    /**
     * 树节点渲染
     */
    treeRender (h, { root, node, data }) {
      let showSubordinate
      if (data.layer !== 3) {
        showSubordinate = <p style="text-align: right;">
            <tag color="blue">直属下级人员数量：{ data.subordinateCount }</tag>
            <tag color="blue">所有下级人员数量：{ data.subordinateCountSum }</tag>
          </p>
      }
      return (
        <div
          onClick={
            () => {
              this.details = data
            }
          }
          style={
            `
            margin-left: 6px;
            cursor: pointer;
            display: inline-block;
            padding-right: 8px;
            border-radius: 40px;
            box-shadow: 0 1px 4px 0px #ccc;
            color: white;
            background: ${data.sex === 1 ? 'skyblue' : 'pink'}
            `
          }>
          <avatar src={ data.headimgurl }></avatar>
          <span style="margin: 0 8px">{ data.nickname }</span>
          <span>直属下级：{ data.subordinateCount }</span>
        </div>
      )
    },
    /**
     * 获取人员树数据
     */
    async getTreeData () {
      const res = await Axios.get('static/testData.json', {
        baseURL: ''
      })
      let treeData = res.data
      for (let obj of treeData) {
        this.handleData(obj)
      }
      this.tempData = treeData
      treeData = null
    },
    handleData (obj) {
      obj.children = obj.personnelVoList
      if (obj.children) {
        obj.expand = true
        for (let i of obj.children) {
          this.handleData(i)
        }
      }
    }
  },
  watch: {
    treeData (val) {
      if (val) {
        this.details = val[0]
      }
    }
  },
  created () {
    this.getTreeData()
  }
}
</script>
