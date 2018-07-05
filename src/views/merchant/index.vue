<style lang="less">
  @import './index.less';
</style>

<template lang="html">
  <div class="merchant">
    <div class="merchant-operation">
      <Button type="primary" size="large" @click="handleAddMerchant">添加子公司/商户</Button>
    </div>
    <tabledata border 
    :columns="merchantColumns" 
    pagePosition="center" 
    :queryUrl="url"
    :queryData="data"
    :pageSize="num"
    :current="page"
    ref="merchantTable"></tabledata>
    <!-- 添加子商户弹框 -->
    <Modal
      title="添加子公司/商户"
      @on-cancel="handleAddMerchantCancel"
      @on-ok="submit"
      :loading="loading"
      v-model="modalVisibility">
      <div class="notice">温馨提示：邮箱和电话为登录账号</div>
      <Form ref="merchantForm" :label-width="100" :model="addMerchantForm" :rules="addMerchantRules">
        <FormItem prop="name" label="公司/商户名称">
          <Input v-model="addMerchantForm.name"></Input>
        </FormItem>
        <FormItem prop="creator" label="联系人姓名">
          <Input v-model="addMerchantForm.creator"></Input>
        </FormItem>
        <FormItem prop="account" label="邮箱">
          <Input v-model="addMerchantForm.account"></Input>
        </FormItem>
        <FormItem prop="phone" label="电话">
          <Input v-model="addMerchantForm.phone"></Input>
        </FormItem>
        <FormItem prop="address" label="地址">
          <Input v-model="addMerchantForm.address"></Input>
        </FormItem>
        <FormItem prop="password" label="密码">
          <Input v-model="addMerchantForm.password" type="password"></Input>
        </FormItem>
        <FormItem prop="passwd" label="确认密码">
          <Input v-model="addMerchantForm.passwd" type="password"></Input>
        </FormItem>
      </Form>
    </Modal>
    <!-- 修改子商户弹框 -->
    <Modal
      title="修改子公司/商户信息"
      @on-cancel="handleAddMerchantCancel"
      @on-ok="submitEdit"
      :loading="loading"
      v-model="modalEdit">
      <Form ref="editChildren" :label-width="100" :model="editMerchantForm" :rules="EditMerchantRules">
        <FormItem prop="name" label="公司/商户名称">
          <Input v-model="editMerchantForm.name"></Input>
        </FormItem>
        <FormItem prop="creator" label="联系人姓名">
          <Input v-model="editMerchantForm.creator"></Input>
        </FormItem>
        <FormItem prop="address" label="地址">
          <Input v-model="editMerchantForm.address"></Input>
        </FormItem>
        <FormItem label="修改密码">
          <i-switch v-model="isEditPsw" size="large">
            <span slot="open">On</span>
            <span slot="close">Off</span>
          </i-switch>
        </FormItem>
        <FormItem label="密码" v-show="isEditPsw">
          <Input v-model="editMerchantForm.password" type="password"></Input>
        </FormItem>
        <FormItem label="确认密码" v-show="isEditPsw">
          <Input v-model="editMerchantForm.passwd" type="password"></Input>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import { ApiGetAddChildren, ApiGetPhoneIsExist, ApiGetAccountIsExist, ApiGetDeleteChildren, ApiGetEditChildren } from '@/api'
import tabledata from '@/components/tabledata'

