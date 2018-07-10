<style lang="less" scoped>
@import './index.less';
.rule-detail {
  border: 1px solid rgb(194, 194, 194);
  border-radius: 4px;
  padding: 20px 0 10px;
  position: relative;
  &-title {
    position: absolute;
    top: -10px;
    left: 20px;
    background: #FFF;
    padding: 0 6px;
  }
  &-hint {
    width: 96%;
    margin: 0 auto;
    margin-bottom: 30px;
  }
  &-info {
    font-size: 14px;
  }
}
.item-width {
  width: 200px;
}
.reward-transfer {
  text-align: center;
}
.reward-new-form {
  margin-top: 30px;
}
</style>

<template>
  <div>
    <div class="reward">
      <Card class="reward-front">
        <Button v-if="isSet" type="primary" @click="pushNewRulesShow = true; getNew = true; newRuleTitle = '设置默认奖励规则'; memberRule.defaultRule = 1">设置默认奖励规则</Button>
        <Button v-if="!isSet" type="primary" @click="editDefaultRules">编辑默认奖励规则</Button>
        <Alert class="reward-alert">
          <p>- 默认奖励适用于未设置单品奖励设置的商品。</p>
        </Alert>
        <div v-if="!isSet" class="reward-default">
          <p>当前默认奖励规则为：({{defaultRule.ruleName}})</p>
          <Tabs value="defaultMember">
              <TabPane label="普通会员" name="defaultMember">
                <p v-for="(item, index) in defaultRule.memberRuleDetails" :key="index" >第{{index+1}}级奖励：<span class="color-red">{{defaultRule.rebateForm === 0? `${item.rebateValue}%`: `￥${item.rebateValue}`}}</span>，延期时数：{{item.delayDay === 0 ? '即时' : `${item.delayDay}时后`}}到账；<span style="color:red">{{ item.couldWinRebate === 1 ? '能够' : '不能' }}</span> 获得奖励</p>
              </TabPane>
              <TabPane label="VIP会员" name="vipMember">
                <p v-for="(item, index) in defaultRule.vipMemberRuleDetails" :key="index" >第{{index+1}}级奖励：<span class="color-red">{{defaultRule.rebateForm === 0? `${item.rebateValue}%`: `￥${item.rebateValue}`}}</span>，延期时数：{{item.delayDay === 0 ? '即时' : `${item.delayDay}时后`}}到账；<span style="color:red">{{ item.couldWinRebate === 1 ? '能够' : '不能' }}</span> 获得奖励</p>
              </TabPane>
          </Tabs>
        </div>
      </Card>
      <Card class="reward-table">
        <p slot="title">单品奖励设置</p>
        <Button type="primary" @click="shopBindleRulesShow = true">新增单品奖励</Button>
        <Button type="primary" @click="awardShow = true">奖励规则列表</Button>
        <tabledata
          ref="rewardList"
          :columns="columns"
          :page-size="pageSize"
          :queryUrl="UrlFindBounsRuleRelation"
          :queryData="DataFindBounsRuleRelation"
          border
          page-position="right">
        </tabledata>
      </Card>
    </div>
    <Modal
      v-model="awardShow"
      title="奖励规则列表"
      width="80"
    >
        <Button type="primary" @click="getNew = true; newRuleTitle='新增返利规则' ;pushNewRulesShow = true">新增返利规则</Button>
        <tabledata
          ref="awardList"
          :columns="awardColums"
          :page-size="pageSize"
          :queryUrl="UrlFindRulesList"
          :queryData="DataFindBounsRuleRelation"
          border
          page-position="right">
        </tabledata>
        <div slot="footer">
        </div>
    </Modal>
    <Modal
      v-model="pushNewRulesShow"
      :mask-closable="false"
      width="80"
      :loading="newRuleLoading"
      @on-ok="pushNewRules"
      @on-cancel="resetForm"
      :title="newRuleTitle"
      :styles="{top: '40px'}"
    >
      <Form ref="memberRule" :model="memberRule" :rules="memberRuleInline" :label-width="80" inline>
          <FormItem prop="ruleName" label="规则名称">
              <Input type="text" v-model.trim="memberRule.ruleName" placeholder="请输入规则名称"></Input>
          </FormItem>
          <FormItem prop="mark" label="备注">
              <Input type="text" v-model.trim="memberRule.remarks" placeholder="请输入备注"></Input>
          </FormItem>
          <br>
          <FormItem prop="rebateWay" label="返利类型">
              <Select v-model="memberRule.rebateWay" style="width:200px">
                  <Option v-for="item in rebateTypeList" :value="item.key" :key="item.key">{{ item.value }}</Option>
              </Select>
          </FormItem>
          <FormItem prop="rebateForm" label="返利形式">
              <Select @on-change="rebateFormChange" label-in-value	 v-model="memberRule.rebateForm" style="width:200px">
                  <Option v-for="item in rebateFormList" :value="item.key" :key="item.key">{{ item.value }}</Option>
              </Select>
          </FormItem>
      </Form>
      <div class="rule-detail">
          <p class="rule-detail-title">规则详情</p>
          <div class="rule-detail-hint">
            <Alert>
              提示：
              <template slot="desc">
                <p> - 延期时数<span class="color-red">填0或不填</span>时表示即时到账；</p>
                <p> - 勾选获得奖励则表示该级人员可以获得奖励；</p>
                <p> - 勾选触发奖励则表示该级人员可以通过购买行为触发链条奖励；</p>
                <p> - 一级指一级消费者或消费者本人 二级指替一级消费者邀请的消费者 三级即受二级邀请的消费者</p>
              </template>
            </Alert>
          </div>
          <div>
          <div style="padding:0 25px;">
            <Tabs v-model="tabShow">
              <TabPane label="普通会员" name="member">
                <div style="padding-left:20px;">
                  <Form ref="rulesSetter" inline v-for="(item,index) in memberRule.memberRuleDetails" :key="index">
                    <FormItem :label="`第${index+1}级：`" :label-width="80">
                      <Input  v-model="item.rebateValue" placeholder="不填时默认为0" class="item-width">
                          <span slot="prepend">返利值</span>
                          <span slot="append" >{{unit}}</span>
                      </Input>
                    </FormItem>
                    <FormItem :label-width="0.1">
                      <Input  v-model="item.delayDay" placeholder="不填或填0不延时" class="item-width" >
                          <span slot="prepend">延期时数</span>
                          <span slot="append">时</span>
                      </Input>
                    </FormItem>
                    <Checkbox class="line-32" v-model="item.couldWinRebateView" label="couldWinRebateView">能否获得奖励</Checkbox>
                  </Form>
                </div>
              </TabPane>
              <TabPane label="VIP会员" name="vipMmeber">
                <div style="padding-left:20px;">
                  <Form ref="rulesSetter" inline v-for="(item,index) in memberRule.vipMemberRuleDetails" :key="index">
                    <FormItem :label="`第${index+1}级：`" :label-width="80">
                      <Input  v-model="item.rebateValue" placeholder="不填时默认为0元" class="item-width">
                          <span slot="prepend">奖励金额</span>
                          <span slot="append" >{{unit}}</span>
                      </Input>
                    </FormItem>
                    <FormItem :label-width="0.1">
                      <Input  v-model="item.delayDay" placeholder="不填或填0不延时" class="item-width" >
                          <span slot="prepend">延期时数</span>
                          <span slot="append">时</span>
                      </Input>
                    </FormItem>
                    <Checkbox class="line-32" v-model="item.couldWinRebateView" label="couldWinRebateView">能否获得奖励</Checkbox>
                  </Form>
                </div>
              </TabPane>
            </Tabs>
          </div>
          </div>
      </div>
    </Modal>
    <Modal
    v-model="shopBindleRulesShow"
    :loading="bindleRulesLoding"
    @on-ok="shopBindRules"
    @on-cancel="clearBindRulesForm"
    >
    <Form ref="shopBindRule" :model="rewardForm"  class="reward-new-form"  :rules="rewardFormRules" :label-width="90" >
        <FormItem prop="selectGood" label="选择商品">
          <Select ref="goodSelect" v-model="rewardForm.selectGood">
              <Option v-for="item in selectGoodsList" :value="item.id" :key="item.id" :label="item.goodsName"></Option>
          </Select>
        </FormItem>
        <FormItem prop="ruleId" label="选择规则">
          <Select ref="ruleSelect" @on-change="setRuleName" label-in-value v-model="rewardForm.ruleId">
              <Option v-for="(item, index) in selectRulesList" :value="item.id" v-if="index !== 1" :key="item.id" :label="item.ruleName"></Option>
          </Select>
        </FormItem>
        <FormItem prop="validity" label="选择有效期">
          <DatePicker type="daterange" :clearable="false" v-model="rewardForm.validity" @on-change="validatyChange" split-panels placeholder="请选择规则有效期" style="width: 200px"></DatePicker>
        </FormItem>
        <FormItem prop="checkStatus" label="是否启用" >
          <Switch v-model="rewardForm.status"></Switch>
        </FormItem>
    </Form>
    </Modal>
    <Modal
    v-model="chooseDefaultShow"
    :loading="chooseDefaultLoding"
    @on-ok="chooseDefaultRule"
    :mask-closable="false"
    @on-cancel="clearDefaultRule"
    >
    <Form class="reward-new-form" ref="chooseDefault"  :rules="selectRuleJudge" :model="chooseDefaultObj" :label-width="80">
      <FormItem  prop="chooseDefault" label="返利规则">
        <Select v-model="chooseDefaultObj.chooseDefault">
            <Option v-for="item in selectRulesList" :value="+item.id" :key="item.id" :label="item.ruleName"></Option>
        </Select>
      </FormItem>
    </Form>
    </Modal>
  </div>
