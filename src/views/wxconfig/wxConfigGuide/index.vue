<template>
  <div class="wxconfig-guide">
    <p>1.查询appid和appsecret、设置IP白名单、服务器地址。</p>
    <img :src="wxConfigImg[0]" alt="">
    <p>设置白名单</p>
    <img :src="wxConfigImg[1]" alt="">
    <p>2.设置JS接口安全域名以及网页授权域名</p>
    <img :src="wxConfigImg[2]" alt="">
    <p>下载MP_verify文件，上传到服务器</p>
    <p style="color: red">注意：需要先将文件上传后才能点击保存</p>
    <img :src="wxConfigImg[3]" alt="">
    <img :src="wxConfigImg[4]" alt="">
    <p>3.微信支付设置</p>
    <img :src="wxConfigImg[5]" alt="">
    <p>若无安装证书，则先安装证书</p>
    <img :src="wxConfigImg[6]" alt="">
    <img :src="wxConfigImg[7]" alt="">
    <img :src="wxConfigImg[8]" alt="">
    <p>设置支付授权目录</p>
    <img :src="wxConfigImg[9]" alt="">
    <p>下载证书</p>
    <img :src="wxConfigImg[10]" alt="">
    <img :src="wxConfigImg[11]" alt="">
  </div>
</template>

<script>
export default {
  data () {
    return {
      wxConfigImg: [
        require('@/assets/wxconfig1.png'),
        require('@/assets/wxconfig2.png'),
        require('@/assets/wxconfig3.png'),
        require('@/assets/wxconfig4.png'),
        require('@/assets/wxconfig5.png'),
        require('@/assets/wxconfig6.png'),
        require('@/assets/wxconfig7.png'),
        require('@/assets/wxconfig8.png'),
        require('@/assets/wxconfig9.png'),
        require('@/assets/wxconfig10.png'),
        require('@/assets/wxconfig13.png'),
        require('@/assets/wxconfig14.png'),
      ]
    }
  }
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
