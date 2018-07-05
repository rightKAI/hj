<style lang="less" scoped>
@import './index.less';
</style>

<template>
  <Row class="wxmenu">
    <Col span="12">
      <div class="wxmenu-bg">
        <img draggable="false" :src="require('@/assets/wxmenu-bg.jpg')">
        <div class="wxmenu-btns-bg">
          <div
            class="wxmenu-btns"
            v-for="(btn, index) in menuBtns"
            :key="index"
            :style="{ borderRight: index < 2 ? '1px solid #ddd' : '' }"
            @click="handleEditMenu(index)">
            <span>{{ menuWordLimit(btn.menuName, 4) }}</span>
            <div v-show="editMenuIndex === index" class="wxmenu-btns-select">
              <Icon
                class="wxmenu-btns-select-del"
                size="16"
                type="close-circled"
                color="#ed3f14"
                @click.native.stop="handleDeleteMenu(index)"></Icon>
            </div>
            <transition name="scale">
              <div v-show="editMenuIndex === index" class="wxmenu-btns-child">
                <div
                  v-for="(chlidBtn, index2) in btn.list"
                  :key="index2"
                  class="wxmenu-btns-child-content"
                  :style="{ borderBottom: index2 < 4 ? '1px solid #dedede' : '' }"
                  @click.stop="handleEditChildMenu(index2)">
                  <span>{{ menuWordLimit(chlidBtn.menuName, 7) }}</span>
                  <div v-show="editMenuIndex === index && editChildMenuIndex === index2" class="wxmenu-btns-select">
                    <Icon
                      class="wxmenu-btns-select-del"
                      size="16"
                      type="close-circled"
                      color="#ed3f14"
                      @click.native.stop="handleDeleteChildMenu(index, index2)"></Icon>
                  </div>
                </div>
                <div
                  v-show="!btn.list || btn.list.length < 5"
                  class="wxmenu-btns-child-content"
                  @click.stop="handleAddChildMenu(index)">
                  <Icon type="plus-round" size="20"></Icon>
                </div>
              </div>
            </transition>
          </div>
          <div class="wxmenu-btns" v-show="menuBtns.length < 3" @click="handleAddMenu">
            <Icon type="plus-round" size="20"></Icon>
          </div>
        </div>
      </div>
    </Col>
    <Col span="12">
      <Alert v-if="showAlert" show-icon style="width: 80%; margin: 20px auto 0;" type="warning">您尚未设置公众号，无法进行菜单设置</Alert>
      <Card class="wxmenu-edit-card">
        <p slot="title">{{ editMenuIndex !== '' ? `自定义菜单${editMenuIndex + 1}` : '请点击需编辑菜单'}}</p>
        <Alert>
          <p>1、自定义菜单最多包括3个一级菜单，每个一级菜单最多包含5个二级菜单。</p>
          <p>2、一级菜单最多4个汉字，二级菜单最多7个汉字，多出来的部分将会以“...”代替。</p>
        </Alert>
        <Form v-show="showEditCard" :label-width="100">
          <FormItem label="菜单名称">
            <Input v-model.trim="editBtnName" placeholder="请输入菜单的名称"/>
          </FormItem>
          <FormItem v-if="(editMenuIndex !== '' && editChildMenuIndex === '' && !menuBtns[editMenuIndex].list) || (editMenuIndex !== '' && editChildMenuIndex !== '')" label="链接地址">
            <Select v-model.trim="editBtnUrl">
              <Option v-for="item in staticMenu" :key="item.value" :label="item.label" :value="item.value"></Option>
              <Option label="自定义链接" value="customLinks"></Option>
            </Select>
          </FormItem>
          <FormItem v-if="((editMenuIndex !== '' && editChildMenuIndex === '' && !menuBtns[editMenuIndex].list) || (editMenuIndex !== '' && editChildMenuIndex !== '')) && editBtnUrl === 'customLinks'" label="自定义链接地址">
            <Input v-model.trim="editCustomLink" placeholder="请输入链接地址,http或https开头" />
          </FormItem>
        </Form>
      </Card>
      <div>
        <Button type="primary" long class="wxmenu-save-btn" @click="handleSaveMenu">保存</Button>
      </div>
    </Col>
  </Row>
</template>

<script>
import { ApiFindWechatMenu, ApiCreateWxMenu, ApiGetWxConfig } from '@/api'

