<template>
  <div class="shopOrder">
    <div class="btns">
      <Button style="float:right" type="primary" @click="modal=true">导入配送单</Button>
    </div>
    <div class="orderList">
      <Order :columns="orderColumns"
             :data="listData"
             :stateList="stateList"
             :total="total"
             :current="page"
             :num="num"
             :distribution="false"></Order>
    </div>
    <Modal
      v-model="modal"
      title="物流信息">
        <Upload
          type="drag"
          :action="importURL"
          name="file"
          :data="{enterpriceid: id}"
          :on-progress="handleUploading"
          :on-success="hanldeUploadSuccess"
          :on-error="handleUploadError"
          :on-format-error="handleFormatError">
          <div style="padding: 20px 0">
              <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
              <p>Click or drag files here to upload</p>
          </div>
      </Upload>
    </Modal>
    <Modal
      v-model="modal2"
      title="物流信息">
      <div v-if="logisticsList === ''">暂无物流信息</div>
      <div v-else>
        <Timeline>
          <TimelineItem v-for="(item, index) in logisticsList.list" :key="index">
            <p class="time" v-text="item.time"></p>
            <p class="content" v-text="item.status"></p>
          </TimelineItem>
        </Timeline>
      </div>
    </Modal>
    <Modal
      v-model="modal3"
      title="填写配送信息"
      :loading="loading"
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
        <FormItem prop="address" label="终端设备号">
          <Input v-model="formData.machineCode" style="width:200px"></Input>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import Order from '@/components/orderdata'
import { ApiGetDistributionByEid, ApiExport, API_GETCREATEDISTRIBUTION, ApiGetAlicloudType, ApiUpdateDistributions  } from '@/api'
export default{
  components: {
    Order
  },
  data () {
    return {
      serialNumber: '',
      loading: true,
      logisticsFirmList: [],
      formData: {
        logistics: null,
        logisticsFirm: null,
        weight: null,
        machineCode: null
      },
      formDataRules: {
        logistics: [{ required: true, message: '请输入物流单号', trigger: 'blur' }],
        logisticsFirm: [
          { required: true, message: '请选择物流公司', trigger: 'change' }
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
      },
      importURL: API_GETCREATEDISTRIBUTION,
      modal: false,
      id: JSON.parse(this.$cookies.get('userInfo')).id,
      state: -1,
      num: 5,
      page: 1,
      total: 0,
      modal2: false,
      modal3: false,
      listData: [],
      logisticsList: [],
      orderColumns: [
        {
          title: '商品名称',
          width: 300,
          key: 'goodsName'
        },
        {
          title: '单价',
          width: 120,
          key: 'price'
        },
        {
          title: '数量',
          width: 120,
          key: 'number'
        },
        {
          title: '交易状态',
          width: 140,
          key: 'state'
        },
        // {
        //   title: '是否需要终端机',
        //   width: 160,
        //   key: 'isNeedMachine'
        // },
        {
          title: '终端设备号',
          width: 150,
          key: 'machinecode'
        },
        {
          title: '物流单号',
          width: 150,
          key: 'logistics'
        },
        {
          title: '操作',
          width: 150
        }
      ],
      stateList: [
        {
          value: -1,
          label: '全部配送单'
        },
        {
          value: 0,
          label: '待支付'
        },
        {
          value: 1,
          label: '支付成功待发货'
        },
        {
          value: 2,
          label: '商家处理中'
        },
        {
          value: 3,
          label: '已发货'
        },
        {
          value: 4,
          label: '已收货'
        },
        {
          value: 5,
          label: '退货'
        },
        {
          value: 6,
          label: '取消配送单'
        }
      ]
    }
  },
  methods: {
    // 提交配送信息
    submit () {
      const para = {
        serialNumber: this.serialNumber,
        ...this.formData
      }
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          const loading = this.$Message.loading('提交中...')
          const para = {
            enterprice: this.id
          }
          const data = {
            serialNumber: this.serialNumber,
            ...this.formData
          }
          const res = await ApiUpdateDistributions(data, para)
          setTimeout(loading, 500)
          if (res.errorCode > 0) {
            this.loading = false
            this.modal3 = false
            this.$Message.success('配送信息已提交')
            this.getDispatchingOrder()
          }
        } else {
          this.loading = false
          this.$nextTick(() => {
            this.loading = true
          })
        }
      })
    },
    // 文件上传中
    handleUploading () {
      this.$Message.loading('上传中...')
    },
    // 文件上传成功
    hanldeUploadSuccess (res) {
      this.$Message.destroy()
      this.$Message.success('上传成功')
    },
    // 文件上传失败
    handleUploadError () {
      this.$Message.destroy()
      this.$Message.warning('上传失败')
    },
    // 文件格式不正确
    handleFormatError () {
      this.$Message.destroy()
      this.$Message.warning('文件格式不正确')
    },
    // 选择配送单状态
    selectState () {
      this.getDispatchingOrder()
    },
    // 获取配送单列表
    async getDispatchingOrder () {
      const loading = this.$Message.loading({
        content: '加载中...',
        duration: 0
      })
      const data = {
        enterpriceid: this.id,
        page: this.page,
        num: this.num
      }
      const res = await ApiGetDistributionByEid(data)
      setTimeout(loading, 500)
      if (res.errorCode > 0) {
        this.listData = res.data
        this.total = +res.msg
      }
      var number = 0
      for (var i of this.listData) {
        // this.checkList[number] = false
        number++
        i.createtime = this.utils.timeFormat(i.createtime)
        // this.listData[i].createtime = this.utils.timeFormat(this.listData[i].createtime)
        // console.log(this.listData[i].createtime)
      }
    },
    // 获取物流公司列表
    async getAlicloudType () {
      const res = await ApiGetAlicloudType()
      this.logisticsFirmList = res.data?JSON.parse(res.data).result:''
    }
  },
  watch: {
    page () {
      this.getDispatchingOrder()
    }
  },
  mounted () {
    this.getDispatchingOrder()
    this.getAlicloudType()
  }
}
</script>

<style lang="less" scoped>
@import '../shopOrder/index.less';
</style>

