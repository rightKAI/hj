<template>
  <div class="wxconfig">
    <Alert show-icon type="info">
      如何设置公众号
      <span slot="desc">
        请仔细阅读向导，根据向导进行公众号配置设置。  &nbsp;<Button type="primary" @click="showGuide = true">查看设置向导</Button>
        <Upload
          style="float: right"
          :action="uploadMpVerify"
          :show-upload-list="false"
          :on-success="handleVerifyUploadSuccess"
          :on-error="handleUploadError"
          name="verify">
          <Button type="primary" v-if="!editting" icon="ios-cloud-upload-outline">上传MP_verify文件</Button>
        </Upload>
      </span>
    </Alert>
    <Form class="wxconfig-form" :label-width="120" ref="wxConfig" :model="wxConfig" :rules="wxConfigRules">
      <FormItem prop="appid" label="appid">
        <Input :disabled="editting" v-model="wxConfig.appid" placeholder="请输入appid"></Input>
      </FormItem>
      <FormItem prop="appsecret" label="appsecret">
        <Input :disabled="editting" v-model="wxConfig.appsecret" placeholder="请输入appsecret"></Input>
      </FormItem>
      <FormItem prop="mchId" label="微信商务支付号">
        <Input :disabled="editting" v-model="wxConfig.mchId" placeholder="请输入微信商务支付号"></Input>
      </FormItem>
      <FormItem required label="公众号二维码">
        <div v-if="editting" ref="qrCode" id="qrCode"></div>
        <Upload
          v-else
          :action="uploadQRCode"
          :on-success="handleQRCodeUploadSuccess"
          :on-error="handleUploadError"
          :show-upload-list="false"
          name="qrCode">
          <Button v-if="!wxConfig.wxQrCode" type="ghost" icon="ios-cloud-upload-outline">上传公众号二维码</Button>
          <div class="qrcode-upload">
            <div class="qrcode-upload-cover">
              重新上传
            </div>
            <div v-show="wxConfig.wxQrCode" ref="qrCode" id="qrCode"></div>
          </div>
        </Upload> 
      </FormItem>
      <FormItem required label="API证书">
        <span v-if="editting">{{ certName }}</span>
        <Upload
          v-else
          :action="uploadWxCert"
          :format="['p12']"
          :show-upload-list="false"
          :on-format-error="handleWxCertFormatError"
          :on-success="handleWxCertUploadSuccess"
          :on-error="handleUploadError"
          name="cert"
          :data="{ vendorId: -(userInfo.id) }">
          <p v-if="wxConfig.certName">
            <Button type="ghost" icon="ios-cloud-upload-outline">重新上传</Button>
            <span style="margin-left: 4px">{{ certName }}</span>
          </p>
          <Button v-else type="ghost" icon="ios-cloud-upload-outline">上传证书</Button>
        </Upload> 
      </FormItem>
      <FormItem prop="wxKey" label="API证书密钥">
        <Input :disabled="editting" v-model="wxConfig.wxKey" placeholder="请输入API证书密钥"></Input>
      </FormItem>
      <FormItem prop="sendName" label="红包发送者">
        <Input :disabled="editting" v-model="wxConfig.sendName" placeholder="请输入红包发送者"></Input>
      </FormItem>
      <FormItem prop="wishing" label="红包祝福语">
        <Input :disabled="editting" v-model="wxConfig.wishing" placeholder="请输入红包祝福语"></Input>
      </FormItem>
    </Form>
    <div v-if="!editting" class="wxconfig-form form-button">
      <Button type="warning" @click="testAccessToken">验证测试</Button>
      <!-- <Button type="primary" v-if="editting && wxConfig.id" @click="editting = false; certPass = false">修改</Button> -->
      <Button type="primary" @click="createWxConfig">保存</Button>
    </div>
    <!-- 设置向导弹框 -->
    <Modal
      :width="80"
      v-model="showGuide"
      title="设置引导">
      <wxConfigGuide></wxConfigGuide>
      <div slot="footer"></div>
    </Modal>
  </div>
</template>