export default {
  components: {
    tabledata
  },
  data () {
    return {
      isEditPsw: false,
      loading: true,
      modalVisibility: false,
      modalEdit: false,
      url: '/getEnterpriseByParentId.json',
      page: 1,
      num: 16,
      data: {
        uid: JSON.parse(this.$cookies.get('userInfo')).id
      },
      addMerchantForm: {
        name: '',
        account: '',
        creator: '',
        phone: '',
        address: '',
        password: '',
        passwd: ''
      },
      editMerchantForm: {
        name: '',
        account: '',
        creator: '',
        phone: '',
        address: '',
        password: '',
        passwd: ''
      },
      EditMerchantRules: {
        name: [
          { required: true, message: '请输入商户名称', trigger: 'blur' }
        ],
        creator: [
          { required: true, message: '请输入联系人姓名', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入地址', trigger: 'blur' }
        ]
      },
      addMerchantRules: {
        name: [
          { required: true, message: '请输入商户名称', trigger: 'blur' }
        ],
        account: [
          {
            required: true,
            validator: async (rule, value, callback) => {
              const emailReg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/
              if (value === '') {
                callback(new Error('请输入账户'))
              } else if (!emailReg.test(value)) {
                callback(new Error('请输入正确的邮箱'))
              } else {
                const res = await ApiGetAccountIsExist(value)
                if (res.errorCode === 1) {
                  callback(new Error(res.msg))
                }
              }
            },
            trigger: 'blur'
          }
        ],
        creator: [
          { required: true, message: '请输入联系人姓名', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入地址', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        passwd: [
          { required: true,
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('请确认密码'))
              } else {
                if (value !== this.addMerchantForm.password) {
                  callback(new Error('两次密码不一致'))
                } else {
                  callback()
                }
              }
            },
            trigger: 'blur'
          }
        ],
        phone: [
          {
            required: true,
            validator: async (rule, value, callback) => {
              const phoneReg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
              if (value === '') {
                callback(new Error('请输入电话'))
              } else if (!phoneReg.test(value)) {
                callback(new Error('请输入正确的电话号码'))
              } else {
                const res = await ApiGetPhoneIsExist(value)
                if (res.errorCode === 1) {
                  callback(new Error(res.msg))
                }
              }
            },
            trigger: 'blur'
          }
        ]
      },
      merchantColumns: [
        {
          title: '编号',
          type: 'index',
          align: 'center',
          width: 80,
          key: 'id'
        },
        {
          title: '公司/商户名称',
          align: 'center',
          key: 'name'
        },
        {
          title: '邮箱',
          align: 'center',
          key: 'account'
        },
        {
          title: '联系人',
          align: 'center',
          key: 'creator'
        },
        {
          title: '联系电话',
          align: 'center',
          key: 'phone'
        },
        {
          title: '地址',
          align: 'center',
          key: 'address'
        },
        {
          title: '创建日期',
          align: 'center',
          render: (h, params) => {
            return h('span', this.utils.timeFormat(params.row.createTime))
          }
        },
        {
          title: '操作',
          align: 'center',
          render: (h, params) => {
            return h('p', [
              h('Button', {
                props: {
                  type: 'text'
                },
                on: {
                  click: () => {
                    this.editChildren(params.row)
                  }
                }
              }, '编辑'),
              h('Button', {
                props: {
                  type: 'text'
                },
                on: {
                  click: () => {
                    this.deleteChildren(params.row)
                  }
                }
              }, '删除')
            ])
          }
        }
      ]
    }
  },
  methods: {
    handleAddMerchant () {
      this.$refs.merchantForm.resetFields()
      this.modalVisibility = true
    },
    handleAddMerchantCancel () {
      this.$refs.merchantForm.resetFields()
    },
    // 修改子商户信息
    editChildren (row) {
      this.$refs.editChildren.resetFields()
      this.modalEdit = true
      this.isEditPsw = false
      for (var i in this.addMerchantForm) {
        this.editMerchantForm[i] = row[i] ? row[i] : ''
      }
    },
    // 删除子商户
    deleteChildren (row) {
      this.$Modal.confirm({
          content: '<p>确认删除吗？</p>',
          onOk: async () => {
            const res = await ApiGetDeleteChildren(row.id)
            if (res.errorCode > 0) {
              this.$Message.success(res.msg)
              this.$refs['merchantTable'].updateData()
            }
          }
      })
    },
    // 提交修改的子商户信息
    submitEdit () {
      if (this.editMerchantForm.password !== this.editMerchantForm.passwd) {
        this.$Message.warning('两次密码不一致，请重新输入')
        this.loading = false
        this.$nextTick(() => {
          this.loading = true
        })
        return
      }
      this.$refs.editChildren.validate(async (valid) => {
        if (valid) {
          const data = this.editMerchantForm
          delete data.passwd
          data.uid = this.data.uid
          const res = await ApiGetEditChildren(data)
          if (res.errorCode > 0) {
            this.$Message.success(res.msg)
            this.loading = false
            this.modalVisibility = false
            this.$refs['merchantTable'].updateData()
          } else {
            this.$Message.warning(res.msg)
            this.loading = false
            this.$nextTick(() => {
              this.loading = true
            })
          }
        } else {
          this.loading = false
          this.$nextTick(() => {
            this.loading = true
          })
        }
      })
    },
    // 提交子商户信息
    submit () {
      this.$refs.merchantForm.validate(async (valid) => {
        if (valid) {
          const data = this.addMerchantForm
          delete data.passwd
          data.uid = this.data.uid
          const res = await ApiGetAddChildren(data)
          if (res.errorCode > 0) {
            this.$Message.success(res.msg)
            this.loading = false
            this.modalVisibility = false
            this.$refs['merchantForm'].resetFields()
            this.$refs['merchantTable'].updateData()
          } else {
            this.$Message.warning(res.msg)
            this.loading = false
            this.$nextTick(() => {
              this.loading = true
            })
          }
        } else {
          this.loading = false
          this.$nextTick(() => {
            this.loading = true
          })
        }
      })
    }
  },
  watch: {
    isEditPsw () {
      if (this.isEditPsw === false) {
        this.editMerchantForm.password = ''
        this.editMerchantForm.passwd = ''
      }
    }
  }
}
</script>
