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
  &-tip {
    width: 96%;
    margin: 0 auto;
    margin-bottom: 20px;
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
  margin-top: 10px;
}
</style>

<template>
  <div class="reward">
    <Card class="reward-front">
      <Button type="primary" @click="handleSetDefaultReward">设置默认奖励</Button>
      <Alert class="reward-alert">
        <p>- 默认奖励适用于未设置单品奖励设置的商品。</p>
      </Alert>
      <div class="reward-default">
        <p>当前默认奖励规则为：（DEMO）</p>
        <p>第1级奖励：<span class="color-red">￥4.00</span>，延期天数：即时到账；</p>
        <p>第2级奖励：<span class="color-red">￥4.00</span>，延期天数：即时到账；</p>
        <p>第3级奖励：<span class="color-red">￥4.00</span>，延期天数：即时到账；</p>
      </div>
    </Card>
    <Card class="reward-table">
      <p slot="title">单品奖励设置</p>
      <Button type="primary" @click="showRewardModal = true">新增单品奖励</Button>
      <Button type="primary" @click="showRuleModal = true">奖励规则列表</Button>
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
    <!-- 奖励规则 -->
    <Modal
      :mask-closable="false"
      title="奖励规则列表"
      width="90"
      v-model="showRuleModal">
      <Button type="primary" @click="editRule = false;showNewRuleModal = true">新增奖励规则</Button>
      <tabledata
        border
        ref="ruleList"
        :columns="ruleColumns"
        :queryUrl="UrlFindBounsRuleList"
        :queryData="DataFindBounsRuleList"
        :page-size="pageSize"
        page-position="right">
      </tabledata>
      <div slot="footer"></div>
    </Modal>
    <!-- 新增/修改规则 -->
    <Modal
      :mask-closable="false"
      width="80"
      :loading="newRuleLoading"
      :title="editRule ? '修改规则' : '新增规则'"
      @on-ok="handleAddNewRule"
      @on-cancel="handleResetForm"
      v-model="showNewRuleModal">
      <Form ref="ruleForm" :model="ruleForm" :rules="ruleFormRules" inline :label-width="80">
        <FormItem prop="ruleName" label="规则名称">
          <Input v-model="ruleForm.ruleName" class="item-width"></Input>
        </FormItem>
        <FormItem label="备注">
          <Input v-model="ruleForm.remark" class="item-width"></Input>
        </FormItem>
        <br />
        <div class="rule-detail">
          <p class="rule-detail-title">规则详情</p>
          <Alert class="rule-detail-tip">
            提示：
            <template slot="desc">
              <p> - 延期天数<span class="color-red">填0或不填</span>时表示即时到账；</p>
              <p> - 勾选获得奖励则表示该级人员可以获得奖励；</p>
              <p> - 勾选触发奖励则表示该级人员可以通过购买行为触发链条奖励；</p>
            </template>
          </Alert>
          <template v-for="(item, index) in ruleForm.ruleDetail">
            <FormItem :label="`第${index + 1}级：`" :prop="'ruleDetail.' + index + '.awardAmount'" :rules="ruleFormRules.awardAmount">
              <Input placeholder="不填则为0" v-model="item.awardAmount" class="item-width">
                <span slot="prepend">奖励金额</span>
                <span slot="append">元</span>
              </Input>
            </FormItem>
            <FormItem :prop="'ruleDetail.' + index + '.delayDay'" :rules="ruleFormRules.delayDay" :label-width="0.1">
              <Input v-model="item.delayDay" placeholder="即时到账" class="item-width">
                <span slot="prepend">延期天数</span>
                <span slot="append">天</span>
              </Input>
            </FormItem>
            <Checkbox v-model="item.couldWinBonus" class="line-32" label="couldWinBonus">获得奖励</Checkbox>
            <Checkbox v-model="item.couldTrigger" class="line-32" label="couldTrigger">触发奖励</Checkbox>
            <br />
          </template>
        </div>
      </Form>
    </Modal>
    <!-- 新增单品奖励 -->
    <Modal
      title="新增单品奖励"
      :loading="rewardLoading"
      @on-ok="handleAddGoodRule"
      @on-cancel="handleResetForm"
      v-model="showRewardModal">
      <Form ref="rewardForm" :model="rewardForm" :rules="rewardFormRules" class="reward-new-form" :label-width="80">
        <FormItem prop="selectGood" label="选择商品">
          <Select
            ref="goodSelect"
            v-model="rewardForm.selectGood"
            filterable
            remote
            :remote-method="handleSearchGoods"
            :loading="searchLoading">
            <Option v-for="good in selectGoodsList" :key="good.value" :label="good.label" :value="good.value"></Option>
          </Select>
        </FormItem>
        <FormItem prop="ruleId" label="选择规则">
          <Select
            v-model="rewardForm.ruleId"
            label-in-value
            @on-change="handleSelectRuleOnChange">
            <Option v-for="option in ruleSelectList" :key="option.id" :label="option.ruleName" :value="option.id"></Option>
          </Select>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import tabledata from '@/components/tabledata'