</template>

<script>
import {
  FINDGOODSRULERELATIONLIST,
  FINDREBATEDETAIL,
  ApiSetDefaultMemberRule,
  ApiPushNewRebateRules,
  ApiAmendNewRebateRules,
  ApiBlockUpShopRules,
  ApiDeleteShopRules,
  ApiDeleteNewRebateRules,
  ApiSearchDefaultRules,
  ApiFindRebateDetail,
  ApiSetShopRebateRules,
  ApiFindRuleByGoodsId,
  ApiGetShopRules,
  ApiFindGoods
} from '@/api'

import tabledata from '@/components/tabledata'

export default {
  components: {
    tabledata
  },
  data () {
    return {
      tabShow: 'member',
      isSet: true,
      newRuleTitle: '',
      chooseDefaultObj: {
        chooseDefault: ''
      },
      chooseDefaultShow: false,
      chooseDefaultLoding: true,
      defaultRule: {},
      defaultRuleData: {},
      bindleRulesLoding: true,
      rewardForm: {
        ruleId: '',
        selectRule: '',
        selectGood: '',
        validity: '',
        ruleName: '',
        status: true
      },
      shopBindleRulesShow: false,
      unit: '元',
      selectGoodsList: [],
      selectRulesList: [],
      memberTypeList: [
        {
          value: '普通会员',
          key: '0'
        },
        {
          value: 'VIP会员',
          key: '1'
        }
      ],
      rebateTypeList: [
        {
          value: '积分',
          key: '0'
        },
        {
          value: '余额',
          key: '3'
        }
      ],
      rebateFormList: [
        {
          value: '百分比',
          key: '0'
        },
        {
          value: '固定值',
          key: '1'
        }
      ],
      getNew: true,
      memberRule:{
        enterpriseId: JSON.parse(this.$cookies.get('userInfo')).id,
        ruleName: '',
        remarks: '',
        defaultRule: 0,
        rebateWay: '0',
        rebateForm: '1',
        memberRuleDetails: [
          {
            role: 0,
            couldWinRebateView: false,
            rebateValue: '', 
            delayDay: ''
          },
          {
            role: 1,
            couldWinRebateView: false,
            rebateValue: '', 
            delayDay: ''
          },
          {
            role: 2,
            couldWinRebateView: false,
            rebateValue: '', 
            delayDay: ''
          }
        ],
        vipMemberRuleDetails: [
          {
            role: 0,
            couldWinRebateView: false,
            rebateValue: '', 
            delayDay: ''
          },
          {
            role: 1,
            couldWinRebateView: false,
            rebateValue: '', 
            delayDay: ''
          },
          {
            role: 2,
            couldWinRebateView: false,
            rebateValue: '', 
            delayDay: ''
          }
        ]
      },
      memberRuleInline: {
        ruleName: [
          { required: true, message: '请输入规则名', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择会员类型', trigger: 'blur' }
        ],
        rebateWay: [
          { required: true, message: '请选择返利类型', trigger: 'blur' }
        ],
        rebateForm: [
          { required: true, message: '请选择会员类型', trigger: 'blur' }
        ]
      },// 表单验证
      rewardFormRules: {
        ruleId: [
          { required: true,  type: 'number', message: '请选择规则', trigger: 'change' }
        ],
        selectGood: [
          { required: true, type: 'number',  message: '请选择商品', trigger: 'change' }
        ],
        validity: [
          { required: true, validator: (rule, value, callback) => {
            if (this.rewardForm.validity) {
              callback()
            } else {
              callback(new Error('请选择有效期'))
            }
          }, message: '请选择有效期', trigger: 'change' }
        ]
      },// 选择
      selectRuleJudge: {
        chooseDefault: [
          { required: true, type: 'number', message: '请选择规则', trigger: 'change' }
        ],
      },
      pushNewRulesShow: false,
      newRuleLoading: true,
      awardShow: false, // 奖励规则弹窗
      columns: [
        {
          type: 'index',
          title: '编号',
          align: 'center',
          width: 80
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
                imgURLStr: params.row.imgUrl
              }
            })
          }
        },
        {
          title: '适用规则',
          align: 'center',
          key: 'ruleName'
        },
        {
          title: '状态',
          align: 'center',
          render: (h, params) => {
            let statusStr = ''
            let statusColor = ''
            if (params.row.status === 1) {
              statusStr = '正常'
              statusColor = '#19be6b'
            } else {
              statusStr = '规则已被删除'
              statusColor = '#ed3f14'
            }
            return (
              <span style={`color: ${statusColor}`}>{ statusStr }</span>
            )
          }
        },
        {
          title: '创建日期',
          align: 'center',
          render: (h, params) => {
            return h('span', this.utils.timeFormat(params.row.createTime, 'yyyy-MM-dd HH:mm:ss'))
          }
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
                    this.handleShowDetail(params.row.ruleId)
                  }
                }
              }, '查看详情'),
              h('Button', {
                props: {
                  type: 'text'
                },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '删除确认',
                      content: '确认删除该单品奖励吗？删除后此商品将不会触发分红或使用默认规则分红',
                      onOk: async () => {
                        const res = await ApiDeleteShopRules({
                          id:params.row.id
                        })
                        if (res.errorCode > -1) {
                          this.$Message.success('删除成功')
                          this.$refs.rewardList.updateData()
                        } else {
                          this.$Message.error(res.msg)
                        }
                      }
                    })
                  }
                }
              }, '删除'),
              h('Button', {
                props: {
                  type: 'text'
                },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: params.row.status === 1 ?  '停用确认' : '启用确认',
                      content: params.row.status === 1 ? '确认停用该单品奖励吗？停用后此商品将不会触发分红或使用默认规则分红' : '确认启用该单品奖励吗？启用后此商品将会触发分红或使用默认规则分红',
                      onOk: async () => {
                        const res = await ApiBlockUpShopRules({
                          id:params.row.id,
                          status: params.row.status ? 0 : 1
                        })
                        if (res.errorCode > -1) {
                          this.$Message.success('已停用')
                          this.$refs.rewardList.updateData()
                        } else {
                          this.$Message.error(res.msg)
                        }
                      }
                    })
                  }
                }
              }, params.row.status === 1? '停用' : '启用' )
            ])
          }
        }
      ],// 商品列表
      pageSize: 6, // 表格条数
      enterpriseId: JSON.parse(this.$cookies.get('userInfo')).id,
      DataFindBounsRuleRelation: {
        enterpriseId: JSON.parse(this.$cookies.get('userInfo')).id,
      },
      awardColums: [
        {
          width: 100,
          title: '展开详情',
          align: 'center',
          type: 'expand',
          render: (h, params) => {
            return h('ruleDetail', {
              props: {
                detailList: params.row.memberRuleDetails,
                rebateForm: params.row.rebateForm,
                vipMemberRuleDetails: params.row.vipMemberRuleDetails
              }
            })
          }
        },
        {
          title: '规则ID',
          align: 'center',
          width: 100,
          key: 'id'
        },
        {
          title: '规则名称',
          align: 'center',
          key: 'ruleName'
        },
        {
          title: '备注信息',
          align: 'center',
          key: 'remarks'
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
                    this.$Modal.confirm({
                      title: '编辑确认',
                      content: '编辑奖励规则会影响到已经在使用该规则的产品，确定要编辑吗？',
                      onOk: () =>{
                        this.newRuleTitle = '编辑奖励股则'
                        // this.editRuleId = params.row.id
                        // this.fillRuleData(params.row)
                        // this.editRule = true
                        // this.showNewRuleModal = true
                        for (let index in params.row.memberRuleDetails) {
                          params.row.memberRuleDetails[index].couldWinRebateView = params.row.memberRuleDetails[index].couldWinRebate === 0? false : true
                          params.row.vipMemberRuleDetails[index].couldWinRebateView = params.row.vipMemberRuleDetails[index].couldWinRebate === 0? false : true
                        }
                        let memberRule = {...params.row}
                        for (let index in memberRule.memberRuleDetails) {
                          memberRule.memberRuleDetails[index].rebateValue = memberRule.memberRuleDetails[index].rebateValue? memberRule.memberRuleDetails[index].rebateValue : 0
                        }
                        memberRule.rebateWay += ''
                        memberRule.rebateForm += ''
                        delete memberRule.createTime
                        delete memberRule.status
                        delete memberRule._index
                        delete memberRule._rowKey
                        console.log(memberRule)
                        this.memberRule = memberRule
                        this.$nextTick(() => {
                          this.pushNewRulesShow = true
                          this.getNew = false
                        })
                      }
                    })
                  }
                }
              }, '编辑'),
              h('Button', {
                props: {
                  type: 'text'
                },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '删除确认',
                      content: '确认删除该规则吗？这会导致在使用该规则的商品奖励异常',
                      onOk: async () => {
                        let data = {
                          enterpriseId: this.enterpriseId,
                          ruleId: params.row.id
                        }
                        const res = await ApiDeleteNewRebateRules(data)
                        if (res.errorCode > -1) {
                          this.$Message.success('删除成功')
                          this.$refs.awardList.updateData()
                          this.querySelectRuleList()
                        } else {
                          this.$Message.error(res.msg)
                        }
                      }
                    })
                  }
                }
              }, '删除')
            ])
          }
        }
      ]
    }
  },
  computed: {
    UrlFindBounsRuleRelation: () => '/findMemberGoodsRuleList.json',
    UrlFindRulesList: () => FINDREBATEDETAIL
  },
  mounted () {
    this.handleSearchGoods()
    this.handleBindRules()
    this.searchDefaultRules()
  },
  methods: {
    // defaultRuleChange (id) {
    //   this.chooseDefault = id
    // },
    editDefaultRules () {
      this.setDefaultRuleData()
      this.pushNewRulesShow = true
      this.getNew = false
      this.newRuleTitle = '编辑默认奖励规则'
    },
    clone (obj) {
      var result = {}
      for (let key in obj) {
          result[key] = obj[key]
      }
      return result
    },
    setDefaultRuleData () {
      let memberRule = this.clone(this.defaultRule)
      for (let index in memberRule.memberRuleDetails) {
        memberRule.memberRuleDetails[index].couldWinRebateView = memberRule.memberRuleDetails[index].couldWinRebate === 0? false : true
        memberRule.vipMemberRuleDetails[index].couldWinRebateView = memberRule.vipMemberRuleDetails[index].couldWinRebate === 0? false : true
      }
      memberRule.rebateWay += ''
      memberRule.rebateForm += ''
      delete memberRule.createTime
      delete memberRule.status
      delete memberRule._index
      delete memberRule._rowKey
      this.memberRule = memberRule
    },
    clearBindRulesForm () {
      this.rewardForm = {
        ruleId: [],
        selectRule: '',
        selectGood: '',
        validity: [],
        ruleName: '',
        status: true
      }
    },
    setRuleName (item) {
      this.rewardForm.ruleName  = item.label
    },
    validatyChange (item) {
      this.rewardForm.validity = item
    },
    shopBindRules () {
      this.$refs.shopBindRule.validate(async (boolean) => {
        if (boolean) {
          let data = {
            enterpriseId: this.enterpriseId,
            goodsId: this.rewardForm.selectGood,
            ruleId: this.rewardForm.ruleId,
            ruleName: this.rewardForm.ruleName,
            startTime: this.rewardForm.validity[0],
            endTime: this.rewardForm.validity[1],
            status: this.rewardForm.status? 1 : 0
          }
          try {
            let res = await ApiSetShopRebateRules(data)
            if (res.errorCode === 1) {
              this.$Message.success(res.msg)
              this.shopBindleRulesShow = false
              this.$refs.rewardList.updateData()
              this.clearBindRulesForm()
            } else {
              this.$Message.error(res.msg)
              this.bindleRulesLoding = false
              this.$nextTick(() => {
                this.bindleRulesLoding = true
              })
            }
          } catch (error) {
            this.$Message.error('新增失败请重试')
            this.bindleRulesLoding = false
            this.$nextTick(() => {
              this.bindleRulesLoding = true
            })
          }
        } else {
          this.bindleRulesLoding = false
          this.$nextTick(() => {
            this.bindleRulesLoding = true
          })
        }
      })
    },
    async handleBindRules () {
      let data = {
        enterpriseId: this.enterpriseId,
        page: 0,
        num: 0
      }
      let res = await ApiFindRebateDetail(data)
      this.selectRulesList = res.data
    },
    // 查询商家设置的默认规则
    async searchDefaultRules () {
      let data = {
        enterpriseId: this.enterpriseId
      }
      let res = await ApiSearchDefaultRules(data)
      if (res.errorCode === 0) {
        this.isSet = true
      } else {
        this.isSet = false
      }
      this.defaultRule = res.data
      this.defaultRuleData = res
    },
    /**
     * 远程搜索商品
     */
    async handleSearchGoods (query = '') {
      const res = await ApiFindGoods({
        enterpriseId: this.enterpriseId,
        goodsName: query
      })
      this.selectGoodsList = res.data
    },
    rebateFormChange (item) {
      if (item.value === '0') {
        this.unit = '%'
      } else {
        this.unit = '元'
      }
    },
    async pushNewRules () {
      this.$refs.memberRule.validate(async (boolean) => {
        if (boolean) {
          let data = {...this.memberRule}
          for (let index in data.memberRuleDetails) {
            data.memberRuleDetails[index].couldWinRebate = data.memberRuleDetails[index].couldWinRebateView? 1 : 0
            data.vipMemberRuleDetails[index].couldWinRebate = data.vipMemberRuleDetails[index].couldWinRebateView? 1 : 0
            data.vipMemberRuleDetails[index].rebateValue = data.vipMemberRuleDetails[index].rebateValue ? data.vipMemberRuleDetails[index].rebateValue : 0
            data.memberRuleDetails[index].rebateValue = data.memberRuleDetails[index].rebateValue ? data.memberRuleDetails[index].rebateValue : 0
            data.vipMemberRuleDetails[index].delayDay = data.vipMemberRuleDetails[index].delayDay ? data.vipMemberRuleDetails[index].delayDay : 0
            data.memberRuleDetails[index].delayDay = data.memberRuleDetails[index].delayDay ? data.memberRuleDetails[index].delayDay : 0
            delete data.memberRuleDetails[index].couldWinRebateView
            delete data.vipMemberRuleDetails[index].couldWinRebateView
          }
          let res
          if (this.getNew) {
            res = await ApiPushNewRebateRules(data)
          } else {
            res = await ApiAmendNewRebateRules(data)
          }
          if (res.errorCode === 1) {
            this.$Message.success(res.msg)
            this.resetForm()
            this.$refs.awardList.updateData()
            this.pushNewRulesShow = false
            this.handleBindRules()
            this.searchDefaultRules()
          } else {
            this.$Message.error(res.msg)
          }
        } else {
          this.newRuleLoading = false
          this.$nextTick(() => {
          this.newRuleLoading = true
          })
        }
      })
    }, // 新增返利规则
    resetForm () {
      this.memberRule = {
        enterpriseId: JSON.parse(this.$cookies.get('userInfo')).id,
        ruleName: '',
        remarks: '',
        rebateWay: '0',
        rebateForm: '1',
        memberRuleDetails: [
          {
            role: 0,
            couldWinRebateView: false,
            rebateValue: '', 
            delayDay: ''
          },
          {
            role: 1,
            couldWinRebateView: false,
            rebateValue: '', 
            delayDay: ''
          },
          {
            role: 2,
            couldWinRebateView: false,
            rebateValue: '', 
            delayDay: ''
          }
        ],
        vipMemberRuleDetails: [
          {
            role: 0,
            couldWinRebateView: false,
            rebateValue: '', 
            delayDay: ''
          },
          {
            role: 1,
            couldWinRebateView: false,
            rebateValue: '', 
            delayDay: ''
          },
          {
            role: 2,
            couldWinRebateView: false,
            rebateValue: '', 
            delayDay: ''
          }
        ]
      }
      this.tabShow = 'member'
    },
    /**
     * 查看规则详情
     * @param {Number} id 商品Id
     */
    async handleShowDetail (id) {
      const res = await ApiGetShopRules({
        enterpriseId: this.enterpriseId,
        ruleId: id
      })
      if (res.errorCode > -1) {
        this.$Modal.info({
          title: '规则详情',
          width: 50,
          okText: '关闭',
          render: (h) => {
            return h('div', {
              style: {
                fontSize: '14px',
                lineHeight: '32px'
              }
            }, [
              h('p', '规则名称：' +  res.data.ruleName),
              h('p', '备注：' + (res.data.remark ? 'res.data.remark' : '无')),
              h('hr'),
              h('p', '规则详情：'),
              h('ruleDetail', {
                props: {
                  detailList: res.data.memberRuleDetails,
                  rebateForm: res.data.rebateForm,
                  vipMemberRuleDetails: res.data.vipMemberRuleDetails
                }
              })
            ])
          }
        })
      } else {
        this.$Message.error(res.msg)
      }
    },
    clearDefaultRule () {
      this.chooseDefaultObj.chooseDefault = ''
    },
    chooseDefaultRule () {
      this.$refs.chooseDefault.validate((boolean) => {
        if (boolean) {
          let data = {
            enterpriseId: this.enterpriseId,
            ruleId: this.chooseDefaultObj.chooseDefault
          }
          ApiSetDefaultMemberRule(data)
          .then(res => {
            if (res.errorCode === 1) {
              this.$Message.success(res.msg)
              this.chooseDefaultShow = false
              this.clearDefaultRule()
            } else {
              this.$Message.error(res.msg)
            }
          })
        } else {
          this.chooseDefaultLoding = false
          this.$nextTick(() => {
            this.chooseDefaultLoding =true
          })
        }
      })
    }
  }
}
</script>
