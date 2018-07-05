<template>
  <div class="accredit">
    <div class="btns">
      <Select class="select-btn" v-model="selectLayer" @on-change="handleSelectChange">
        <Option label="查询所有人员" :value="0"></Option>
        <Option label="查询所有一级人员" :value="1"></Option>
        <Option label="查询所有二级人员" :value="2"></Option>
        <Option label="查询所有三级人员" :value="3"></Option>
      </Select>
      <Button style="float:right" type="primary" @click="handleGetQrcode">获取授权码</Button>
    </div>
    <PersonData @refreshData="handleReFreshData" :data="listData" :layer="selectLayer" @on-message-click="handleClickMessage" ref="PersonData"></PersonData>
    <!-- 显示人员关系树 -->
    <Modal
      title="人员关系树"
      :width="600"
      v-model="showTreeModal"
      :value="true"
      :styles="{ top: '5%' }">
      <RelationTree :data="treeData"></RelationTree>
      <div slot="footer"></div>
    </Modal>
  </div>
</template>

<script>
import { ApiCreateCode, ApiFindPersonnel } from '@/api'
import PersonData from './personData'
import RelationTree from './relationTree'
export default {
  components: {
    PersonData,
    RelationTree
  },
  data () {
    return {
      userInfo: JSON.parse(this.$cookies.get('userInfo')),
      selectLayer: 0,
      modal: false,
      showTreeModal: false,
      treeData: null,
      listData: []
    }
  },
  methods: {
    async handleGetQrcode () {
      const data = {
        superiorLayerId: 0,
        enterpriceId: this.userInfo.id,
        uid: 0
      }
      const res = await ApiCreateCode(data)
      this.$Modal.info({
        title: '授权码',
        okText: '关闭',
        onOk: () => {
          this.$refs.PersonData.getPersonnel()
        },
        render: (h) => {
           return h('div', [
            h('div', {
              'class': { qrContent: true },
              attrs: {
                id: 'qrContent'
              }
            })
          ]) 
        }
      })
      this.$nextTick(() => {
        this.utils.qrcode('qrContent', res.msg, 300)
      })
    },
    /**
     * 点击查询信息
     */
    handleClickMessage (name, data) {
      if (name === 'node-tree') {
        this.treeData = data
        this.showTreeModal = true
      } else if (name === 'check-order') {
        this.$Message.warning('暂未开放')
      }
    },
    /**
     * 选择查询条件
     */
    async handleSelectChange (layer) {
      const data = {
        enterpriseId: this.userInfo.id,
        channelId: 0,
        layer
      }
      const res = await ApiFindPersonnel(data)
      if (res.data) {
        this.listData = res.data
      } else {
        this.listData = []
      }
    },
    handleReFreshData () {
      this.handleSelectChange(this.selectLayer)
    }
  },
  created () {
    this.handleSelectChange(0)
  }
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
<style lang='less'>
.qrContent {
  margin-top: 20px;
}
.qrContent img {
  margin: 0 auto;      
}
</style>
