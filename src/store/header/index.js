import { ApiFindWechatMenu } from '@/api'

const state = {
  breadcrumb: [],
  isSetWxConfig: false
}

const getters = {
  breadcrumb: state => state.breadcrumb
}

const actions = {
  async checkWxConfig ({ commit }, id) {
    const res = await ApiFindWechatMenu(id)
    if (res.errorCode > 0) {
      commit('HADSETWXCONFIG')
    }
  }
}

const mutations = {
  'SET_BREADCRUMB' (state, routerList) {
    let arr = []
    for (let i of routerList) {
      arr.push({title: i.meta.breadname, name: i.name})
    }
    state.breadcrumb = arr
  },
  'HADSETWXCONFIG' (state) {
    state.isSetWxConfig = true
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
