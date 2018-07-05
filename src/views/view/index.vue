<template>
  <div>    
    <Row class="page-manager">
        <Col class="left-size" span="12">
        <!-- <Select class="size-controll" @on-change="screenTypeOnchange" v-model="screenType">
            <Option label="iPhone7 --- 375 x 667" value="iPhone7"></Option>
            <Option label="iPhone7 Plus --- 414 x 736" value="iPhone7 Plus"></Option>
            <Option label="iPhone X --- 375 x 812" value="iPhone X"></Option>
            <Option label="Galaxy S5 --- 360 x 640" value="Galaxy S5"></Option>
            <Option label="Nexux 6P --- 412 x 732" value="Nexux 6P"></Option>
        </Select> -->
        <div class="screen" :style="screenSize">
          <div class="replaceBanner" v-if="!bannerList.length">请设置banner图片</div>
          <Carousel v-if="bannerList.length && carouselRender" v-model="value1" loop class="banner" :radius-dot="true">
            <CarouselItem v-for="item in previewList" :key="item" style="overflow:hidden" >
              <img :src="utils.handleImgPrefix(item)" style="width:100%">
            </CarouselItem>
          </Carousel>
        </div>
        </Col>
        <Col class="right-size" span="12">
          <Form class="edit-form" label-position="top">
              <FormItem label="banner设置">
              </FormItem>
          </Form>
          <div class="imgList">
              <Card dis-hover>
                  <p slot="title" style="height: auto">
                    <Upload
                      :action="addPicAdress"
                      :data="{ imgType: 'shop' }"
                      name="image"
                      :show-upload-list="false"
                      :on-progress="handleUploading"
                      :on-success="hanldeUploadSuccess"
                      :on-error="handleUploadError">
                      <Button type="ghost" icon="ios-cloud-upload-outline">上传图片</Button>
                    </Upload>
                  </p>
                  <div style="height: 360px;">
                      <ul id="todoList" class="iview-admin-draggable-list">
                          <li v-for="(item, index) in bannerList" :key="index" class="notwrap todolist-item" :data-index="index">
                              <img :src="utils.handleImgPrefix(item)" @click="bigImg(item)">
                              <Button class="btn" type="text" @click="deleteImg(index)">删除</Button>
                          </li>
                      </ul>
                  </div>
              </Card>
          </div>
          <Button type="primary" class="submit" @click="submit">提交</Button>
        </Col>
    </Row>
    <!-- 裁剪图片弹框 -->
    <Modal
      :width="60"
      v-model="showCropper"
      @on-ok="handleCropperSure">
      <div>
        <Alert style="margin-top: 20px" type="success">
          <p style="color: red">按住shift可保持当前比例拖动</p>
          <span> --- 宽：{{ cropperSize.w }} --- 高：{{ cropperSize.h }} --- 当前宽高比：{{ parseFloat(cropperSize.w / cropperSize.h) }} --- </span>
        </Alert>
        <img id="cropper" style="width: 600px" :src="utils.handleImgPrefix(waitForCropperImg)">
      </div>
    </Modal>
    <!-- 预览图片 -->
    <Modal
      title="预览图片"
      v-model="showPreview">
        <img :src="utils.handleImgPrefix(bigImgSrc)" style="width: 485px">
      <div slot="footer"></div>
    </Modal>
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import { API_UPLOADPIC, ApiTailorImage, ApiGetBannerList, ApiUpdateBanner, ApiAddBanner } from '@/api'

// 图片裁剪
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.min.css'
import { env } from '@/api'

