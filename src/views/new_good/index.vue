<style lang="less" scoped>
@import './index.less';
</style>

<template>
  <div class="new-good">
    <Form inline :label-width="100" :model="formData" :rules="formRules" ref="form">
      <FormItem class="form-item" label="商品名称" prop="goodsName">
        <Input v-model="formData.goodsName"></Input>
      </FormItem>
      <FormItem class="form-item" label="商品库存" prop="amount">
        <Input v-model="formData.amount"></Input>
      </FormItem>
      <FormItem class="form-item" label="商品价格" prop="price">
        <Input v-model="formData.price"></Input>
      </FormItem>
      <br />
      <FormItem class="form-item" label="最低折扣价">
        <Input v-model="formData.lowest_discountPrice"></Input>
      </FormItem>
      <FormItem class="form-item" label="商品类型" prop="categoryId">
        <!-- <Select v-model="formData.categoryId" style="width:162px">
          <Option v-for="(item, index) in typeData" :key="item.categoryName" :value="item.id" v-text="item.categoryName"></Option>
        </Select> -->
        <Cascader :data="typeData" v-model="formData.categoryId"></Cascader>
      </FormItem>
      <FormItem class="form-item" prop="title" label="商品标题">
        <Input v-model="formData.title"></Input>
      </FormItem>
      <br />
      <FormItem class="form-item" label="商品备注">
        <Input v-model="formData.remark"></Input>
      </FormItem>
      <FormItem class="form-item" label="套餐商品">
        <Switch v-model="formData.set_meal" :true-value="1" :false-value="0">
          <span slot="open">是</span>
          <span slot="close">否</span>
        </Switch>
      </FormItem>
      <br/>
      <FormItem class="form-item" label="总量" prop="totalNum" v-if="formData.set_meal === 1">
        <Input v-model="formData.totalNum"></Input>
      </FormItem>
      <FormItem class="form-item" label="单次配送数量" prop="singleNum" v-if="formData.set_meal === 1">
        <Input v-model="formData.singleNum"></Input>
      </FormItem>
      <br />
      <FormItem class="form-item" label="商品主图" prop="imgURL">
        <Upload
          :action="addPicAdress"
          :data="{ imgType: 'shop' }"
          name="image"
          :show-upload-list="false"
          :format="['jpg', 'jpeg', 'png']"
          :on-progress="handleUploading"
          :on-success="hanldeUploadSuccess"
          :on-error="handleUploadError">
          <Button type="ghost" icon="ios-cloud-upload-outline">上传主图</Button>
        </Upload>
        <span class="tip">*推荐图片尺寸比例为1:1</span>
      </FormItem>
      <br />
      <Carousel
        v-if="formData.imgURL.length > 0"
        :autoplay="formData.imgURL.length > 1"
        :autoplay-speed="5000"
        class="picPreview"
        v-model="previewPicIndex">
        <CarouselItem v-for="(pic, picIndex) in formData.imgURL" :key="pic">
          <div class="craouselDiv">
            <Button type="error" @click.native="handleDeleteImg(picIndex)" class="craouselDele" icon="trash-b" shape="circle"></Button>
            <img style="width: 100%" :src="`${utils.handleImgPrefix(pic)}`" alt="">
          </div>
        </CarouselItem>
      </Carousel>
      <br />
      <FormItem class="form-item" label="商品规格">
        <Button @click="handleAddSpec" type="primary">
          <Icon type="plus-round"></Icon>
          添加规格
        </Button>
      </FormItem>
      <br />
      <template v-for="(item, index) in specList">
        <FormItem class="form-item" label="规格名称">
          <Input v-model="item.attributeName"></Input> 
        </FormItem>
        <FormItem class="form-item" label="规格参数">
          <Input v-model="item.value"></Input> 
        </FormItem>
        <FormItem class="form-item" label="规格库存">
          <Input v-model="item.amount"></Input>
        </FormItem>
        <FormItem class="form-item" label="规格价格">
          <Input v-model="item.price" placeholder="非必填，不填则同商品价格"></Input>
        </FormItem>
        <FormItem :label-width="1">
          <Button size="small" @click="handleRemoveSpec(index)" shape="circle" type="warning" icon="minus-round"></Button>
        </FormItem>
      </template>
    </Form>
    <Card shadow>
      <p slot="title">商品详情</p>
      <p slot="extra">
        <Button :loading="isLoading" type="primary" @click="submitProdInfo">提交新增产品</Button>
      </p>
      <textarea class='tinymce-textarea' id="tinymceEditer"></textarea>
    </Card>
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
        <img id="cropper" style="width: 600px" :src="`${utils.handleImgPrefix(waitForCropperImg)}`">
      </div>
    </Modal>
  </div>
