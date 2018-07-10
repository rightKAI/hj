<template>
  <div>
    <div class="action-bar">
      <i-input icon="search" placeholder="查询商品" @on-click='searchGift(searchVal,1,true)' style="width: 200px" v-model="searchVal" size="large"></i-input>
      <span style="float:right;">
        <Button size="large" type="primary" @click="showModal()">提交礼品</Button>
      </span>
    </div>
    <Modal
        v-model="modal"
        title="确认清单"
        @on-ok="asyncOK"
        :closable = "false"
        ok-text = "添加礼品卡"
        class-name= "giftBox"
        :loading="loading"
        :mask-closable= "false"
        @on-cancel = "cancelGift"
        >
        <div class="giftTitle">礼品卡</div>
        <ul class="giftForm">
          <li class="paper" v-for="(item,index) in giftRender" :key="index">
            <span>礼品名称：{{item.goodsName}}</span><span>礼品数量：{{item.count}}份</span>
          </li>
          <li style="display:flex;justify-content:flex-start;">
            <span style="margin-right:80px;width:90px;text-align:left">礼品卡名称：</span><Input style="width:200px;" v-model="giftName" placeholder="请输入礼品卡名称"></Input>
          </li>
          <li style="display:flex;justify-content:flex-start;">
            <span style="margin-right:80px;width:90px;text-align:left">礼品卡数量：</span>
            <Input style="width:200px;" v-model="giftNum" placeholder="请输入数量"></Input>
          </li>
          <li style="display:flex;justify-content:flex-start">
            <span  style="margin-right:80px;width:90px;text-align:left">礼品卡有效期：</span>
            <Col span="12">
              <DatePicker :options="options4" v-model="dateData" type="daterange" format="yyyy/MM/dd" @on-change="dateconso" placement="bottom-end" placeholder="请选择日期" style="width: 200px"></DatePicker>
            </Col>
          </li>
          <li style="display:flex;justify-content:space-between;height:45px;">
            <span class="mr">
              <Checkbox v-model="single" size="large">指定手机号码领取</Checkbox>
            </span>
            <transition name="fade">
              <span style="margin-right:26px">
                <Upload v-if="single" style="width:180px;" 
              :action="uploadPhoneNo"
              :format="['xlsx']"
              :on-format-error = "handleFormatError"
              :on-progress = "upLoading"
              :show-upload-list = "false"
              :on-error = "uploadError"
              :on-success="uploadSuccess">
                <Button type="ghost" icon="ios-cloud-upload-outline">上传号码(仅支持Excel格式)</Button>
              </Upload>
              <Spin size="large" fix v-if="uploadingShow"></Spin>
              <div v-if="file !== null">Upload file: {{ file.name }} <Button type="text" @click="upload" :loading="loadingStatus">{{ loadingStatus ? 'Uploading' : 'Click to upload' }}</Button></div>
              </span>
            </transition>
          </li>
        </ul>
      </Modal>
    <div class="content">
      <div class="head">
        <ul>
          <li style="padding-left:20px;"><Checkbox style="float:left" v-model="allC" @on-change="chooseAll(allC)"></Checkbox>商品名称</li>
          <li>商品主图</li>
          <li>商品价格</li>
          <li>商品库存</li>
          <li>数量</li>
        </ul>
      </div>
      <div class="data-list">
        <div class="noData" v-if="listData.length<=0" >---- 暂无数据 ----</div>
        <div v-else>
          <ul class="cli-list" v-for="(item,index) in listData" :key="index">
          <li style="padding-left:20px;"><Checkbox @on-change="isAllcheck()" v-model="checkAry[index+(page===0?page:page-1)*num]" style="float:left"></Checkbox>{{item.goodsName}}</li>
          <li><img v-if="item.imgURL" :src="'http://'+item.imgURL"   style="margin-top:10px;width:150px;height:82px;border-radius:5px;" alt=""></li>
          <li>{{item.price}}</li>
          <li>{{item.amount}}</li>
          <li><InputNumber v-model="amountAry[index+(page===0?page:page-1)*num]"  :min="0"></InputNumber></li>
        </ul>
        </div>
      </div>
    </div>
    <div class="page">
      <Page :style="{textAlign: 'center'}" :current="page === 0?page+1:page" :total='count' @on-change="pageChange" ></Page>
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
             <Page :style="{textAlign: 'center'}" :page-size="3"  :total='qrCount' @on-change="qrPageChange" ></Page>
      </div>
    </Modal>
  </div>
