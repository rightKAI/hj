<style lang="less" scoped>
@import './index.less';
</style>

<template>
  <div class="login">
    <Card class="login-card">
      <p slot="title">登录</p>
      <!-- <p class="title">朴道良品后台管理</p> -->
      <Form ref="form" class="form" :rules="rules" :model="formData">
        <Form-item prop="userName">
          <Input placeholder="请输入用户名" @keydown.13.native="submit('form')" v-model="formData.userName">
            <Icon type="person" slot="prepend"></Icon>
          </Input>
        </Form-item>
        <Form-item prop="password">
          <Input placeholder="请输入密码" @keydown.13.native="submit('form')"  v-model="formData.password" type="password">
            <Icon type="locked" slot="prepend"></Icon>
          </Input>
        </Form-item>
        <!-- <Form-item prop="checkCode">
          <Row>
            <Col span="12">
              <Input placeholder="请输入验证码" v-model="formData.checkCode">
                <Icon type="key" slot="prepend" size="16"></Icon>
              </Input>
            </Col>
            <Col span="7">
              <div class="codeImg">
                <img :src="require('@/assets/login-bg.jpg')">
              </div>
            </Col>
            <Col span="5">
              <div class="changOne">换一张</div>
            </Col>
          </Row>
        </Form-item> -->
        <div class="btn">
          <Button long type="primary" @click="submit('form')">登录</Button>
          <div class="load" v-show="load">
            <Icon type="load-c" size=14 class="demo-spin-icon-load" color='white'></Icon>
          </div>
        </div>
      </Form>
    </Card>
    <!-- <foot></foot> -->
  </div>
</template>

<script>
import foot from '@/components/footer'
import { ApiGetLogin } from '@/api'
export default {
  components: {
    foot
  },
  data () {
    return {
      formData: {
        userName: '',
        password: '',
        checkCode: ''
      },
      rules: {
        // checkCode: [{ required: true, message: '验证码不能为空', trigger: 'blur' }],
        userName: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
        password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
      },
      load: false
    }
  },
  methods: {
    // 登录按钮
    submit (name) {
      this.load = true
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          const res = await ApiGetLogin(this.formData.userName, this.formData.password)
          if (res.errorCode > 0) {
            this.$Message.success('登录成功')
            this.$cookies.set('userInfo', JSON.stringify(res.data), 60 * 60 * 24)
            this.$router.push({name: 'home'})
          } else {
            this.$Message.warning(res.msg)
            this.load = false
          }
        }
      })
    }
  }
}
</script>
