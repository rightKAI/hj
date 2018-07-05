<style lang="less" scoped>
@import './index.less';
.carouselDiv {
  overflow: hidden;
  text-align: center;
  img {
    margin: 0 auto;
    width: 100%;
  }
}
</style>

<template>
  <div class="goods">
    <div class="goods-operation">
      <Button @click="handleAddNewGood" type="primary">新增商品</Button>
      <Button style="margin-left: 20px" v-if="userInfo && userInfo.parentid > 0" @click="handleUpdateGood" type="primary">更新总公司商品</Button>
    </div>
    <tabledata
    ref = 'table'
    page-position="center" 
    border 
    :columns="tableColumns"
    :queryUrl="queryUrl"
    :queryData="queryData"
    :type="type"
    :current="page"
    :pageSize="num"
    ></tabledata>
    <!-- 预览主图图片 -->
    <Modal
      title="预览主图"
      v-model="showPreview">
      <Carousel
        v-if="showPreview"
        :autoplay-speed="5000"
        autoplay>
        <CarouselItem v-for="img in previewList" :key="img">
          <div class="carouselDiv">
            <img :src="`${utils.handleImgPrefix(img)}`" alt="">
          </div>
        </CarouselItem>
      </Carousel>
      <div slot="footer"></div>
    </Modal>
  </div>
</template>

<script>
import tabledata from '@/components/tabledata'
import { ApiDeleteGoods, FINDGOODS, ApiUpdateGoods, ApiCopyGoods,ApiSetHotSale,ApiCancelHotSale} from '@/api'

