<style lang="less">
@import 'index.less';
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
    <div class="selectState">
      <Select v-model="state" class="select" @on-change="selectState">
        <Option v-for="item in stateType" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
    </div>
    <tabledata 
    page-position="center" 
    border 
    :columns="tableColumns"
    :data="listData"
    :current="page"
    :pageSize="num"
    :total="total"
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
    <!-- 查看商品详情 -->
    <Modal
      width="80"
      v-model="showDetail">
        <div v-html="contents"></div>
        <div slot="footer"></div>
    </Modal>
  </div>
</template>

<script>
import tabledata from '@/components/tabledata'
import { ApiGetAuditingList, ApiUpdateGoodsState } from '@/api'
export default {
  components: {
    tabledata,
    ApiGetAuditingList,
    ApiUpdateGoodsState
  },
  data () {
    return {
      previewList: [],
      showPreview: false,
      showDetail: false,
      contents: '',
      state: -1,
      stateType: [{
        value: -1,
        label: '全部商品'
      },
      {
        value: 0,
        label: '待审核'
      },
      {
        value: 2,
        label: '审核未通过'
      },
      {
        value: 3,
        label: '上架'
      },
      {
        value: 4,
        label: '下架'
      },],
      reason: '',
      listData: [],
      page: 1,
      total: null,
      num: 17,
      tableColumns: [
        {
          title: '产品ID',
          align: 'center',
          key: 'goodsId'
        },
        {
          title: '商品名称',
          align: 'center',
          key: 'goodsName'
        },
        {
          title: '价格',
          align: 'center',
          key: 'price'
        },
        {
          title: '类目',
          align: 'center',
          key: 'categoryName'
        },
        {
          title: '创建时间',
          align: 'center',
          key: 'createTime'
        },
        {
          title: '主图',
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
          title: '子商户名称',
          align: 'center',
          key: 'name'
        },
        {
          title: '状态',
          align: 'center',
          key: 'state'
        },
        {
          title: '操作',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'text'
                },
                on: {
                  click: () => {
                    this.contents = params.row.contents
                    this.showDetail = true
                  }
                }
              }, '查看商品详情'),
              h('Button', {
                'class': { hide: params.row.state !== '待审核', buttonColoe: true },
                props: {
                  type: 'text'
                },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '审核',
                      content: '通过该商品审核？',
                      onOk: () => {
                        this.check(params.row.goodsId, 1)
                      }
                    })
                  }
                }
              }, '通过审核'),
              h('Button', {
                'class': { hide: params.row.state !== '待审核', buttonColoe: true },
                props: {
                  type: 'text'
                },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '审核',
                      onOk: () => {
                        this.check(params.row.goodsId, 2)
                      },
                      render: (h) => {
                        return h('Input', {
                          style: {
                            marginTop: '20px'
                          },
                          props: {
                            value: this.reason,
                            autofocus: true,
                            placeholder: '请输入不通过理由',
                          }
                        })
                      }
                    })
                  }
                }
              }, '审核不通过')
            ])
          }
        },
      ]
    }
  },
  methods: {
    // 选择商品状态
    selectState () {
      this.getData()
    },
    // 审核
    async check (id, state) {
      const data = {
        ids: id,
        state: state
      }
      if (state === 2) {
        data.refuseContents = this.reason
      }
      const res = await ApiUpdateGoodsState(data)
      if (res.errorCode > 0) {
        this.$Message.success(res.msg)
        this.getData()
      }
    },
    // 获取数据
    async getData () {
      const loading = this.$Message.loading({
        content: '加载中...',
        duration: 0
      })
      const data = {
        uid: JSON.parse(this.$cookies.get('userInfo')).id,
        state: this.state,
        page: this.page,
        num: this.num,
      }
      const res = await ApiGetAuditingList(data)
      setTimeout(loading, 500)
      if (res.errorCode > 0) {
        this.total = +res.msg
        if (res.data.length > 0) {
          for (var i = 0; i < res.data.length; i++) {
            const obj = {
              goodsId: res.data[i].goods.id,
              goodsName: res.data[i].goods.goodsName,
              price: res.data[i].goods.price,
              categoryName: res.data[i].category.categoryName,
              createTime: this.utils.timeFormat(res.data[i].goods.createTime),
              imgURL: res.data[i].goods.imgURL,
              contents: res.data[i].goods.contents,
              name: res.data[i].enterprise.name,
              state: res.data[i].goods.state === 0 ? '待审核' :
                    res.data[i].goods.state === 1 ? '已审核' :
                    res.data[i].goods.state === 2 ? '审核未通过' :
                    res.data[i].goods.state === 3 ? '上架' :
                    res.data[i].goods.state === 4 ? '下架' : ''
            }
            this.$set(this.listData, i, obj)
          }
        } else {
          this.listData = []
        }
      }
    }
  },
  mounted () {
    this.getData()
  },
  watch: {
    page () {
      this.getData()
    }
  }
}
</script>


