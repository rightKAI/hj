<style lang="less" scoped>
@import url('./index.less');
</style>

<template>
  <div>
    <div class="action-bar">
      <i-input icon="search" placeholder="查询礼品卡" @on-click='searchGift(searchVal,1)' style="width: 200px" v-model="searchVal" size="large"></i-input>
    </div>
    <div class="content">
      <div class="head">
        <ul>
          <li>礼品卡名称</li>
          <li>礼品卡内容</li>
          <li>礼品卡有效期</li>
          <li>已领取人数/总数</li>
          <li>操作</li>
        </ul>
      </div>
      <div class="data-list">
        <div class="noData" v-if="listData.length<=0" >---- 暂无数据 ----</div>
        <div v-else>
          <ul class="cli-list" v-for="(item,index) in listData" :key="index">
            <li>{{item.giftName}}</li>
            <li><Button type="text" @click="getGiftList(item.goodsName,item.goodsPortions)">查看礼品</Button></li>
            <li v-if="item.startIndate&&item.endIndate">{{item.startIndate}}至{{item.endIndate}}</li>
            <li v-else>无</li>
            <li>{{item.alreadyGift }} / {{item.giftSum}}</li>
            <li><Button type="text" @click="getCode(item.id,1,3,true)">查看二维码</Button><Button type="text" @click="getOpen(item.id,1,true)">领取详情</Button></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="page">
      <Page :style="{textAlign: 'center'}" :current="pageNum === 0?pageNum+1:pageNum" :total='count' @on-change="pageChange" ></Page>
    </div>
    <Modal
    v-model="modal1"
    title="扫码领取礼品卡"
    width="600px"
    >
      <div class="arcode">
        <div class="arcode-cli">
          <div id="qrcode0"></div>
          <p v-if="qrcodeList.length>=1">二维码<span>{{(qrPage===0?0:qrPage-1)*3+1}}</span></p>
        </div>
        <div class="arcode-cli" v-show="qrcodeList.length>=2">
          <div id="qrcode1"></div>
          <p v-if="qrcodeList.length>=2">二维码<span>{{(qrPage===0?0:qrPage-1)*3+2}}</span></p>
        </div>
        <div class="arcode-cli" v-show="qrcodeList.length>=3">
          <div id="qrcode2"></div>
          <p v-if="qrcodeList.length>=3">二维码<span>{{(qrPage===0?0:qrPage-1)*3+3}}</span></p>
        </div>
        <Spin size="large" fix v-if="qrLoading"></Spin>
      </div>
      <div slot="footer">
             <Page :style="{textAlign: 'center'}" :page-size="3" :current='pageCurrent' :total='qrCount' @on-change="qrPageChange" ></Page>
      </div>
    </Modal>
    <Modal
    v-model="modal2"
    title="领取详情"
    width="1000px"
    >
      <div>
        <Table :columns="getList" :data="getData"></Table>
      </div>
      <div class="footer">
        <Page :style="{textAlign: 'center'}" :page-size="5" :current="detailCurrent" :total='tableCount' @on-change="tablePageChange" ></Page>
      </div>
      <div slot="footer">
        <Button type="primary" size="large" @click="ok">确定</Button>
      </div>
    </Modal>
    <Modal
    v-model="modal3"
    title="礼品清单"
    width="400px"
    >
      <Table height="300" :columns="giftList" :data="giftData"></Table>
      <div slot="footer">
            <Button type="primary" size="large" @click="ok">确定</Button>
        </div>
    </Modal>
    <Modal
      v-model="modal4"
      title="填写配送信息"
      width="400px"
      :loading="loadings"
      @on-ok="submit">
      <Form ref="form" :label-width="100" :model="formData" :rules="formDataRules">
        <FormItem prop="logistics" label="物流单号">
          <Input v-model="formData.logistics" style="width:200px"></Input>
        </FormItem>
        <FormItem prop="logisticsFirm" label="物流公司">
          <Select v-model="formData.logisticsFirm" filterable style="width:200px" placeholder="请输入或选择物流公司">
              <Option v-for="(item, index) in logisticsFirmList" :value="item.name" :key="index">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="weight" label="重量">
          <Input style="width: 60px" v-model="formData.weight"></Input>
          <span style="margin-left:5px">kg</span>
        </FormItem>
        <FormItem  label="终端设备号">
          <Input v-model="formData.terminalNumber" style="width:200px"></Input>
        </FormItem>
      </Form>
    </Modal>
    <Modal
      v-model="modal5"
      title="物流信息"
      width="400px"
      >
      <div style="width:300px;margin:0 auto;">
        <div v-if="logisticsList === ''">暂无物流信息</div>
        <div v-else style="max-height:300px;overflow-y:scroll">
          <Timeline>
            <TimelineItem v-for="(item, index) in logisticsList" :key="index">
              <p  v-text="item.time"></p>
              <p  v-text="item.status"></p>
            </TimelineItem>
          </Timeline>
      </div>
      <Spin size="large" fix v-if="modal5Loading"></Spin>
      </div>
      <div slot="footer">
        <Button type="primary" size="large" @click="modal5 = !modal5">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import {ApiGetAlicloudType, ApiUpdateGiftLogistics, ApiGetAlicloudapi} from '@/api'