import {
  ApiFindGoods,
  ApiCreateBounsRule,
  ApiFindEBounsRule,
  ApiCreateBounsRuleRelation,
  ApiUpdateBounsRule,
  ApiFindRuleByGoodsId,
  ApiDeleteRule,
  ApiDeleteReward,
  FINDBOUNSRULELIST,
  FINDGOODSRULERELATIONLIST
} from '@/api'

export default {
  components: {
    tabledata
  },
  data () {
    return {
      userInfo: JSON.parse(this.$cookies.get('userInfo')),
      pageSize: 15,
      showRuleModal: false,
      showNewRuleModal: false,
      newRuleLoading: true,
      showRewardModal: false,
      rewardLoading: true,
      editRule: false,
      editRuleId: 0,
      selectGoodsList: [],
      searchLoading: false,
      rewardForm: {
        ruleId: '',
        selectRule: '',
        selectGood: ''
      },
      rewardFormRules: {
        ruleId: [
          { required: true, type: 'number', message: '请选择规则', trigger: 'change' }
        ],
        selectGood: [
          { required: true, type: 'number', message: '请选择商品', trigger: 'change' }
        ]
      },
      ruleSelectList: [],
      ruleForm: {
        ruleName: '',
        remark: '',
        ruleDetail: [
          {
            awardAmount: '',
            delayDay: '',
            couldWinBonus: false,
            couldTrigger: false
          },
          {
            awardAmount: '',
            delayDay: '',
            couldWinBonus: false,
            couldTrigger: false
          },
          {
            awardAmount: '',
            delayDay: '',
            couldWinBonus: false,
            couldTrigger: false
          }
        ]
      },
      ruleFormRules: {
        ruleName: [
          { required: true, message: '规则名称不能为空', trigger: 'blur' }
        ],
        awardAmount: [
          {
            required: false,
            validator: (rule, value, callback) => {
              if (value && value !== 0 && isNaN(value)) {
                callback(new Error('请输入数字'))
              } else if (value !== '' && value.toString().indexOf('.') > -1 && value.toString().split('.')[1].length > 2) {
                callback(new Error('金额只能到小数后两位'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        delayDay: [
          {
            required: false,
            validator: (rule, value, callback) => {
              if (value && value !== 0 && isNaN(value)) {
                callback(new Error('请输入数字'))
              } else if (value !== '' && value.toString().indexOf('.') > -1) {
                callback(new Error('请输入整数'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      },
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
                    this.handleShowDetail(params.row.goodsId)
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
                        const res = await ApiDeleteReward(params.row.id)
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
              }, '删除')
            ])
          }
        }
      ],
      ruleColumns: [
        {
          width: 100,
          title: '展开详情',
          align: 'center',
          type: 'expand',
          render: (h, params) => {
            return h('ruleDetail', {
              props: {
                detailList: params.row.ruleDetails
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
          key: 'remark'
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
                        this.editRuleId = params.row.id
                        this.fillRuleData(params.row)
                        this.editRule = true
                        this.showNewRuleModal = true
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
                        const res = await ApiDeleteRule(params.row.id)
                        if (res.errorCode > -1) {
                          this.$Message.success('删除成功')
                          this.$refs.ruleList.updateData()
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
    UrlFindBounsRuleList () {
      return FINDBOUNSRULELIST
    },
    DataFindBounsRuleList () {
      return {
        enterpriseId: this.userInfo.id
      }
    },
    UrlFindBounsRuleRelation () {
      return FINDGOODSRULERELATIONLIST
    },
    DataFindBounsRuleRelation () {
      return {
        enterpriseId: this.userInfo.id
      }
    }
  },
  methods: {
    /**
     * 设置默认奖励
     */
    handleSetDefaultReward () {
      this.$Message.info('暂未开放')
    },
    /**
     * 查询规则（无详情）
     * 新增单品奖励时选择规则用
     */
    async querySelectRuleList () {
      const res = await ApiFindEBounsRule(this.userInfo.id)
      if (res.errorCode > -1) {
        this.ruleSelectList = res.data
      } else {
        this.$Message.warning(res.msg)
      }
    },
    /**
     * 新增/修改规则提交
     */
    handleAddNewRule () {
      this.$refs.ruleForm.validate(async (boolean) => {
        if (boolean) {
          try {
            const data = {}
            data.ruleName = this.ruleForm.ruleName
            data.enterpriseId = this.userInfo.id
            data.winBonusLevel = 3
            data.creator = this.userInfo.name
            data.status = 1
            data.remark = this.ruleForm.remark
            data.ruleDetails = []
            for (let i in this.ruleForm.ruleDetail) {
              data.ruleDetails[i] = {
                enterpriseId: this.userInfo.id,
                levelId: +i + 1,
                couldWinBonus: this.ruleForm.ruleDetail[i].couldWinBonus ? 1 : 0,
                couldTrigger: this.ruleForm.ruleDetail[i].couldTrigger ? 1 : 0,
                awardAmount: this.ruleForm.ruleDetail[i].awardAmount ? +this.ruleForm.ruleDetail[i].awardAmount : 0,
                delayDay: this.ruleForm.ruleDetail[i].delayDay ? +this.ruleForm.ruleDetail[i].delayDay : 0
              }
              if (this.editRule) {
                data.ruleDetails[i].ruleId = this.editRuleId
              }
            }
            let res
            if (this.editRule) {
              data.id = this.editRuleId
              res = await ApiUpdateBounsRule(data)
            } else {
              res = await ApiCreateBounsRule(data)
            }
            if (res.errorCode > 0) {
              this.$Message.success(this.editRule ? '修改成功' : '新增成功')
              this.$refs.ruleList.updateData()
            } else {
              this.$Message.error(res.msg)
            }
            this.showNewRuleModal = false
          } catch (error) {
            throw new Error(error)
          } finally {
            this.handleResetForm()
            this.querySelectRuleList()
          }
        } else {
          this.newRuleLoading = false
          this.$nextTick(() => {
            this.newRuleLoading = true
          })
        }
      })
    },
    /**
     * 填充规则数据
     * @param {Any} item
     */
    fillRuleData (item) {
      this.$nextTick(() => {
        this.ruleForm = {
          ruleName: item.ruleName,
          remark: item.remark,
          ruleDetail: [
            {
              awardAmount: item.ruleDetails[0].awardAmount,
              delayDay: item.ruleDetails[0].delayDay,
              couldWinBonus: item.ruleDetails[0].couldWinBonus === 1 ? true : false,
              couldTrigger: item.ruleDetails[0].couldTrigger === 1 ? true : false
            },
            {
              awardAmount: item.ruleDetails[1].awardAmount,
              delayDay: item.ruleDetails[1].delayDay,
              couldWinBonus: item.ruleDetails[1].couldWinBonus === 1 ? true : false,
              couldTrigger: item.ruleDetails[1].couldTrigger === 1 ? true : false
            },
            {
              awardAmount: item.ruleDetails[2].awardAmount,
              delayDay: item.ruleDetails[2].delayDay,
              couldWinBonus: item.ruleDetails[2].couldWinBonus === 1 ? true : false,
              couldTrigger: item.ruleDetails[2].couldTrigger === 1 ? true : false
            }
          ]
        }
      })
    },
    /**
     * 重置表单
     */
    handleResetForm () {
      this.$refs.ruleForm
      ? this.$refs.ruleForm.resetFields()
      : null
      this.ruleForm = {
        ruleName: '',
        remark: '',
        ruleDetail: [
          {
            awardAmount: '',
            delayDay: '',
            couldWinBonus: false,
            couldTrigger: false
          },
          {
            awardAmount: '',
            delayDay: '',
            couldWinBonus: false,
            couldTrigger: false
          },
          {
            awardAmount: '',
            delayDay: '',
            couldWinBonus: false,
            couldTrigger: false
          }
        ]
      }
      if (this.$refs.rewardForm) {
        this.$refs.rewardForm.resetFields()
        this.$refs.goodSelect.setQuery()
      }
    },
    /**
     * 选择规则时
     */
    handleSelectRuleOnChange (item) {
      this.rewardForm.selectRule = item
    },
    /**
     * 远程搜索商品
     */
    async handleSearchGoods (query = '') {
      this.searchLoading = true
      const res = await ApiFindGoods({
        enterpriseId: this.userInfo.id,
        goodsName: query
      })
      const list = res.data.map(item => {
        return {
          value: item.id,
          label: item.goodsName
        }
      })
      this.selectGoodsList = list
      this.searchLoading = false
    },
    /**
     * 确认新增单品奖励
     */
    handleAddGoodRule () {
      this.$refs.rewardForm.validate(async (boolean) => {
        if (boolean) {
          const res = await ApiCreateBounsRuleRelation({
            ruleId: this.rewardForm.selectRule.value,
            ruleName: this.rewardForm.selectRule.label,
            enterpriseId: this.userInfo.id,
            goodsId: this.rewardForm.selectGood,
            status: 1
          })
          if (res.errorCode > 0) {
            this.$Message.success('新增单品奖励成功')
            this.handleResetForm()
            this.$refs.rewardList.updateData()
            this.showRewardModal = false
          } else {
            this.$Message.error(res.msg)
            this.rewardLoading = false
            this.$nextTick(() => {
              this.rewardLoading = true
            })
          }
        } else {
          this.rewardLoading = false
          this.$nextTick(() => {
            this.rewardLoading = true
          })
        }
      })
    },
    /**
     * 查看规则详情
     * @param {Number} id 商品Id
     */
    async handleShowDetail (id) {
      const res = await ApiFindRuleByGoodsId(this.userInfo.id, id)
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
              h('p', '备注：' + res.data.remark),
              h('hr'),
              h('p', '规则详情：'),
              h('ruleDetail', {
                props: {
                  detailList: res.data.ruleDetails
                }
              })
            ])
          }
        })
      }
    }
  },
  created () {
    this.querySelectRuleList()
    this.handleSearchGoods()
  }
}
</script>