export default {
  data () {
    return {
      userInfo: JSON.parse(this.$cookies.get('userInfo')),
      menuBtns: [],
      showAlert: false,
      showEditCard: false,
      editMenuIndex: '',
      editChildMenuIndex: '',
      staticMenu: [
        {
          label: '渠道个人中心',
          value: 'STATIC_PERSONNEL'
        },
        {
          label: '商城',
          value: 'STATIC_SHOP'
        },
        {
          label: '套餐配送',
          value: 'STATIC_DISTRIBUTION'
        }
      ]
    }
  },
  computed: {
    // 当前编辑菜单项名称
    editBtnName: {
      get () {
        if (this.editMenuIndex !== '' && this.editChildMenuIndex !== '') {
          return this.menuBtns[this.editMenuIndex].list[this.editChildMenuIndex].menuName
        }
        if (this.menuBtns[this.editMenuIndex]) {
          return this.menuBtns[this.editMenuIndex].menuName
        }
        return ''
      },
      set (val) {
        if (this.editMenuIndex !== '' && this.editChildMenuIndex !== '') {
          this.$set(this.menuBtns, this.editMenuIndex, {
            ...this.menuBtns[this.editMenuIndex],
            list: [
              ...this.menuBtns[this.editMenuIndex].list.slice(0, this.editChildMenuIndex),
              {
                ...this.menuBtns[this.editMenuIndex].list[this.editChildMenuIndex],
                menuName: val
              },
              ...this.menuBtns[this.editMenuIndex].list.slice(this.editChildMenuIndex + 1)
            ]
          })
        } else {
          if (this.menuBtns[this.editMenuIndex]) {
            this.$set(this.menuBtns, this.editMenuIndex, {
              ...this.menuBtns[this.editMenuIndex],
              menuName: val
            })
          }
        }
      }
    },
    // 当前编辑菜单项链接
    editBtnUrl: {
      get () {
        if (this.editMenuIndex !== '' && this.editChildMenuIndex !== '') {
          if (this.staticMenu.findIndex((o) => {
            return o.value === this.menuBtns[this.editMenuIndex].list[this.editChildMenuIndex].menuUrl
          }) > -1) {
            return this.menuBtns[this.editMenuIndex].list[this.editChildMenuIndex].menuUrl
          } else {
            return 'customLinks'
          }
        }
        if (this.menuBtns[this.editMenuIndex]) {
          if (this.staticMenu.findIndex((o) => {
            return o.value === this.menuBtns[this.editMenuIndex].menuUrl
          }) > -1) {
            return this.menuBtns[this.editMenuIndex].menuUrl
          } else {
            return 'customLinks'
          }
        }
        return ''
      },
      set (val) {
        if (this.menuBtns[this.editMenuIndex] && val !== 'customLinks') {
          if (this.editMenuIndex !== '' && this.editChildMenuIndex !== '') {
            this.$set(this.menuBtns, this.editMenuIndex, {
              ...this.menuBtns[this.editMenuIndex],
              list: [
                ...this.menuBtns[this.editMenuIndex].list.slice(0, this.editChildMenuIndex),
                {
                  ...this.menuBtns[this.editMenuIndex].list[this.editChildMenuIndex],
                  menuUrl: val
                },
                ...this.menuBtns[this.editMenuIndex].list.slice(this.editChildMenuIndex + 1)
              ]
            })
          } else {
            this.$set(this.menuBtns, this.editMenuIndex, {
              ...this.menuBtns[this.editMenuIndex],
              menuUrl: val
            })
          }
        } else if (val === 'customLinks') {
          if (this.editMenuIndex !== '' && this.editChildMenuIndex !== '') {
            this.$set(this.menuBtns, this.editMenuIndex, {
              ...this.menuBtns[this.editMenuIndex],
              list: [
                ...this.menuBtns[this.editMenuIndex].list.slice(0, this.editChildMenuIndex),
                {
                  ...this.menuBtns[this.editMenuIndex].list[this.editChildMenuIndex],
                  menuUrl: ''
                },
                ...this.menuBtns[this.editMenuIndex].list.slice(this.editChildMenuIndex + 1)
              ]
            })
          } else {
            this.$set(this.menuBtns, this.editMenuIndex, {
              ...this.menuBtns[this.editMenuIndex],
              menuUrl: ''
            })
          }
        }
      }
    },
    // 当前编辑菜单项自定义链接地址
    editCustomLink: {
      get () {
        if (this.editMenuIndex !== '' && this.editChildMenuIndex !== '') {
          if (this.staticMenu.findIndex((o) => {
            return o.value === this.menuBtns[this.editMenuIndex].list[this.editChildMenuIndex].menuUrl
          }) === -1) {
            return this.menuBtns[this.editMenuIndex].list[this.editChildMenuIndex].menuUrl
          }
        }
        if (this.menuBtns[this.editMenuIndex]) {
          if (this.staticMenu.findIndex((o) => {
            return o.value === this.menuBtns[this.editMenuIndex].menuUrl
          }) === -1) {
            return this.menuBtns[this.editMenuIndex].menuUrl
          }
        }
        return ''
      },
      set (val) {
        if (this.editMenuIndex !== '' && this.editChildMenuIndex !== '') {
          this.$set(this.menuBtns, this.editMenuIndex, {
            ...this.menuBtns[this.editMenuIndex],
            list: [
              ...this.menuBtns[this.editMenuIndex].list.slice(0, this.editChildMenuIndex),
              {
                ...this.menuBtns[this.editMenuIndex].list[this.editChildMenuIndex],
                menuUrl: val
              },
              ...this.menuBtns[this.editMenuIndex].list.slice(this.editChildMenuIndex + 1)
            ]
          })
        } else {
          this.$set(this.menuBtns, this.editMenuIndex, {
            ...this.menuBtns[this.editMenuIndex],
            menuUrl: val
          })
        }
      }
    }
  },
  methods: {
    // 查询菜单配置
    async getWeChatMenu () {
      const res = await ApiFindWechatMenu(this.userInfo.id)
      if (res && res.length > 0) {   
        let arr = [...res]
        arr = this.checkData(arr)
        for (let i of arr) {
          if (i.list) {
            i.list = this.checkData(i.list)
          }
        }
        this.menuBtns = arr
      }
    },
    // 删除查询多余字段
    checkData (list) {
      let tempList = [...list]
      for (let i of tempList) {
        delete i.appid
        delete i.appsecret
        delete i.createTime
        delete i.id
        delete i.shopId
        delete i.superId
        if (!i.list) {
          delete i.list
        }
      }
      return tempList
    },
    // 增加菜单（父）
    handleAddMenu () {
      this.menuBtns = [...this.menuBtns, {
        type: 1,
        menuName: '自定义菜单',
        menuUrl: ''
      }]
    },
    // 编辑菜单（父）
    handleEditMenu (index) {
      this.editMenuIndex = index
      this.editChildMenuIndex = ''
      if (!this.showEditCard) {
        this.showEditCard = true
      }
    },
    // 删除菜单（父）
    handleDeleteMenu (index) {
      this.menuBtns = [
        ...this.menuBtns.slice(0, index),
        ...this.menuBtns.slice(index + 1)
      ]
      this.editChildMenuIndex = ''
      this.editMenuIndex = ''
      this.showEditCard = false
    },
    // 增加菜单（子）
    handleAddChildMenu (index) {
      this.menuBtns[index].menuUrl = null
      if (this.menuBtns[index].list) {
        this.$set(this.menuBtns, index, {
        ...this.menuBtns[index],
        list: [
          ...this.menuBtns[index].list,
          {
            type: 2,
            menuName: '自定义子菜单',
            menuUrl: ''
          }]
        })
      } else {
        this.$set(this.menuBtns, index, {
        ...this.menuBtns[index],
        list: [{
            type: 2,
            menuName: '自定义子菜单',
            menuUrl: ''
          }]
        })
      }
    },
    // 编辑菜单（子）
    handleEditChildMenu (index) {
      this.editChildMenuIndex = index
      if (!this.showEditCard) {
        this.showEditCard = true
      }
    },
    // 删除菜单（子）
    handleDeleteChildMenu (index, index2) {
      if (this.menuBtns[index].list.length === 1) {
        this.$set(this.menuBtns, index, {
          ...this.menuBtns[index],
          list: undefined
        })
        this.editMenuIndex = ''
      } else {
        this.$set(this.menuBtns, index, {
          ...this.menuBtns[index],
          list: [
            ...this.menuBtns[index].list.slice(0, index2),
            ...this.menuBtns[index].list.slice(index2 + 1)
          ]
        })
      }
      this.editChildMenuIndex = ''
      this.showEditCard = false
    },
    // 限制字数
    menuWordLimit (str, limit) {
      if (str.length > limit) {
        return str.substring(0, limit) + '...'
      } else {
        return str
      }
    },
    /**
     * 保存配置
     */
    handleSaveMenu () {
      this.$Modal.confirm({
        title: '保存菜单',
        content: '是否保存当前菜单设置',
        onOk: async () => {
          this.$Message.loading({
            content: '提交中',
            duration: 0
          })
          const res = await ApiCreateWxMenu(this.userInfo.id, this.menuBtns)
          this.$Message.destroy()
          if (res === "SUCCESS") {
            this.$Notice.success({
              title: '保存成功',
              desc: '公众号菜单配置保存成功'
            })
          } else {
            this.$Notice.error({
              title: '保存失败',
              desc: res.msg
            })
          }
        }
      })
    },
    async checkWxConfig () {
      const res = await ApiGetWxConfig(this.userInfo.id)
      if (res.errorCode < 0) {
        this.showAlert = true
      }
    }
  },
  created () {
    this.checkWxConfig()
    this.getWeChatMenu()
  }
}
</script>
