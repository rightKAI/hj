<style lang="less" scoped>
@import url('./index.less');
</style>

<template>
  <div @click="handleClick" class="goodPreview">
    <img :src="utils.handleImgPrefix(imgList[0])">
  </div>
</template>

<script>
export default {
  props: {
    imgURLStr: {
      type: String
    }
  },
  data () {
    return {
      imgList: []
    }
  },
  methods: {
    handleClick () {
      this.$emit('on-click', this.imgList)
    }
  },
  mounted () {
    this.imgList = this.imgURLStr ? this.imgURLStr.split(',') : []
  }
}
</script>