</template>

<script>
import { ApiGetAddGoods, ApiUpdateGoods, ApiGetGoodsCategory, API_UPLOADPIC, ApiTailorImage, ApiUploadPic } from '@/api'
// 富文本编辑器
import tinymce from 'tinymce'
// 样式
import 'tinymce/themes/modern/theme.js'
import 'tinymce/skins/lightgray/skin.min.css'
import 'tinymce/skins/lightgray/content.min.css'
// 语言
import '@/lib/zh_CN.js'
// 插件
import 'tinymce/plugins/advlist/plugin.min.js'
import 'tinymce/plugins/autolink/plugin.min.js'
import 'tinymce/plugins/lists/plugin.min.js'
import 'tinymce/plugins/link/plugin.min.js'
import 'tinymce/plugins/image/plugin.min.js'
import 'tinymce/plugins/charmap/plugin.min.js'
import 'tinymce/plugins/print/plugin.min.js'
import 'tinymce/plugins/preview/plugin.min.js'
import 'tinymce/plugins/hr/plugin.min.js'
import 'tinymce/plugins/anchor/plugin.min.js'
import 'tinymce/plugins/pagebreak/plugin.min.js'
import 'tinymce/plugins/imagetools/plugin.min.js'
import 'tinymce/plugins/searchreplace/plugin.min.js'
import 'tinymce/plugins/visualblocks/plugin.min.js'
import 'tinymce/plugins/visualchars/plugin.min.js'
import 'tinymce/plugins/fullpage/plugin.min.js'
import 'tinymce/plugins/insertdatetime/plugin.min.js'
import 'tinymce/plugins/media/plugin.min.js'
import 'tinymce/plugins/nonbreaking/plugin.min.js'
import 'tinymce/plugins/save/plugin.min.js'
import 'tinymce/plugins/table/plugin.min.js'
import 'tinymce/plugins/contextmenu/plugin.min.js'
import 'tinymce/plugins/directionality/plugin.min.js'
import 'tinymce/plugins/paste/plugin.min.js'
import 'tinymce/plugins/textcolor/plugin.min.js'
import 'tinymce/plugins/colorpicker/plugin.min.js'
import 'tinymce/plugins/textpattern/plugin.min.js'

// 图片裁剪
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.min.css'
import { env } from '@/api'

