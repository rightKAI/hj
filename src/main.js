// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import iView from 'iview'
import './styles/public.less'
import './styles/theme.less'
import utils from './lib/utils'
import VueCookies from 'vue-cookies'
import goodPreview from '@/components/goodPreview'
import ruleDetail from '@/components/ruleDetail'
const lodash = require('lodash')

Vue.use(iView)
Vue.use(VueCookies)

// 注册全局组件，否则无法在iview table的单位格render使用
Vue.component('goodPreview', goodPreview)
Vue.component('ruleDetail', ruleDetail)

Vue.config.productionTip = false
Vue.prototype.utils = utils
Vue.prototype._ = lodash

router.beforeEach((to, from, next) => {
  iView.LoadingBar.start()
  window.document.title = to.meta.title || '云尚生活商户管理'
  if (!VueCookies.get('userInfo') && to.name !== 'login') {
    iView.Message.info('请先登录')
    next({
      name: 'login'
    })
  } else {
    let breadcrumbList = []
    if (to.meta.parent) {
      let route = router.options.routes[0].children.find((n) => {
        return n.name === to.meta.parent
      })
      breadcrumbList = [route]
    }
    breadcrumbList = [...breadcrumbList, ...to.matched.slice(1)]
    store.commit('SET_BREADCRUMB', breadcrumbList)
    next()
  }
})

router.afterEach(() => {
  iView.LoadingBar.finish()
  window.scrollTo(0, 0)
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