<script>
import {
  env,
  ApiGetWxConfig,
  ApiCreatePDWxConfig,
  ApiUpdatePDWxConfig,
  ApiCreateEnterpriseConfig,
  ApiTestAccessToken,
  ApiGetIsCert,
  ApiCreateWxMenu,
  UPLOADWXCERT,
  UPLOADQRCODE,
  UPLOADMPVERIFY
} from '@/api'
import wxConfigGuide from './wxConfigGuide'

export default {
  components: {
    wxConfigGuide
  },
  data () {
    return {
      userInfo: JSON.parse(this.$cookies.get('userInfo')),
      editting: false,
      showGuide: false,
      certPass: false,
      wxConfig: {
        appid: '',
        appsecret: '',
        certName: '',
        mchId: '',
        sendName: '',
        wxQrCode: '',
        wishing: '',
        wxKey: ''
      },
      wxConfigRules: {
        appid: [
          { required: true, message: '请输入appid', trigger: 'blur' }
        ],
        appsecret: [
          { required: true, message: '请输入appsecret', trigger: 'blur' }
        ],
        mchId: [
          { required: true, message: '请输入微信商务支付号', trigger: 'blur' }
        ],
        wxKey: [
          { required: true, message: '请输入Api证书密钥', trigger: 'blur' }
        ],
        sendName: [
          { required: true, message: '请输入红包发送者', trigger: 'blur' }
        ],
        wishing: [
          { required: true, message: '请输入红包祝福语', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    uploadWxCert () {
      return (env === 'development' ? '/api' : '') + UPLOADWXCERT
    },
    uploadQRCode () {
      return (env === 'development' ? '/api' : '') + UPLOADQRCODE
    },
    uploadMpVerify () {
      return (env === 'development' ? '/api' : '') + UPLOADMPVERIFY
    },
    certName () {
      const certNameSplit = this.wxConfig.certName.split('/')
      const name = certNameSplit[certNameSplit.length - 1]
      const nameSplit = name.split('-')
      const finalNameSplit = [...nameSplit.slice(2)]
      return finalNameSplit.join('-')
    }
  },
  methods: {
    /**
     * 查询微信配置信息
     */
    async getWxConfig () {
      const res = await ApiGetWxConfig(this.userInfo.id)
      if (res.errorCode > -1) {
        this.wxConfig = res.data
        this.editting = true
      }
    },
    /**
     * 测试能否获取access_token
     */
    async testAccessToken () {
      if (this.editting) {
        this.$Message.info('无需测试')
        return
      }
      this.$Message.loading({
        content: '测试中，请稍后',
        duration: 0
      })
      const res = await ApiTestAccessToken(this.wxConfig.appid, this.wxConfig.appsecret)
      if (res.errcode) {
        this.$Notice.info({
          title: '验证失败',
          desc: '请检查appId和appsecret是否有误'
        })
      } else {
        const result = await ApiGetIsCert(this.wxConfig.certName, this.wxConfig.mchId)
        if (result.errorCode < 1) {
          this.$Notice.info({
            title: '验证失败',
            desc: '请检查Api证书和Api密钥是否匹配'
          })
        } else {
          this.$Notice.success({
            title: '验证成功',
            desc: '验证成功，请保存设置'
          })
          this.certPass = true
        }
      }
      this.$Message.destroy()
    },
    /**
     * 创建wxConfig
     */
    createWxConfig () {
      if (this.loading) return
      if (!this.certPass) {
        this.$Message.warning('请先进行验证测试')
        return
      }
      this.$refs.wxConfig.validate(async (boolean) => {
        if (boolean) {
          if (!this.wxConfig.wxQrCode) {
            this.$Message.warning('请上传公众号二维码')
            return
          } else if (!this.wxConfig.certName) {
            this.$Message.warning('请上传Api证书')
            return
          }
          this.$Message.loading({
            content: '提交中...',
            duration: 0
          })
          this.loading = true
          if (!this.wxConfig.id) {
            let wxConfig = { ...this.wxConfig }
            wxConfig.eid = this.userInfo.id
            if (location.host.indexOf('ceshi') > -1) {
              wxConfig.redirect_uri = 'http://csm.zgdz.org.cn/getOpenId.json?securityCode='
            } else {
              wxConfig.redirect_uri = 'http://cyc8.cn/getOpenId.json?securityCode='
            }
            const res = await ApiCreatePDWxConfig(wxConfig)
            if (res.errorCode > 0) {
              const result = await ApiCreateEnterpriseConfig(this.userInfo.id, res.errorCode)
              this.$Message.destroy()
              if (result.errorCode > 0) {
                this.$Message.success('保存成功')
                this.getWxConfig()
              } else {
                this.$Notice.error({
                  title: '保存失败',
                  desc: '保存微信配置失败，请检查填写以及上传文件是否正确'
                })
              }
            }
          } else {
            let wxConfig = { ...this.wxConfig }
            const res = await ApiUpdatePDWxConfig(wxConfig)
            this.$Message.destroy()
            if (res.errorCode > 0) {
              this.$Message.success('保存成功')
              this.getWxConfig()
              const res = await ApiCreateWxMenu(this.wxConfig.appid, this.wxConfig.appsecret, this.userInfo.id)
              if (res.errorCode > -1) {
                this.$Notice.success({
                  title: '公众号菜单配置成功',
                  desc: '您的公众号菜单已成功配置'
                })
              }
            } else {
              this.$Notice.error({
                title: '保存失败',
                desc: '保存微信配置失败，请检查填写以及上传文件是否正确'
              })
            }
          }
          this.loading = false
        } else {
          this.$Message.warning('请检查输入')
        }
      })
    },
    // 上传文件成功
    handleUploadSuccess (res, file, fileList) {
      this.$Notice.success({
        title: '上传成功',
        desc: `上传文件${file.name}成功`
      })
    },
    // 上传文件失败
    handleUploadError (error, file, fileList) {
      this.$Notice.error({
        title: '上传失败',
        desc: `上传文件${file.name}失败`
      })
    },
    // 上传verify文件成功
    handleVerifyUploadSuccess (res, file, fileList) {
      if (res.errorCode < 0) {
        this.$Notice.warning({
          title: '上传失败',
          desc: res.msg
        })
        return
      }
      this.handleUploadSuccess(res, file, fileList)
    },
    // 上传微信公众号二维码
    handleQRCodeUploadSuccess (res, file, fileList) {
      if (res.errorCode < 0) {
        this.$Notice.warning({
          title: '上传失败',
          desc: '请检查上传的图片是否正确'
        })
        return
      }
      this.handleUploadSuccess(res, file, fileList)
      this.wxConfig = {
        ...this.wxConfig,
        wxQrCode: res.wxQrCode
      }
    },
    // 验证上传的证书后缀
    handleWxCertFormatError (file) {
      this.$Notice.warning({
        title: '上传的证书文件错误',
        desc: '证书文件应是.p12后缀的文件'
      })
    },
    // 上传证书成功
    handleWxCertUploadSuccess (res, file, fileList) {
      if (res.errorCode < 0) {
        this.$Notice.warning({
          title: '上传失败',
          desc: '请检查上传的文件是否正确'
        })
        return
      }
      this.handleUploadSuccess(res, file, fileList)
      this.wxConfig = {
        ...this.wxConfig,
        certName: res.certUrl
      }
    }
  },
  watch: {
    wxConfig: {
      handler (val) {
        if (val.wxQrCode) {
          this.$refs.qrCode.innerHTML = ''
          this.$nextTick(() => {
            this.utils.qrcode('qrCode', this.wxConfig.wxQrCode, 100)
          })
        }
      },
      deep: true
    },
    editting (val) {
      if (!val && this.wxConfig.wxQrCode) {
        this.$refs.qrCode.innerHTML = ''
        this.$nextTick(() => {
          this.utils.qrcode('qrCode', this.wxConfig.wxQrCode, 100)
        })
      }
    }
  },
  created () {
    this.getWxConfig()
  }
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