export default {
  data () {
    return {
      flag: false,
      showSelectProd: false,
      carouselRender: true,
      value1: 0,
      userInfo: JSON.parse(this.$cookies.get('userInfo')),
      bannerList: [],
      previewList: [],
      screenType: 'iPhone7',   
      showCropper: false, 
      cropper: {},  
      cropperSize: {
        x: '',
        y: '',
        w: '',
        h: ''
      },
      waitForCropperImg: '',
      bigImgSrc: '',
      showPreview: false
    }
  },
  computed: {
    screenSize () {
      switch (this.screenType) {
        case 'iPhone7':
          return {
            width: `${375 * 0.8}px`,
            height: `${667 * 0.8}px`
          }
        case 'iPhone7 Plus':
          return {
            width: `${414 * 0.8}px`,
            height: `${736 * 0.8}px`
          }
        case 'iPhone X':
          return {
            width: `${375 * 0.8}px`,
            height: `${812 * 0.8}px`
          }
        case 'Galaxy S5':
          return {
            width: `${360 * 0.8}px`,
            height: `${640 * 0.8}px`
          }
        case 'Nexux 6P':
          return {
            width: `${412 * 0.8}px`,
            height: `${732 * 0.8}px`
          }
      }
    },    
    addPicAdress () {
      return API_UPLOADPIC
    }
  },
  methods: {
    // 提交banner
    submit () {
      this.$Modal.confirm({
        content: '确定提交吗？',
        onOk: () => {
          if (this.flag) {
            this.addBanner()
          } else {
            this.updateBanner()
          }
        }
      })
    },
    // 新增banner
    async addBanner () {
      const data = {
        enterpriseName: this.userInfo.enterpriseName,
        bannerUrl: JSON.stringify(this.previewList),
        enterpriseId: this.userInfo.id
      }
      let res = await ApiAddBanner(data)      
      if (res.errorCode > 0) {
        this.$Message.success('设置成功')
      }
    },
    // 更新banner
    async updateBanner () {
      const data = {
        id: this.bannerId,
        bannerUrl: JSON.stringify(this.previewList),
        enterpriseId: this.userInfo.id
      }
      let res = await ApiUpdateBanner(data)      
      if (res.errorCode > 0) {
        this.$Message.success('设置成功')
      }
    },
    // 获取初始banner列表
    async getBannerList () {
      const data = {
        enterpriseId: this.userInfo.id
      }
      const res = await ApiGetBannerList(data)
      if (res.map.data === null) {
        this.flag = true
      } else {
        this.bannerId = res.data[0].id
        this.bannerList = JSON.parse(res.data[0].bannerUrl)
        this.previewList = this.bannerList
      }
    },
    // 查看大图
    bigImg (item) {
      this.showPreview = true
      this.bigImgSrc = item
    }, 
    // 图片上传中
    handleUploading () {
      this.$Message.loading('上传中...')
    },
    // 上传图片成功时
    hanldeUploadSuccess (res) {
      this.$Message.destroy()
      this.$Message.success('上传成功')
      this.waitForCropperImg = res.imgPath
      this.showCropper = true
      this.$nextTick(() => {
        if (this.cropper.canvas) {
          this.cropper.replace(this.utils.handleImgPrefix(res.imgPath)) //res.imgPath
          return
        }
        let img = document.getElementById('cropper')
        this.cropper = new Cropper(img, {
          dragMode: 'drag',
          minCropBoxWidth: 100,
          minCropBoxHeight: 100,
          restore: false,
          center: false,
          highlight: false,
          scalable: false,
          zoomable: false,
          cropBoxMovable: true,
          toggleDragModeOnDblclick: false,
          ready: () => {
            this.cropper.setCropBoxData({
              width: 375,
              height: 200
            })
          },
          crop: (e) => {
            this.cropperSize.x = parseInt(e.detail.x)
            this.cropperSize.y = parseInt(e.detail.y)
            this.cropperSize.w = parseInt(e.detail.width)
            this.cropperSize.h = parseInt(e.detail.height)
          }
        })
      })
    },
    // 上传失败时
    handleUploadError () {
      this.$Message.destroy()
      this.$Message.warning('上传失败')
    },
    // 裁剪图片
    async handleCropperSure () {
      const res = await ApiTailorImage(this.waitForCropperImg, 'shop', this.cropperSize)
      if (res.errorCode === 1) {
        this.waitForCropperImg = ''
        this.bannerList.push(res.data)
        this.$nextTick(() => {
          this.$Message.success('裁剪完成')
        })
      }
    },
    // 删除banner
    deleteImg (index) {
      this.$Modal.confirm({
        content: '确认删除吗？',
        onOk: () => {
          this.bannerList.splice(index, 1)
        }
      })
    }
    // 更改尺寸时
    /* screenTypeOnchange () {
      this.carouselRender = false
      this.$nextTick(() => {
        this.carouselRender = true
      })
    } */
  },
  mounted () {
    this.getBannerList()
    document.body.ondrop = function (event) {
        event.preventDefault()
        event.stopPropagation()
    }
    let todoList = document.getElementById('todoList')
    Sortable.create(todoList, {
        group: {
            name: 'list',
            pull: true
        },
        animation: 120,
        ghostClass: 'placeholder-style',
        fallbackClass: 'iview-admin-cloned-item',
        onUpdate: (event) => {
          /* const imgList = document.getElementById('todoList').getElementsByTagName('img')
          console.log(imgList[0].src.substring(7))
          this.bannerList = []
          for (let i = 0; i < imgList.length; i++) {
            this.bannerList.push(imgList[i].src.substring(7))
          } */
          this.$nextTick(() => {
            this.previewList = this.utils.arraySort(this.previewList, event.newIndex, event.oldIndex)
          })
        }
    })
  }
}
</script>

<style lang='less' scoped>
@import './index.less';
</style>