import Http from '@/api'
export default {
  data () {
    return {
      pageCurrent: 1,
      detailCurrent: 1,
      searchVal: '',
      modal5Loading:false,
      count: 0,
      qrPage: 0,
      qrCount: 0,
      loadings: true,
      logisticsList: [],
      logisticsFirmList: [],
      formData: {
        logistics: null,
        logisticsFirm: null,
        weight: null,
        terminalNumber: null
      },
      tableCount: 0,
      qrcodeLength: 0,
      qrLoading: false,
      qrCodeId: '',
      pageNum: 1,
      num:10,
      listData: [],
      // giftDetails: [],
      modal1: false,
      modal2: false,
      modal3: false,
      modal4: false,
      modal5: false,
      qrcodeGet: false,
      qrcodeList: [],
      tablePageNum: 5,
      tablePage: 1,
      isSearch: '',
      giftId: '',
      phone: '',
      securityCode: '',
      getList: [
        {
          title: '手机号码',
          key: 'phone',
          align: 'center'
        },
        {
          title: '是否领取',
          key: 'getStatus',
          align: 'center'
        },
        {
          title: '领取人',
          key: 'recipients',
          align: 'center'
        },
        {
          title: '地址',
          key: 'address',
          align: 'center'
        },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          render: (h, params) => {
            return h('div', [
                h('Button', {
                    props: {
                        type: 'primary',
                        size: 'default',
                        disabled:params.row.status === 0 ? true : false
                    },
                    style: {
                        marginRight: '5px'
                    },
                    on: {
                      click: () => {
                          // this.show()
                          this.securityCode = params.row.securityCode
                          this.phone = params.row.isAppoint ? params.row.phone : ''
                          if (params.row.status !== 0 && params.row.status !== 1) {
                            this.modal5 = true
                            this.modal5Loading = true
                            const data = {
                              number: params.row.logistics
                              // number: 1111111
                            }
                            ApiGetAlicloudapi(data).then( res => {
                              this.modal5Loading = false
                              if (res.errorCode > 0) {
                                this.$parent.modal2 = true
                                if (JSON.parse(res.data).status !== "0") {
                                  this.$Message.error(JSON.parse(res.data).msg)
                                  return this.closeModalFive()
                                }
                                this.$Message.success('查询成功')
                                this.logisticsList = JSON.parse(res.data).result.list
                              } else {
                                this.$Message.warning(res.msg);
                              }
                            })
                          } else {
                            this.modal4 = true
                          }
                      }
                    }
                },params.row.logisticsState)
              ]);
            }
          } 
      ],
      giftList: [
        {
          title: '礼品名字',
            key: 'giftName'
        },
        {
          title: '礼品数量',
          key: 'giftAmount'
        }
      ],
      getData: [],  
      giftData: [],
      formDataRules: {
        logistics: [{ required: true, message: '请输入物流单号', trigger: 'blur' }],
        logisticsFirm: [
          { required: true, message: '请选择物流公司', trigger: 'blur' }
        ],
        weight: [{
          required: true,
          validator: (rule, value, callback) => {
            if (value === '') {
              callback(new Error('请输入重量'))
            } else if (!/^-?\d*\.?\d*$/.test(value)){
              callback(new Error('请输入数字'))
            } else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
              callback(new Error('最多有两位小数点'))
            } else {
              callback();
            }
          },
          trigger: 'blur' 
        }]
      }
    }
  },
  mounted () {
    this.getCarList(this.pageNum,this.num)
    this.getAlicloudType()
  },
  methods: {
    closeModalFive () {
      this.modal5 =false
    },
    // 获取物流公司列表
    async getAlicloudType () {
      const res = await ApiGetAlicloudType()
      this.logisticsFirmList = res.data?JSON.parse(res.data).result:''
    },
    // 提交配送信息
    submit () {
      this.formData.weight -=0
      const data = {
        giftId: this.giftId,
        securityCode: this.securityCode,
        phone: this.phone,
        ...this.formData
      }
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          const loading = this.$Message.loading('提交中...')
          const data = {
            giftId: this.giftId,
            securityCode: this.securityCode,
            phone: this.phone,
            ...this.formData
          }
          const res = await ApiUpdateGiftLogistics(data)
          setTimeout(loading, 500)
          if (res.errorCode > 0) {
            this.loadings = false
            this.modal4 = false
            this.$Message.success('配送信息已提交')
            this.formData = {
              logistics: null,
              logisticsFirm: null,
              weight: null,
              terminalNumber: null
            }
            this.getOpen(this.giftId,1)
          }
        } else {
          this.loadings = false
          this.$nextTick(() => {
            this.loadings = true
          })
        }
      })
    },
    // 不让会话框自动关闭
    changeLoading () {
      this.loadings = false;
      this.$nextTick(() => {
        this.loadings = true;
      });
    },
    // 二维码分页
    qrPageChange (page) {
      this.qrPage = page
      this.pageCurrent = page
      this.getCode(this.qrCodeId, page, 3)
    },
    // 查看礼品
    getGiftList (goodsName,amount) {
      this.giftData = []
      let obj = {}
      for (let index in goodsName) {
            obj.giftName= goodsName[index],
            obj.giftAmount= amount[index]
            this.giftData.push(obj)
            obj = {}
      }
      this.modal3 = true
    },
    // 领取详情分页
    tablePageChange (page) {
      this.tablePage = page
      this.detailCurrent = page
      this.getOpen(this.giftId,page)
    },
    // 领取详情
    async getOpen (giftId,page,flag) {
      if (flag) {
        if (this.detailCurrent > 1) {
          this.detailCurrent = 1
        }
      }
      this.giftId = giftId
      this.modal2 = true
      const res = await Http.get('/findByGiftAdd.json', {params: {giftId, num:this.tablePageNum, page}})
      if (res.errorCode <= 0) {
        this.$Message.error(res.msg)
        return false
      }
      this.tableCount = res.msg-0
      this.getData = res.data
      for (let index in this.getData) {
        this.getData[index].address = this.getData[index].city+this.getData[index].district+this.getData[index].address == 0 ? '' : this.getData[index].address = this.getData[index].city+this.getData[index].district+this.getData[index].address
        this.getData[index].isAppoint = this.getData[index].phone ? true : false
        this.getData[index].phone = this.getData[index].phone ? this.getData[index].phone : this.getData[index].phoneNo
        // this.getData[index].getStatus = this.getData[index].status === 0 ? '未领取' : '已领取'
        switch (this.getData[index].status) {
          case 0 : 
            this.getData[index].getStatus = "未领取"
            break;
          case 1 :  
            this.getData[index].getStatus = "已领取(待发货)"
            break;
          case 2 :  
          this.getData[index].getStatus = "已发货"
            break;
          case 3 :  
          this.getData[index].getStatus = "已收货            "
          break;
        }
        this.getData[index].logisticsState === 0 ? '配送礼品' : '配送礼品'
        switch (this.getData[index].status) {
          case 0 : 
            this.getData[index].logisticsState = "配送礼品"
            break;
          case 1 :  
            this.getData[index].logisticsState = "配送礼品"
            break;
          case 2 :  
           this.getData[index].logisticsState = "查看物流"
            break;
          case 3 :  
           this.getData[index].logisticsState = "查看物流"
          break;
        }
      }
    },
    ok () {
      this.modal1 = false
      this.modal2 = false
      this.modal3 = false
    },
    // 页码改变
    pageChange (page) {
      this.pageNum = page
      this.$Loading.start()
      if (this.isSearch) {
        this.searchGift(this.isSearch, page)
      } else {
        this.getCarList(page, this.num)
      }
    },
    //查看二维码
    async getCode (id,page,num,flag) {
      if (flag) {
        this.qrPage = 0
        if (this.pageCurrent > 1) {
          this.pageCurrent = 1
        }
      }
      this.qrCodeId = id
      this.modal1 = true
      this.qrLoading = true      
      const res = await Http.get('/pageGiftCode.json', {params: {id,page,num}})
      this.qrCount = res.msg-0
      this.qrcodeLength = res.data.length
      document.getElementById('qrcode0').innerHTML=''
      document.getElementById('qrcode1').innerHTML=''
      document.getElementById('qrcode2').innerHTML=''
      this.qrcodeList = res.data
      this.qrLoading = false
      for (let index in res.data) {
        this.utils.qrcode('qrcode'+index, res.data[index].securityCode, 120)
      }
    },
    // 获取礼品卡数据
   async getCarList (page,num) {
      let data = {
        // num: this.num,
        // page: this.pageNum
      }
      const res = await Http.post('/findByGiftOrder.json', data, {params: {page,num}})
      this.count = res.msg-0
      this.listData = res.data
      this.$Loading.finish()
      // for (let index in this.listData) {
      //  let goodsNameList = this.listData[index].goodsName.split(',')
      //  let goodsPortion = this.listData[index].goodsPortion.split(',')
      //  let goodsObj = []
      //  for(let index2 in goodsNameList){
      //    if (goodsNameList[index2]) {
      //     goodsObj.push({
      //       goodsName: goodsNameList[index2],
      //       goodsPortion: goodsPortion[index2]
      //     })
      //    }
      //  }
      //  this.giftDetails.push(goodsObj)
      // }
      // console.log(this.giftDetails)
    },
    // 查询礼品卡
    async searchGift (searchVal, page) {
      this.isSearch = searchVal
      let giftName = {giftName: searchVal}
      const res = await Http.post('/findByGiftOrder.json', giftName, {params: {page, num:this.num}})
      this.count = res.msg-0
      this.listData = res.data
      this.$Loading.finish()
    }
  },
  watch : {
    modal4 () {
      if (this.modal4 === false) {
        this.formData =  {
          logistics: null,
          logisticsFirm: null,
          weight: null,
          terminalNumber: null
        }
      }
    }
  }
}
</script>


