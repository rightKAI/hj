import Vue from 'vue'
import merchant from '@/views/merchant'

describe('merchant.vue', () => {
  it('should render correct contents', async () => {
    const Constructor = Vue.extend(merchant)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('.hello h1').textContent)
    .toEqual('Welcome to Your Vue.js App')
  })
})