</template>
<script>
import { env, ApipushGiftCar, UPLOADPHONENO } from '@/api'
import Http from '@/api'
export default {
  data () {
    return {
      showAlert: false,
      allC: false,
      modal1: false,
      listData: [],
      qrPage: 0,
      qrCount: 0,
      uploadingShow: false,
      qrcodeList: [],
      qrLoading: false,
      qrCodeId: '',
      alertContent: '',
      searchVal: '',
      count: 0,
      checkAry: [],
      single: false,
      num: 10,
      giftNum: '',
      amountAry: [],
      page: 0,
      allList: [],
      modal: false,
      giftRender: [],
      idArr: [],
      giftName: '',
      dateData: '',
      excelData: null,
      loading: true,
      options4: {
        disabledDate (date) {
          return date && date.valueOf() < Date.now() - 86400000;
        }
      },
      file: null,
      loadingStatus: false
    }
  },
  created () {
    
  },
  computed: {
    uploadPhoneNo () {
      return (env === 'development' ? '/api' : '') + UPLOADPHONENO
    }
  },
  mounted () {
    this.getGiftList(1,this.num)
    this.getGiftList()
  },
  methods: {
    upLoading () {
      this.uploadingShow = true
    },
    // 二维码分页
    qrPageChange (page) {
      this.qrPage = page
      this.getCode(this.qrCodeId, page, 3,false,true)
    },
    //查看二维码
    async getCode (id,page,num,flag,pageFlag) {
      if (flag) {
        this.qrPage = 0
      }
      this.qrCodeId = id
      this.modal1 = true
      this.qrLoading = true      
      if (!pageFlag) {
        const ceratedRes = await Http.get('/createGiftCode.json', {params: {id}})
      }
      const res = await Http.get('/pageGiftCode.json', {params: {id,page,num}})
      this.qrCount = res.msg-0
      document.getElementById('qrcode0').innerHTML=''
      document.getElementById('qrcode1').innerHTML=''
      document.getElementById('qrcode2').innerHTML=''
      this.qrcodeList = res.data
      this.qrLoading = false
      for (let index in res.data) {
        this.utils.qrcode('qrcode'+index, res.data[index].securityCode, 120)
      }
    },
    cancelGift () {
      this.giftName = ''
      this.giftNum = ''
      this.single = false
      this.countList = []
      this.dateData = []
      this.priceAll = 0
      this.excelData = [] 
      this.idArr = []
    },
    uploadError () {
      this.uploadingShow = false
      this.$message.error('上传异常')
    },
    handleFormatError () {
      this.uploadingShow = false
      this.$Message.error('请上传excel表格')
    },
    // 上传表格成功
    uploadSuccess (response, file, fileList) {
      this.uploadingShow = false
      if (response.errorCode <= 0) {
        this.$Message.error({
          content: response.msg,
          duration: 5
        })
        return false
      } else {
        this.$Message.success(response.msg)
        this.excelData = response.data
      }
    },
    dateconso (val) {
      this.dateData = val
    },
    async getGiftList (page,num) {
      const data = {
        enterpriseId: JSON.parse(this.$cookies.get('userInfo')).id
      }
       const res = await Http.post('/findGoods.json', data, {params: {page,num}})
       if(!page && !num){
        this.allList = res.data
        return 
       }
       this.listData = res.data
       this.count = res.msg-0
       if(res.errorCode < 0){
         this.$Message.error(res.msg)
       }
    },
    async searchGift (val,page,flag) {
      this.$Loading.start();
      if(!val){
        this.checkAry = []
        this.amountAry = []
        this.getGiftList(1,this.num)
        this.getGiftList()
        this.$Loading.finish();
        return
      }
      if(flag){
        this.page = 1,
        this.allC = false
        this.amountAry = [],
        this.checkAry = []
      }
      const data = {
        goodsName: val || '',
        enterpriseId: JSON.parse(this.$cookies.get('userInfo')).id
      }
      const res = await Http.post('/findGoods.json', data, {params: {page, num: this.num}})
      this.listData = res.data
      this.$Loading.finish();
      this.count = res.msg-0
      const resAll = await Http.post('/findGoods.json', data, {params: {page:'', num: ''}})
      this.allList = resAll.data
      if (res.errorCode < 0) {
        this.$Message.error(res.msg)
      }
    },
    showModal () {
      if(this.ifnull()){
        this.modal = true
        this.giftRender = []
        for (let index in this.checkAry) {
          if(this.checkAry[index]){
            if(!this.amountAry[index]){
              this.amountAry[index] = 1
            }
            this.giftRender.push({goodsName:this.allList[index].goodsName,count:this.amountAry[index],price:this.amountAry[index]*this.allList[index].price})
            this.idArr.push(this.allList[index].id)
          }
        }
      } else {
        this.$Message.error('请先选择礼品')
      }
    },
    allStatus () {
      let pageNum = this.page === 1?0:(this.page-1)*10
      for (let i = pageNum; i<(pageNum+10>this.allList.length?this.allList.length:pageNum+10); i++) {
        if(!this.checkAry[i]){
          this.allC = false
          return false
        }
      }
      this.allC = true
      return true
    },
    isAllcheck () {
      let pageNum = this.page <= 1?0:(this.page-1)*10
      if (this.allList.length >= 1) {
        for (let i = pageNum; i<(pageNum+10>this.allList.length?this.allList.length:pageNum+10); i++) {
          if(!this.checkAry[i]){
            this.allC = false
            return false
          }
        }
      } else {
        return false
      }
      this.allC = true
    },
    pageChange (pageNum) {
      this.$Loading.start();
      this.page = pageNum
      if (this.searchVal) {
        this.searchGift(this.searchVal,pageNum,false)
        this.allStatus()
        this.$Loading.finish();
      } else {
        this.getGiftList(this.page,this.num)
        this.allStatus()
        this.$Loading.finish();
      }
    },
    ifnull () {
      for(let item of this.checkAry){
        if(item){
          return true
        }
      }
      return false
    },
    changeLoading () {
      this.loading = false;
      this.$nextTick(() => {
        this.loading = true;
      });
    },
    asyncOK () {
      if (!this.giftName ||　!this.giftNum || this.dateData.length<=0 ){
        this.$Message.error('请检查以上必填项是否填写,日期是否选择')
        return this.changeLoading()
      } else if(this.giftNum <= 0) {
        this.$Message.error('礼品卡数量不能为0')
        return this.changeLoading()
      }
      else {
        if (this.single) {
          if (!this.excelData) {
            this.$Message.error('请上传指定的手机号码文件')
            return this.changeLoading()
          }
          else if (this.excelData.length !== this.giftNum-0) {
            this.$Message.error('上传的号码个数请与礼品卡个数保持一致')
            return this.changeLoading()
          }
        }
      }
      let priceAll = 0
      let countList = []
      for(let index in this.giftRender){
        priceAll += this.giftRender[index].price
        countList.push(this.giftRender[index].count)
      }
      const data = {
        giftName: this.giftName,
        number: this.giftNum,
        isAppoint: this.single?1:0,
        startIndate: this.dateData[0],
        endIndate: this.dateData[1],
        price: priceAll,
        phone: this.excelData? this.excelData.toString() : '',
        goodsId: this.idArr.toString(),
        goodsPortion: countList.toString(),
        enterpriseId: JSON.parse(this.$cookies.get('userInfo')).id
      }
      ApipushGiftCar(data).then((res) => {
        this.giftName = ''
        this.giftNum = ''
        this.single = false
        this.countList = []
        this.dateData = []
        this.priceAll = 0
        this.excelData = [] 
        this.idArr = []
        if(res.errorCode !== 1) {
          this.$Message.error(res.msg)
          return this.changeLoading()
        } else {
          this.$Message.success(res.msg)
          this.changeLoading()
          this.modal = false;
          this.getCode(res.data,this.qrPage,3,true)
          this.modal1 = true
        }
      })
    },
    chooseAll (status) {
      if (status) {
        for( let i=0;i<10;i++){
          this.checkAry[i+(this.page === 0?this.page:this.page-1)*10] = true
        }
      } else {
        for( let i=0;i<10;i++){
          this.checkAry[i+(this.page === 0?this.page:this.page-1)*10] = false
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .fade-enter-active, .fade-leave-active {
  transition: opacity .5s
  }
  .fade-enter, .fade-leave-active {
  opacity: 0
  }
  .action-bar{
    width: 94%;
    margin: 20px auto;
  }
  .content{
    margin: 30px auto;
    width: 94%;
    border: 1px solid #ccc;
    overflow: hidden;
    color:#657180;
    .head{
      font-size: 14px;
      height: 50px;
      line-height: 50px;
      background-color: rgb(245, 247, 249);
    }
    ul>li{
      width: 20%;
      text-align: center;
      float: left;
    }
    .data-list{
      font-size: 14px;
      color: #657180;
      height: 50px;
      line-height: 50px;
      .cli-list{
        height: 100px;
        &:hover{
          background: #f2f2f2;
        }
        li{
          vertical-align: middle;
          line-height: 100px;
          height: 100px;
        }
      }
    }
  }
  .noData{
    font-size: 16px;
    text-align: center;
  }
   .giftTitle{
      display: block;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      line-height: 30px;
    }
  .giftForm{
    li{
      height: 40px;
      line-height: 40px;
      width: 80%;
      margin: 10px auto;
      .mr{
        margin-right: 10px;
      }
    }
    .paper{
      display: block;
      font-size: 14px;
      padding:0 50px;
      font-weight: bold;
      box-shadow: 0 3px 10px rgba(0,0,0,.156863), 0 3px 10px rgba(0,0,0,.227451);
      span:nth-child(2){
        float:right;
      }
    }
  }
  .footer {
  margin-top: 15px;
 }
  .arcode{
   min-width: 120px;
   height: 160px;
   margin: 10px auto;
   display: flex;
   justify-content: center;
   align-items: center;
   .arcode-cli{
     margin: 15px;
     p{
       text-align: center;
       line-height: 30px;
     }
   }
 }
</style>
<style>
.giftBox .ivu-modal-body{
    max-height:400px;
    overflow-y: scroll;
  }
</style>


