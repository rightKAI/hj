import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main',
      redirect: { name: 'home' },
      component: reslove => { require(['../layout/default'], reslove) },
      children: [
        {
          path: 'home',
          name: 'home',
          meta: {
            title: '黄金竹乡商户管理系统 - 首页',
            breadname: '首页'
          },
          component: reslove => { require(['../views/home'], reslove) }
        },
        {
          path: 'merchant',
          name: 'merchant',
          meta: {
            title: '黄金竹乡商户管理系统 - 子商户管理',
            breadname: '子商户管理'
          },
          component: reslove => { require(['../views/merchant'], reslove) }
        },
        {
          path: 'goods',
          name: 'goods',
          meta: {
            title: '黄金竹乡商户管理系统 - 商品列表',
            breadname: '商品列表'
          },
          component: reslove => { require(['../views/goods'], reslove) }
        },
        {
          path: 'goods/new_good',
          name: 'new_good',
          meta: {
            title: '黄金竹乡商户管理系统 - 新增商品',
            parent: 'goods',
            breadname: '新增商品'
          },
          component: reslove => { require(['../views/new_good'], reslove) }
        },
        {
          path: 'verify',
          name: 'verify',
          meta: {
            title: '黄金竹乡商户管理系统 - 子商户商品审核',
            breadname: '子商户商品审核'
          },
          component: reslove => { require(['../views/verify'], reslove) }
        },
        {
          path: 'shopOrder',
          name: 'shopOrder',
          meta: {
            title: '黄金竹乡商户管理系统 - 商城订单管理',
            breadname: '商城订单管理'
          },
          component: reslove => { require(['../views/shopOrder'], reslove) }
        },
        {
          path: 'dispatchingOrder',
          name: 'dispatchingOrder',
          meta: {
            title: '黄金竹乡商户管理系统 - 配送单管理',
            breadname: '配送单管理'
          },
          component: reslove => { require(['../views/dispatchingOrder'], reslove) }
        },
        {
          path: 'accredit',
          name: 'accredit',
          meta: {
            title: '黄金竹乡商户管理系统 - 人员管理',
            breadname: '人员管理'
          },
          component: reslove => { require(['../views/accredit'], reslove) }
        },
        {
          path: 'reward',
          name: 'reward',
          meta: {
            title: '黄金竹乡商户管理系统 - 奖励设置',
            breadname: '奖励设置'
          },
          component: reslove => { require(['../views/reward'], reslove) }
        },
        {
          path: 'wxconfig',
          name: 'wxconfig',
          meta: {
            title: '黄金竹乡商户管理系统 - 公众号设置',
            breadname: '开发配置'
          },
          component: reslove => { require(['../views/wxconfig'], reslove) }
        },
        {
          path: 'wxmenu',
          name: 'wxmenu',
          meta: {
            title: '黄金竹乡商户管理系统 - 公众号设置',
            breadname: '菜单设置'
          },
          component: reslove => { require(['../views/wxmenu'], reslove) }
        },
        {
          path: 'users',
          name: 'users',
          meta: {
            title: '黄金竹乡商户管理系统 - 用户管理',
            breadname: '用户管理'
          },
          component: reslove => { require(['../views/users'], reslove) }
        },
        {
          path: 'statistics',
          name: 'statistics',
          meta: {
            title: '黄金竹乡商户管理系统 - 统计分析',
            breadname: '统计分析'
          }
        },
        {
          path: 'view',
          name: 'view',
          meta: {
            title: '黄金竹乡商户管理系统 - 页面设置',
            breadname: '页面设置'
          },
          component: reslove => { require(['../views/view'], reslove) }
        },
        {
          path: 'gift',
          name: 'gift',
          meta: {
            title: '黄金竹乡商户管理系统 - 礼品中心',
            breadname: '礼品中心'
          },
          component: reslove => { require(['../views/gift'], reslove) }
        },
        {
          path: 'giftOrder',
          name: 'giftOrder',
          meta: {
            title: '黄金竹乡商户管理系统 - 礼品订单',
            breadname: '礼品中心'
          },
          component: reslove => { require(['../views/giftOrder'], reslove) }
        },
        {
          path: 'memberPM',
          name: 'memberPM',
          meta: {
            title: '黄金竹乡商户管理系统 - 会员管理',
            breadname: '会员管理'
          },
          component: reslove => { require(['../views/memberPM'], reslove) }
        },
        {
          path: 'rebateRecord',
          name: 'rebateRecord',
          meta: {
            title: '黄金竹乡商户管理系统 - 返利记录',
            breadname: '会员管理'
          },
          component: reslove => { require(['../views/rebateRecord'], reslove) }
        },
        {
          path: 'memberRebate',
          name: 'memberRebate',
          meta: {
            title: '黄金竹乡商户管理系统 - 会员管理',
            breadname: '会员返利'
          },
          component: reslove => { require(['../views/memberRebate'], reslove) }
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      meta: {
        title: '登录'
      },
      component: reslove => { require(['../views/login'], reslove) }
    },
    {
      path: '/*',
      name: 'error_404',
      meta: {
        title: '页面不存在'
      },
      component: reslove => { require(['../views/error_page/404.vue'], reslove) }
    }
  ]
})