export default {
  data () {
    return {
      userInfo: JSON.parse(this.$cookies.get('userInfo')),
      showCropper: false,
      waitForCropperImg: '',
      previewPicIndex: 0,
      bigImgSrc: '',
      bigImg: false,
      isChooseImg: false,
      cropperSize: {
        x: '',
        y: '',
        w: '',
        h: ''
      },
      formData: {
        goodsName: '',
        amount: '',
        price: '',
        lowest_discountPrice: '',
        contents: '',
        remark: '',
        set_meal: 0,
        title: '',
        imgURL: [],
        categoryId: [],
        totalNum: '',
        singleNum: ''
      },
      formRules: {
        goodsName: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        title: [
          { required: true, message: '请输入商品标题', trigger: 'blur' }
        ],
        price: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('请输入商品价格'))
              } else if (!/^-?\d*\.?\d*$/.test(value)){
                callback(new Error('请输入数字'))
              } else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
                callback(new Error('最多有两位小数点'))
              } else {
                callback();
              }
            },
            trigger: 'blur' }
        ],
        categoryId: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value && value !== 0) {
                callback(new Error('请选择商品类型'))
              } else {
                callback();
              }
            },
            trigger: 'change' }
        ],
        imgURL: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value && value !== 0) {
                callback(new Error('请上传商品主图'))
              } else {
                callback();
              }
            },
            trigger: 'blur' }
        ],
        amount: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('请输入商品库存'))
              } else if (!/^[1-9]\d*|0$/.test(value)){
                callback(new Error('库存只能是不小于0的整数'))
              } else {
                callback();
              }
            },
            trigger: 'blur' }
        ],
        totalNum: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('请输入总量'))
              } else if (!/^[1-9]\d*|0$/.test(value)) {
                 callback(new Error('总量必须是不小于0的整数'))
              } else {
                callback()
              }
            }
          }
        ],
        singleNum: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('请输入配送数量'))
              } else if (!/^[1-9]\d*|0$/.test(value)) {
                 callback(new Error('配送数量必须是不小于0的整数'))
              } else {
                callback()
              }
            }
          }
        ]
      },
      specItem: {
        attributeName: '',
        amount: '',
        value: '',
        price: ''
      },
      specList: [],
      cropper: {},
      isLoading: false,
      activeGoods: {},
      typeData: []
    }
  },
  computed: {
    addPicAdress () {
      return API_UPLOADPIC
    }
  },
  methods: {
    // 获取商品类型
    async getGoodsType () {
      const res = await ApiGetGoodsCategory()
      if (res.errorCode > 0) {
        let category = this.dealTheGoodType(res.data)
        this.typeData = category
      }
    },
    // 处理商品类型数据
    dealTheGoodType (arr) {
      let tempArr = []
      for (let i of arr) {
        const obj = {
          label: i.categoryName,
          value: i.id
        }
        if (i.categories) {
          obj.children = this.dealTheGoodType(i.categories)
        }
        tempArr.push(obj)
      }
      return tempArr
    },
    // 提交新增产品
    submitProdInfo () {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.isLoading = true
          const data = {}
          for (var i in this.formData) {
            if (i === 'amount' || i === 'price' || i === 'lowest_discountPrice') {
              data[i] = +this.formData[i]
            } else if (i === 'categoryId') {
              data[i] = this.formData[i][this.formData[i].length - 1]
            } else {
              data[i] = this.formData[i]
            }
          }
          data['imgURL'] = this.formData.imgURL.join(',')
          data.enterpriseId = this.userInfo.id
          data.goodsAttributeList = this.specList
          if (data.goodsAttributeList.length > 0) {
            for (let j of data.goodsAttributeList) {
              j.amount = +j.amount
              j.price = j.price ? +j.price : +data.price
            }
          }
          data.contents = tinymce.get('tinymceEditer').getContent()
          if (this.userInfo.parentid === 0) {
            data.state = 4
          } else {
            data.state = 0
          }
          if (this.$route.query.goodsEvents === 'edit') {
            data.id = this.activeGoods.id
            var res = await ApiUpdateGoods(data)
          } else {
            var res = await ApiGetAddGoods(data)
          }
          this.isLoading = false
          this.$Message.success(res.msg)
          if (res.errorCode > 0) {
            this.$router.push({name: 'goods'})
          }
        }
      })
    },
    //tinymce Init
    init () {
      this.$nextTick(() => {
        let vm = this
        tinymce.init({
          selector: '#tinymceEditer',
          branding: false,
          elementpath: false,
          min_height: 600,
          resize: true,
          language: 'zh_CN',
          menubar: 'edit insert view format table tools',
          plugins: [
            'advlist autolink lists link image charmap print preview hr anchor pagebreak imagetools',
            'searchreplace visualblocks visualchars fullpage',
            'insertdatetime media nonbreaking save table contextmenu directionality',
            'paste textcolor colorpicker textpattern imagetools'
          ],
          toolbar1: ' newnote print preview | undo redo | insert | styleselect | forecolor backcolor bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media',
          autosave_interval: '20s',
          image_advtab: true,
          table_default_styles: {
            width: '100%',
            borderCollapse: 'collapse'
          },
          convert_urls: true,
          relative_urls: false,
          remove_script_host: false,
          images_upload_url: this.actionTarget,
          images_upload_handler: async function (blobInfo, success, failure) {
            const fileTypes = ['jpg', 'jpeg', 'png', 'bmp']
            for (let i of fileTypes) {
              if (blobInfo.filename().indexOf(i) > -1) {
                let formData = new FormData()
                formData.append('image', blobInfo.blob(), blobInfo.filename())
                formData.append('imgType', 'shop')
                try {
                  const res = await ApiUploadPic(formData)
                  if (res.errorCode > -1) {
                    success(vm.utils.handleImgPrefix(res.imgPath))
                  } else {
                    failure(res.msg)
                  }
                } catch (error) {
                  failure('上传失败')
                  throw new Error(error)
                }
                return
              }
            }
            failure('上传图片格式有误,请上传jpg/jpeg/png/bmp格式的图片')
          },
          setup: function (editor) {
            editor.on('init', function (e) {
              vm.spinShow = false
              if (localStorage.editorContent) {
                tinymce.get('tinymceEditer').setContent(localStorage.editorContent)
              }
            })
            editor.on('keydown', function (e) {
              localStorage.editorContent = tinymce.get('tinymceEditer').getContent()
              /* const ifr = document.getElementById('tinymceEditer_ifr')
              const contentHeight = ifr.style.height.split('px')[0]
              const bodyHeight = ifr.contentDocument.body.offsetHeight
              if (bodyHeight > +contentHeight) {
                ifr.style.height = `${bodyHeight + 80}px`
              } */
            })
          }
        })
      })
    },
    // 增加规格
    handleAddSpec () {
      this.specList = [...this.specList, {
      }]
    },
    // 删除规格
    handleRemoveSpec (index) {
      this.specList = [
        ...this.specList.slice(0, index),
        ...this.specList.slice(index + 1)
      ]
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
          this.cropper.replace(this.utils.handleImgPrefix(res.imgPath))
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
              width: 200,
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
        this.formData.imgURL = [...this.formData.imgURL, res.data]
        this.$nextTick(() => {
          this.$Message.success('裁剪完成')
        })
      }
    },
    // 删除主图
    handleDeleteImg (index) {
      this.$Modal.confirm({
        title: '删除确认',
        content: '确认删除该主图吗？',
        onOk: () => {
          this.formData.imgURL = [...this.formData.imgURL.slice(0, index), ...this.formData.imgURL.slice(index + 1)]
        }
      })
    },
    // 修改时初始数据渲染
    setOriginInfo () {
      if (this.$route.query.goodsEvents === 'edit') {
        this.activeGoods = JSON.parse(sessionStorage.getItem('activeGoods'))
        for (var i in this.formData) {
          if (i === 'imgURL') {
            this.$set(this.formData, i, this.activeGoods[i].split(','))
          } else if (i === 'contents') {
            tinymce.get('tinymceEditer').setContent(this.activeGoods[i])
          } else if (i === 'categoryId') {
            this.$set(this.formData, i, this.findCategory(this.activeGoods[i]))
          } else {
            this.$set(this.formData, i, this.activeGoods[i])
          }
        }
        let array = []
        for (let o of this.activeGoods['goodsAttributeList']) {
          array = [...array, o]
        }
        this.specList = array
      }
    },
    parseFloat (val) {
      return parseFloat(val)
    },
    // 查询商品类型数组
    findCategory (id) {
      for (let i of this.typeData) {
        if (i.value === id) {
          return [i.value]
        } else if (i.children) {
          for (let j of i.children) {
            if (j.value === id) {
              return [i.value, j.value]
            }
          }
        }
      }
      return []
    }
  },
  created () {
    this.init()
  },
  async mounted () {
    await this.getGoodsType()
    this.$nextTick(() => {
      this.setOriginInfo()
    })
  },
  destroyed () {
    localStorage.removeItem('editorContent')
    tinymce.get('tinymceEditer').destroy()
  }
}
</script>