export default {
  components: {
    tabledata
  },
  data () {
    return {
      showPreview: false,
      previewList: [],
      previewIndex: 0,
      deleteKeyList: ['brandName', 'categoryName', 'enterpriseName', 'refuseContents', 'salesVolume', 'goodsAttributeList'],
      userInfo: JSON.parse(this.$cookies.get('userInfo')),
      queryUrl: FINDGOODS,
      queryData: {
        enterpriseId: JSON.parse(this.$cookies.get('userInfo')).id
      },
      type: 'json',
      page: 1,
      num: 16,
      tableColumns: [
        {
          title: '编号',
          type: 'index',
          align: 'center',
          width: 80,
          key: 'id'
        },
        {
          title: '商品名称',
          align: 'center',
          key: 'goodsName'
        },
        {
          title: '商品主图',
          align: 'center',
          render: (h, params) => {
            return h('goodPreview', {
              props: {
                imgURLStr: params.row.imgURL
              },
              on: {
                'on-click': (list) => {
                  this.previewList = list
                  this.showPreview = true
                  this.$nextTick()
                }
              }
            })
          }
        },
        {
          title: '商品价格',
          align: 'center',
          key: 'price'
        },
        {
          title: '商品库存',
          align: 'center',
          key: 'amount'
        },
        {
          title: '最低折扣价',
          align: 'center',
          key: 'lowest_discountPrice'
        },
        {
          title: '状态',
          align: 'center',
          key: 'state',
          render: (h, params) => {
            const stateName = params.row.state === 0 ? '待审核'
                            : params.row.state === 1 ? '已审核'
                            : params.row.state === 2 ? '审核未通过:' + params.row.refuseContents
                            : params.row.state === 3 ? '上架'
                            : params.row.state === 4 ? '下架'
                            : params.row.state === 5 ? '热销商品':''
            const stateColor = params.row.state === 0 ? 'yellow'
                            : params.row.state === 1 ? 'green'
                            : params.row.state === 2 ? 'red'
                            : params.row.state === 3 ? 'green'
                            : params.row.state === 4 ? 'red' 
                            : params.row.state === 5 ? 'green' : ''
              if(params.row.mainGoodsType === 1 && params.row.state === 5){
                    return (
                       <span style={"color:red"} >热销商品</span>
                  )
              }else{
                  return (
                       <span style={`color: ${stateColor}`}>{ stateName }</span>
                  )
              }
          }
        },
        {
          title: '操作',
          align: 'center',
          render: (h, params) => {
            return (
              <div>
                <i-button type="text" onClick={
                  () => {
                    if (params.row.state === 0 || params.row.state === 2 || params.row.state === 3) {
                      this.$Message.info('该商品已上架或未通过审核')
                      return
                    }
                    this.$Modal.confirm({
                      title: '上架商品',
                      content: '确定要上架该商品吗？',
                      onOk: async () => {
                        const data = {...params.row, state: 3}
                        for (let i of this.deleteKeyList) {
                          delete data[i]
                        }
                        delete data._index
                        delete data._rowKey
                        delete data.createTime
                        const res = await ApiUpdateGoods(data, {col: 1})
                        if (res.errorCode === 1) {
                          this.$Message.success('上架成功')
                        } else {
                          this.$Message.info(res.msg)
                        }
                        this.refresh()
                      }
                    })
                  }
                }>上架</i-button>
                <i-button type="text" onClick={
                  () => {
                    if (params.row.state !== 3 && params.row.state !== 5) {
                      this.$Message.info('该商品并未处于上架状态')
                      return
                    }
                    this.$Modal.confirm({
                      title: '下架商品',
                      content: '确定要下架该商品吗？',
                      onOk: async () => {
                        params.row.mainGoodsType = 0
                        const data = {...params.row, state: 4}
                        for (let i of this.deleteKeyList) {
                          delete data[i]
                        }
                        delete data._index
                        delete data._rowKey
                        delete data.createTime
                        const res = await ApiUpdateGoods(data, {col:0})
                        if (res.errorCode === 1) {
                          this.$Message.success('下架成功')
                        } else {
                          this.$Message.info(res.msg)
                        }
                        this.refresh()
                      }
                    })
                  }
                }>下架</i-button>
                <i-button type="text" onClick={
                  () => {
                    if (params.row.state === 3) {
                      this.$Message.warning('请先下架再进行编辑')
                      return
                    }
                    sessionStorage.setItem('activeGoods', JSON.stringify(params.row))
                    this.$router.push({name: 'new_good', query: {goodsEvents: 'edit'}})
                  }
                }>编辑</i-button>
                <i-button type="text" onClick={
                  () => {
                    if (params.row.state === 3) {
                      this.$Message.warning('请先下架再进行删除操作')
                      return
                    }
                    this.$Modal.confirm({
                      content: '确认删除吗？',
                      onOk: () => {
                        this.deleteProd(params)
                      }
                    })
                  }
                }>删除</i-button>
                <i-button type="text" onClick={
                  () => {
                    if (params.row.state !== 3 && params.row.state !== 5) {
                      this.$Message.warning('请先上架再进行热销操作')
                      return
                    }
                    this.$Modal.confirm({
                      content: '确认将该商品设置为热销商品吗？',
                      onOk: () => {
                        this.setHotSale(params)
                      }
                    })
                  }
                }>{params.row.state === 5?'取消热搜':'设为热搜'}</i-button>
              </div>
            )
          }
        }
      ]
    }
  },
  methods: {
    // 删除产品
    async deleteProd (params) {
      const para = {
        goodsId: params.row.id,
        enterpriseId: params.row.enterpriseId
      }
      const res = await ApiDeleteGoods({}, para)
      if (res.errorCode > 0) {
        this.$Message.success('删除成功')
        this.$refs.table.updateData()
      } else {
        this.$Message.warning(res.msg)
      }
    },
    // 热销商品
    async setHotSale(params){
      let res 
      if(params.row.state === 5){
        res = await ApiSetHotSale({id : params.row.id}, 0)
      }else{
       res = await ApiSetHotSale({id : params.row.id}, 1)
      }
      if(res.errorCode > 0) {
        this.$Message.success('设置成功')
        this.$refs.table.updateData()

      }else{
        this.$Message.warning(res.msg)
      }
    },
    // 更新商品
    async handleUpdateGood () {
      this.$Message.loading({
        content: '更新中',
        duration: 0
      })
      const res = await ApiCopyGoods({ enterpriseId: this.userInfo.id })
      this.$Message.destroy()
      if (res.errorCode > 0) {
        this.$Message.success('更新成功')
        this.refresh()
      } else {
        this.$Message.error(res.msg)
      }
    },
    // 刷新列表
    refresh () {
      this.$refs.table.updateData()
    },
    handleAddNewGood () {
      this.$router.push({name: 'new_good', query: {goodsEvents: 'add'}})
    }
  }
}
</script>
