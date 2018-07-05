<template>
  <div class="order list">
    <div class="thead">
      <span v-for="(item, index) in columns" :key="index" :style="{ width: `${item.width}px` || 'auto' }">{{ item.title || '#' }}</span>
    </div>
    <div class="noData" v-if="data.length === 0">--- 暂无数据 ---</div>
    <div v-else v-for="(item, index) in data" :key="index">
      <div class="checkBox">
        <Checkbox v-if="distribution"  
                  v-model="checkList[index]">                  
                  <!-- :disabled="item.stateId !== 1" -->
        </Checkbox>
        <span v-text="item.createtime"></span>
        <span>订单号：{{distribution ? item.serialnumber : item.serialNumber}}</span>
        <span>
          <Button class="blue details" type="text" @click="giftGetDetail(item, index)" v-if="data.isGift">领取详情</Button>
          <Button class="blue details" type="text" @click="detail(item, index)" v-else>查看详情</Button>
          </span>
      <!-- <span v-text="item.enterpriseName"> -->
      <!-- </span><Button type="text" class="btnChat"><i></i>和我联系</Button> -->
      </div>
      <div class="info" v-for="(itemO, indexO) in item.orderInfoList" :key="indexO">
        <div class="imgBox">
          <img :src="itemO.goods && itemO.goods.imgURL ? 'http://' + itemO.goods.imgURL : noImg" alt="">
        </div>
        <div
          v-for="(itemD, indexD) in columns"
          :key="indexD"
          v-if="itemD.title === '操作'" 
          :style="{width: `${itemD.width}px` || 'auto'}">
          <Button class="blue" v-if="item.state === '支付成功待发货'" type="text" @click="toDistribution(item)">配送</Button>
          <!-- <Button class="blue" type="text" @click="detail(item)">查看详情</Button> -->
          <Button class="blue" v-if="itemO.logistics !== '无'" type="text" @click="logistics(itemO.logistics)">查看物流</Button>
          <Button class="blue" v-if="!distribution && itemO.logistics === '无'" type="text" @click="addLogistics(item.serialNumber)">{{item.state === "已发货" ? '修改' : '填写' }}配送信息</Button>
          <!-- <Button type="text">删除订单</Button> -->
        </div>
        <div
          v-else-if="itemD.title === '商品名称'" 
          :style="{width: (itemD.width - 150) + 'px' || 'auto'}">
          <p v-text="itemO.goods ? itemO.goods[itemD.key] : ''"></p>
        </div>
        <div
          v-else-if="itemD.title === '交易状态'" 
          :style="{width: `${itemD.width}px` || 'auto'}">
          <div v-text="item.state"></div>
        </div>
        <div
          v-else
          :key="indexD"
          :style="{width: `${itemD.width}px` || 'auto'}"
        ><div
        v-text="itemD.key === 'number' || itemD.key === 'logistics' ? itemO[itemD.key] : itemD.key === 'machinecode' ? item.machinecode : itemO.goods ? itemO.goods[itemD.key] : ''"
        ></div></div>
      </div>
    </div>    
    <div class="page" v-if="data.length > 0">        
      <Page :total="total"
            :current="current"
            :page-size="num"
            @on-change="changePage">
      </Page>
    </div>
    <Modal
      v-model="modal4"
      title="订单详情">
      <div>
        <div v-if="orderDetail.stateId > 4">订单状态： {{orderDetail.state}}</div>
        <Steps v-else :current="orderDetail.stateId">
            <Step :title="item.label" v-for="item in stepList" :key="item.value"></Step>
        </Steps>
        <div class="detailInfo">
          <div>订单号：{{distribution ? orderDetail.serialnumber : orderDetail.serialNumber}}</div>
            <p>购买商品：
              <span v-for="(itemt, indext) in orderDetail.orderInfoList" :key="indext">
                <span v-if="orderDetail.orderInfoList.length===1">{{itemt.goods.goodsName}}</span>
                <span v-else>{{itemt.goods.goodsName+'、' }}</span>
              </span>
            </p>
            <!-- <p>购买数量: {{commoditySum[detailsIndex]}}</p> -->
            <p>购买数量:　<span v-for="(itemt, indext) in orderDetail.orderInfoList" :key="indext">
                <span v-if="orderDetail.orderInfoList.length===1">{{itemt.goods.goodsName+'*'+itemt.number}}</span>
                <span v-else>{{itemt.goods.goodsName+'*'+itemt.number+'、'}}</span>
              </span> </p>
          <!-- <div>商品规格: {{orderDetail.attribute}}</div> -->
          <div>买家联系电话： {{orderDetail.userid}}</div>
          <div>收货地址： {{orderDetail.province + orderDetail.city + orderDetail.district + orderDetail.address}}</div>
          <div>支付金额: ￥{{priceSum[detailsIndex]}}</div>
        </div>
      </div>
    </Modal>
    <Modal
      width="60"
      v-model="modal5"
      title="领取详情">
      <div>
        <tabledata :queryUrl="queryUrlGift" 
        :queryData="queryDataGift" 
        ref="table"
        page-position="center" 
        border 
        :columns="tableColumnsGift"
        :type="typeGift"
        :current="pageGift"
        :pageSize="num"
        ></tabledata>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  ApiGetAlicloudapi,
  ApiAddDistributions,
  ApiQueryDistributions
} from "@/api";
import tabledata from '@/components/tabledata'
import { FINDGOODS } from '@/api'
export default {
  components: {
    tabledata
  },
  data() {
    return {
      stepList: [
        {
          value: 0,
          label: "待支付"
        },
        {
          value: 1,
          label: "待发货"
        },
        {
          value: 2,
          label: "处理中"
        },
        {
          value: 3,
          label: "已发货"
        },
        {
          value: 4,
          label: "已收货"
        }
      ],
      orderDetail: {},
      modal4: false,
      modal5: false,
      noImg: require("@/assets/noImg.png"),
      priceSum: [],
      commoditySum: [],
      detailsIndex: 0,
      queryUrlGift: FINDGOODS,
      typeGift: 'json',
      pageGift: 1,
      // num: 16,
      queryDataGift: {
        enterpriseId: JSON.parse(this.$cookies.get('userInfo')).id
      },
      tableColumnsGift: [
        {
          title: '领取人',
          type: 'index',
          align: 'center',
          width: 80,
          key: 'id'
        },
        {
          title: '联系电话',
          align: 'center',
          key: 'goodsName'
        },
        {
          title: '收货地址',
          align: 'center',
          key: 'goodsName'
        },
        {
          title: '订单状态',
          align: 'center',
          key: 'goodsName'
        },
        {
          title: '操作',
          align: 'center',
          render: (h, params) => {
            return 'caozuo'
          }
        }
      ]
    };
  },
  props: {
    columns: {
      type: Array,
      required: true
    },
    data: {
      type: Array,
      required: true
    },
    checkList: {
      type: Array
    },
    stateList: {
      type: Array,
      required: true
    },
    num: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    current: {
      type: Number,
      required: true
    },
    distribution: {
      type: Boolean,
      required: true
    }
  },
  watch: {
    data() {
      this.showDate();
    },
    checkList() {
      this.$parent.checkList = this.checkList;
    }
  },
  methods: {
    // 查看详情
    async detail(item, index) {
      this.modal4 = true;
      this.orderDetail = item;
      this.detailsIndex = index;
      this.priceSum = [];
      this.commoditySum = [];
      this.getPriceSum();
      this.getCommoditySum();
    },
    // 领取详情
    giftGetDetail (item, index) {
      this.modal5 = true
    },
    getPriceSum() {
      for (let i = 0; i < this.data.length; i++) {
        let sum = 0;
        for (let j = 0; j < this.data[i].orderInfoList.length; j++) {
          sum += this.data[i].orderInfoList[j].price*this.data[i].orderInfoList[j].number
        }
        this.priceSum.push(sum);
      }
    },
    getCommoditySum() {
      for (let i = 0; i < this.data.length; i++) {
        let sum = 0;
        for (let j = 0; j < this.data[i].orderInfoList.length; j++) {
          sum += this.data[i].orderInfoList[j].number
        }
        this.commoditySum.push(sum);
      }
    },
    // 填写配送信息
    addLogistics(serialNumber) {
      this.$parent.serialNumber = serialNumber;
      this.$parent.modal3 = true;
    },
    // 配送
    toDistribution(item) {
      this.$Modal.confirm({
        content: "确定加入配送单吗？",
        onOk: async () => {
          const loading = this.$Message.loading({
            content: "加载中...",
            duration: 0
          });
          const data = {
            enterprice: JSON.parse(this.$cookies.get("userInfo")).id,
            ids: item.id
          };
          const res = await ApiAddDistributions(data);
          this.$emit("on-freash");
          if (res.errorCode > 0) {
            setTimeout(loading, 500);
            this.$Modal.confirm({
              content: "该订单已加入配送单，是否去配送单管理填写配送信息？",
              onOk: () => {
                this.$router.push({ name: "dispatchingOrder" });
              }
            });
          } else {
            setTimeout(loading, 500);
            this.$Message.warning(res.msg);
          }
        }
      });
    },
    // 切换页码
    changePage(page) {
      this.current = this.$parent.page = page;
      this.utils.scrollTo(
        document.getElementsByClassName("main-content")[0],
        0
      );
    },
    showDate() {
      if (this.data) {
        for (var i = 0; i < this.data.length; i++) {
          if (!this.data[i].machinecode) {
            this.data[i].machinecode = "无";
          }
          for (let j = 0; j < this.stateList.length; j++) {
            if (this.data[i].state === this.stateList[j].value) {
              this.data[i].stateId = this.data[i].state;
              this.data[i].state = this.stateList[j].label;
            }
          }
          if (this.data[i].orderInfoList) {
            for (let k = 0; k < this.data[i].orderInfoList.length; k++) {
              if (!this.data[i].orderInfoList[k].logistics) {
                this.data[i].orderInfoList[k].logistics = "无";
              }
            }
          }
        }
      }
    },
    async logistics(item) {
      const loading = this.$Message.loading({
        content: "加载中...",
        duration: 0
      });
      const data = {
        number: item
      };
      const res = await ApiGetAlicloudapi(data);
      setTimeout(loading, 500);
      if (res.errorCode > 0) {
        this.$parent.modal2 = true;
        this.$parent.logisticsList = JSON.parse(res.data).result;
      } else {
        this.$Message.warning(res.msg);
      }
    }
  },
  mounted() {
    
  }
};
</script>

<style lang='less' scoped>
@import "./index.less";
</style>

