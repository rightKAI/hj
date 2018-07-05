// 所有接口写在这个文件
// 导出接口,使用全大写命名
// 接口命名统一Api为开头,驼峰式命名

import Axios from 'axios'
const qs = require('qs')
export const env = process.env.NODE_ENV
// 测试服务器不要加pdshop
Axios.defaults.baseURL = env === 'development' ? '/api/pdShop' : '/pdShop'
// Axios.defaults.baseURL = env === 'development' ? '/api' : '/pdShop'
Axios.interceptors.response.use((response) => {
  // console.log(response)
  if (response.status === 200 || response.status === 304) {
    return response.data
  } else if (response.status === 400) {
    return response.statusText
  } else {
    console.error(response)
    return false
  }
})

export default Axios

// 示例
export const EXAMPLE = '/example.json'
/**
 * 示例
 * @param {Any[]} params 接口携带参数
 */
export const ApiExample = async (params) => {
  try {
    const res = await Axios.post(EXAMPLE, qs.stringify(params))
    return res
  } catch (error) {
    throw new Error(error)
  }
}

// 上传图片
export const UPLOADPIC = '/addPictures.json'
export const API_UPLOADPIC = env === 'development' ? `/api${UPLOADPIC}` : `/pdShop${UPLOADPIC}`

export const ApiUploadPic = async (data) => {
  try {
    let config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
    const res = await Axios.post(UPLOADPIC, data, config)
    return res
  } catch (error) {
    console.error('上传图片失败')
    throw new Error(error)
  }
}

// 裁剪图片
export const TAILORIMAGE = '/tailorImages.json'
/**
 * 裁剪图片接口
 * @param {String} image 裁剪图片路径
 * @param {String} imgType 图片存放目录
 * @param {Object} size 裁剪位置与大小 x,y,w,h
 */
export const ApiTailorImage = async (image, imgType, size) => {
  try {
    const data = {
      image,
      imgType,
      x: size.x,
      y: size.y,
      w: size.w,
      h: size.h
    }
    const res = await Axios.post(TAILORIMAGE, qs.stringify(data))
    return res
  } catch (error) {
    throw new Error(error)
  }
}

// 登录接口
export const GETLOGIN = '/loginEnterprise.json'
/**
 * 获取登录接口
 * @param {Number} phone 号码
 * @param {string} passwd 密码
 */
export const ApiGetLogin = async (phone, passwd) => {
  try {
    const res = await Axios.post(GETLOGIN, qs.stringify({
      phone,
      passwd
    }))
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 新增子商城接口
export const GETADDCHILDREN = '/saveEnterpriseParent.json'
/**
 * 获取新增子商城接口
 * @param {Any} data
 */
export const ApiGetAddChildren = async (data) => {
  try {
    const res = await Axios.post(GETADDCHILDREN, qs.stringify(data))
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 检验邮箱是否存在
export const GETACCOUNTISEXIST = '/getAccountIsExist.json'
/**
 * 获取检验邮箱是否存在
 * @param {String} account 邮箱
 */
export const ApiGetAccountIsExist = async (account) => {
  try {
    const res = await Axios.post(GETACCOUNTISEXIST, qs.stringify({account}))
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 检验手机号码是否存在
export const GETPHONEISEXIST = '/getPhoneIsExist.json'
/**
 * 获取手机号码是否存在
 * @param {Number} phone 手机号码
 */
export const ApiGetPhoneIsExist = async (phone) => {
  try {
    const res = await Axios.post(GETPHONEISEXIST, qs.stringify({phone}))
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 删除子商户
export const GETDELETECHILDREN = '/deleteEnterpriseById.json'
/**
 * 获取手机号码是否存在
 * @param {Number} uid 商家Id
 */
export const ApiGetDeleteChildren = async (uid) => {
  try {
    const res = await Axios.post(GETDELETECHILDREN, qs.stringify({uid}))
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 编辑子商户信息
export const GETEDITCHILDREN = '/updateEnterprise.json'
/**
 * 获取手机号码是否存在
 * @param {Any} data 商家Id
 */
export const ApiGetEditChildren = async (data) => {
  try {
    const res = await Axios.post(GETEDITCHILDREN, qs.stringify(data))
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 获取商品列表
export const FINDGOODS = '/findGoods.json'
/**
 * 查询商品 - 可模糊查询
 * @param {Any} data json
 */
export const ApiFindGoods = async (data, page, num) => {
  try {
    const res = await Axios.post(FINDGOODS, data, {})
    return res
  } catch (error) {
    throw new Error(error)
  }
}

// 新增商品
export const GETADDGOODS = '/addGoods.json'
/**
 * 获取新增商品
 * @param {Any} data
 * @param {Any} para
 */
export const ApiGetAddGoods = async (data, para = {}) => {
  try {
    const res = await Axios.post(GETADDGOODS, data, {params: para})
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 更新总公司商品
export const COPYGOODS = '/copyGoods.json'
/**
 * 更新总公司商品到子公司
 * @param {Any} data 数据
 * @param {Any} config Axios配置
 */
export const ApiCopyGoods = async (data, config = {}) => {
  try {
    const res = Axios.post(COPYGOODS, qs.stringify(data), config)
    return res
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * 获取修改商品
 * @param {Any} data
 * @param {Any} para
 */
export const ApiUpdateGoods = async (data, para) => {
  let GETUPDATEGOODS = '/updateGoods.json'
  try {
    const res = await Axios.post(GETUPDATEGOODS, data, {params: para})
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 删除商品
export const GETDELETEFOODS = '/deleteGoods.json'
/**
 * 删除商品
 * @param {Any} data
 * @param {Any} para
 */
export const ApiDeleteGoods = async (data, para) => {
  try {
    const res = await Axios.post(GETDELETEFOODS, data, {params: para})
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 获取商品类型
export const GETGOODSCATEGORY = '/findGoodsCategory.json'
/**
 * 获取商品类型
 */
export const ApiGetGoodsCategory = async () => {
  try {
    const res = await Axios.post(GETGOODSCATEGORY)
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 获取商家订单
export const GETORDERLISTBYEID = '/getOederListByEid.json'
/**
 * 获取商家订单
 * @param {Any} data
 */
export const ApiGetOrderList = async (data) => {
  try {
    const res = await Axios.post(GETORDERLISTBYEID, qs.stringify(data))
    console.log(res.data[0].createtime)
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 获取配送单列表
export const GETDISTRIBUTIONBYEID = '/queryEnterpriceDistributions.json'
/**
 * 获取配送单列表
 * @param {Any} data
 */
export const ApiGetDistributionByEid = async (data) => {
  try {
    const res = await Axios.post(GETDISTRIBUTIONBYEID, qs.stringify(data))
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 获取子商户商品列表
export const GETAUDITINGLIST = '/getAuditingList.json'
/**
 * 获取子商户商品列表
 * @param {Any} data
 */
export const ApiGetAuditingList = async (data) => {
  try {
    const res = await Axios.post(GETAUDITINGLIST, qs.stringify(data))
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 更改子商户商品审核状态
export const GETUPDATEGOODSSTATE = '/updateGoodsState.json'
/**
 * 更改子商户商品审核状态
 * @param {Any} data
 */
export const ApiUpdateGoodsState = async (data) => {
  try {
    const res = await Axios.post(GETUPDATEGOODSSTATE, qs.stringify(data))
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 获取物流公司列表
export const GETALICLOUDTYPE = '/getAlicloudType.json'

export const ApiGetAlicloudType = async () => {
  try {
    const res = await Axios.post(GETALICLOUDTYPE)
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 查询物流信息
export const GETALICLOUDAPI = '/getAlicloudapi.json'
/**
 * 查询物流信息
 * @param {String} number 物流码
 */
export const ApiGetAlicloudapi = async (number) => {
  try {
    const res = await Axios.post(GETALICLOUDAPI, qs.stringify(number))
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 导出订单
export const GETEXPORT = '/export.json'
/**
 * 导出订单
 * @param {Any} data
 */
export const ApiExport = async (data) => {
  try {
    const url = (env === 'development' ? '/api' + GETEXPORT : '/pdShop' + GETEXPORT) + '?' + qs.stringify(data)
    window.open(url)
    return true
  } catch (err) {
    throw new Error(err)
  }
}

// 导入订单
export const GETCREATEDISTRIBUTION = '/createDistribution.json'
export const API_GETCREATEDISTRIBUTION = (env === 'development' ? '/api' + GETCREATEDISTRIBUTION : '/pdShop' + GETCREATEDISTRIBUTION)
/**
 * 导入订单
 * @param {Any} data
 * @param {Any} para
 */
export const ApiCreateDistribution = async (data, para) => {
  try {
    const res = await Axios.post(GETCREATEDISTRIBUTION, data, {params: para})
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 配送接口
export const GETADDDISTRIBUTIONS = '/addDistributions.json'
/**
 * 配送接口
 * @param {Any} data
 */
export const ApiAddDistributions = async (data) => {
  try {
    const res = await Axios.post(GETADDDISTRIBUTIONS, qs.stringify(data))
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 上传单个配送单信息
export const GETUPDATEDISTRIBUTIONS = '/updateDistributions.json'
/**
 * 上传单个配送单信息
 * @param {Any} data
 * @param {Any} para
 */
export const ApiUpdateDistributions = async (data, para) => {
  try {
    const res = await Axios.post(GETUPDATEDISTRIBUTIONS, data, {params: para})
    return res
  } catch (err) {
    throw new Error(err)
  }
}
// 上传礼品卡配送单信息
export const GETUPDATEGIFTLOGISTICS = '/updateGiftLogistics.json'
/**
 * 上传单个配送单信息
 * @param {Any} data
 * @param {Any} para
 */
export const ApiUpdateGiftLogistics = async (data) => {
  try {
    const res = await Axios.post(GETUPDATEGIFTLOGISTICS, data)
    return res
  } catch (err) {
    throw new Error(err)
  }
}
// 订单详情
export const GETQUERYDISTRIBUTIONS = '/queryDistributions.json'
/**
 * 订单详情
 * @param {Any} data
 */
export const ApiQueryDistributions = async (data) => {
  try {
    const res = await Axios.post(GETQUERYDISTRIBUTIONS, qs.stringify(data))
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 查询规则列表 (无详情)
export const FINDEBOUNSRULE = '/findEBonusRule.json'
/**
 * 查询规则列表 (无详情)
 * @param {Number} id 商户ID
 */
export const ApiFindEBounsRule = async (id) => {
  try {
    const res = await Axios.post(FINDEBOUNSRULE, qs.stringify({
      enterpriseId: id
    }))
    return res
  } catch (error) {
    throw new Error(error)
  }
}

// 查询规则列表（带详情）
export const FINDBOUNSRULELIST = '/findBonusRuleList.json'
// 新增规则
export const CREATEBOUNSRULE = '/creatBounsRule.json'
/**
 * 新增奖励规则
 * @param {Any} data json
 */
export const ApiCreateBounsRule = async (data) => {
  try {
    const res = await Axios.post(CREATEBOUNSRULE, data)
    return res
  } catch (error) {
    throw new Error(error)
  }
}

// 查询返利规则列表 (带详情)
export const FINDREBATEDETAIL = '/findMemberRuleList.json'

export const ApiFindRebateDetail = async (data) => {
  try {
    const res = await Axios.post(FINDREBATEDETAIL, data, {params: data})
    return res
  } catch (error) {
    throw new Error(error)
  }
}
// 给商品设置返利规则
export const pushShopRebateRules = '/createMemberGoodsRule.json'
/**
 * 新增奖励规则
 * @param {Any} data json
 */
export const ApiPushShopRebateRules = async (data) => {
  try {
    const res = await Axios.post(pushShopRebateRules, data)
    return res
  } catch (error) {
    throw new Error(error)
  }
}

// 查询规则（根据商品ID）
export const FINDBOUNSRULEBYGOODSID = '/findBonusRule.json'
/**
 * 查询规则（根据商品ID）
 * @param {Number} eId 商户id
 * @param {Number} id 商品id
 */
export const ApiFindRuleByGoodsId = async (eId, id) => {
  try {
    const res = await Axios.post(FINDBOUNSRULEBYGOODSID, qs.stringify({
      enterpriseId: eId,
      goodsId: id
    }))
    return res
  } catch (error) {
    throw new Error(error)
  }
}

// 修改奖励规则
export const UPDATEBOUNSRULE = '/updateBounsRule.json'
/**
 * 修改奖励规则
 * @param {Any} data json
 */
export const ApiUpdateBounsRule = async (data) => {
  try {
    const res = await Axios.post(UPDATEBOUNSRULE, data)
    return res
  } catch (error) {
    throw new Error(error)
  }
}

// 删除奖励规则
export const DELETEBOUNSRULE = '/deleteBonusRule.json'
/**
 * 删除奖励规则
 * @param {Number} id 规则id
 */
export const ApiDeleteRule = async (id) => {
  try {
    const res = await Axios.post(DELETEBOUNSRULE, qs.stringify({
      id
    }))
    return res
  } catch (error) {
    throw new Error(error)
  }
}

// 查询单品奖励列表
export const FINDGOODSRULERELATIONLIST = '/findGoodsRuleRelationList.json'

// 新增单品奖励
export const CREATEBOUNSRULERELATION = '/creatBounsRuleRelation.json'
/**
 * 新增单品奖励
 * @param {Any} data json
 */
export const ApiCreateBounsRuleRelation = async (data) => {
  try {
    const res = await Axios.post(CREATEBOUNSRULERELATION, data)
    return res
  } catch (error) {
    console.error(error)
    return null
  }
}

// 设置商品返利规则
export const SETSHOPREBATERULES = '/createMemberGoodsRule.json'
/**
 * 设置商品返利规则
 * @param {Any} data json
 */
export const ApiSetShopRebateRules = async (data) => {
  try {
    const res = await Axios.post(SETSHOPREBATERULES, data)
    return res
  } catch (error) {
    console.error(error)
    return null
  }
}

// 删除单品奖励
export const DELETEBOUNSREWARD = '/deleteGoodsRuleRelation.json'
/**
 * 删除单品奖励
 * @param {Number} id 单品奖励id
 */
export const ApiDeleteReward = async (id) => {
  try {
    const res = await Axios.post(DELETEBOUNSREWARD, qs.stringify({
      id
    }))
    return res
  } catch (error) {
    throw new Error(error)
  }
}

// 获取授权码
export const GETCREATECODE = '/createCode.json'
/**
 * 订单详情
 * @param {Any} data
 */
export const ApiCreateCode = async (data) => {
  try {
    const res = await Axios.post(GETCREATECODE, qs.stringify(data))
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 获取商家渠道列表
export const GETFINDPERSONNEL = '/findPersonnel.json'
/**
 * 获取商家渠道列表
 * @param {Any} data
 */
export const ApiFindPersonnel = async (data) => {
  try {
    const res = await Axios.post(GETFINDPERSONNEL, qs.stringify(data))
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 删除选定人员
export const GETDELETECHANNEL = '/deleteChannel.json'
/**
 * 删除选定人员
 * @param {Any} data
 */
export const ApiDeleteChannel = async (data) => {
  try {
    const res = await Axios.post(GETDELETECHANNEL, qs.stringify(data))
    return res
  } catch (err) {
    throw new Error(err)
  }
}



// 替换选定人员
export const GETREPLACEPERSONNEL = '/replacePersonnel.json'
/**
 * 替换选定人员
 * @param {Any} data
 */
export const ApiReplacePersonnel = async (enterpriseid, newOpenId, oldOpenId) => {
  try {
    const res = await Axios.post(GETREPLACEPERSONNEL, qs.stringify({
      enterpriseid,
      newOpenId,
      oldOpenId
    }))
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 查询banner列表
export const GETBANNERLIST = '/findBannerList.json'
/**
 * 查询banner列表
 * @param {Any} data
 */
export const ApiGetBannerList = async (data) => {
  try {
    const res = await Axios.post(GETBANNERLIST, qs.stringify(data))
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 新增Banner接口
export const GETADDBANNER = '/addBanner.json'
/**
 * 新增Banner接口
 * @param {Any} data
 */
export const ApiAddBanner = async (data, para) => {
  try {
    const res = await Axios.post(GETADDBANNER, data, {params: para})
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 修改Banner接口
export const GETUPDATEBANNER = '/updateBanner.json'
/**
 * 修改Banner接口
 * @param {Any} data
 */
export const ApiUpdateBanner = async (data, para) => {
  try {
    const res = await Axios.post(GETUPDATEBANNER, data, {params: para})
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 上传公众号二维码
export const UPLOADQRCODE = '/uploadQRCode.json'
// 上传商户号证书
export const UPLOADWXCERT = '/uploadWxCert.json'
// 上传MP_verify文件
export const UPLOADMPVERIFY = '/uploadWx_MP_verify.json'
// 礼品卡上传电话表
export const UPLOADPHONENO = '/pdShop/importExcel.json'

// 获取微信配置信息
export const GETPDWXCONFIG = '/getPdWxConfig.json'
/**
 * 获取微信配置信息
 * @param {Number | String} eid 商家id
 */
export const ApiGetWxConfig = async (eid) => {
  try {
    const res = await Axios.post(GETPDWXCONFIG, qs.stringify({
      eid
    }), {
      baseURL: env === 'development' ? '/api' : ''
    })
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 创建wxConfig
export const CREATEPDWXCONFIG = '/createPdWxConfig.json'
/**
 * 创建wxConfig - securitycode
 * @param {Object} data 微信配置信息
 */
export const ApiCreatePDWxConfig = async (data) => {
  try {
    const res = await Axios.post(CREATEPDWXCONFIG, qs.stringify(data), {
      baseURL: env === 'development' ? '/api' : ''
    })
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 修改wxConfig - securitycode
export const UPDATEPDWXCONFIG = '/updatePdWxConfig.json'
/**
 * 修改wxConfig - securitycode
 * @param {Object} data 微信配置信息
 */
export const ApiUpdatePDWxConfig = async (data) => {
  try {
    const res = await Axios.post(UPDATEPDWXCONFIG, qs.stringify(data), {
      baseURL: env === 'development' ? '/api' : ''
    })
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 添加wxConfig到商户
export const CREATEENTERPRISECONFIG = '/createEnterpriseConfig.json'
/**
 * 添加wxConfig到商户
 * @param {Number | String} eid 商户id
 * @param {Number | String} cid 微信配置id
 */
export const ApiCreateEnterpriseConfig = async (eid, cid) => {
  try {
    const res = await Axios.post(CREATEENTERPRISECONFIG, qs.stringify({
      eid,
      cid
    }))
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 获取access_token
export const GETACCESSTOKEN = '/getAccessTokenByAppId.json'
/**
 * 验证access_token
 */
export const ApiTestAccessToken = async (appId, appSecret) => {
  try {
    const res = await Axios.post(GETACCESSTOKEN, qs.stringify({
      appId,
      appSecret
    }), {
      baseURL: env === 'development' ? '/api' : ''
    })
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 验证证书是否可用
export const GETISCERT = '/getIsCert.json'
/**
 * 验证证书是否可用
 */
export const ApiGetIsCert = async (filePath, mchId) => {
  try {
    const res = await Axios.post(GETISCERT, qs.stringify({
      file: filePath,
      mchId
    }),{
      baseURL: env === 'development' ? '/api' : ''
    })
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 查询用户管理信息
export const GETUSER = '/getUserListByEid.json'
/**
 * @param {Any} data json
 */
export const ApiGetUser = async (eId, page, num) => {
  try {
    const res = await Axios.post(GETUSER, qs.stringify({
      eId,
      page,
      num
    }))
  } catch (err) {
    throw new Error(err)
  }
}

// 查询公众号菜单
export const FINDWECHATMENU = '/findWechatMenu.json'
/**
 * 查询公众号菜单
 */
export const ApiFindWechatMenu = async (shopId) => {
  try {
    const res = await Axios.post(FINDWECHATMENU, qs.stringify({
      shopId
    }), {
      baseURL: env === 'development' ? '/api' : ''
    })
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 创建公众号菜单
export const CREATEPDWXMENU = '/editorPDMenuLog.json'
/**
 * 创建公众号菜单
 */
export const ApiCreateWxMenu = async (shopId, menuData) => {
  try {
    const res = await Axios.post(CREATEPDWXMENU, menuData, {
      params: { shopId },
      baseURL: env === 'development' ? '/api' : ''
    })
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 查询微信用户
export const GETWXUSER = '/findWxUserByWxConfigVendorId.json'
/**
 * @param {any} data
 */
export const ApiGetWxUser = async (eId, page, num) => {
  try {
    const res = await Axios.post(GETWXUSER, qs.stringify({
      eId,
      page,
      num
    }))
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 设置热销&取消热销
export let SetHotSale = '/getHotGoods.json'
/**
 * @param {any} data
 */
export const ApiSetHotSale = async (id, col) => {
  try {
    const res = await Axios.post(SetHotSale, id, {params: {
      col
    }})
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 上传礼品卡
export let pushGiftCar = '/addGift.json'
/**
 * @param {any} data
 */
export const ApipushGiftCar = async (data) => {
  try {
    const res = await Axios.post(pushGiftCar, data)
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 获取会员列表数据
export let getMemberList = '/showRootPersonnel.json'
/**
 * @param {any} data
 */
export const ApiGetMemberList = async (data) => {
  try {
    const res = await Axios.get(getMemberList, {params: data}, {
      headers: {
        'content-type': 'application/json'
      }
    })
    return res
  } catch (err) {
    throw new Error(err)
  }
}
// 获取会员下级列表数据
export let getMemberChildList = '/seeSubordinate.json'
/**
 * @param {any} data
 */
export const ApiGetMemberChildList = async (data) => {
  try {
    const res = await Axios.get(getMemberChildList, {params: data}, {
      headers: {
        'content-type': 'application/json'
      }
    })
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 获取会员返利数据
export let getRebateRecordList = '/findRebateRecordList.json'
/**
 * @param {any} data
 */
export const ApiGetRebateRecordList = async (postData, data) => {
  try {
    const res = await Axios.post(getRebateRecordList, postData, {params: data}, {
      headers: {
        'content-type': 'application/json'
      }
    })
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 获取会员下级列表数据
export let getMemberBack = '/getBackSuperior.json'
/**
 * @param {any} data
 */
export const ApiGetMemberBack = async (data) => {
  try {
    const res = await Axios.get(getMemberBack, {params: data}, {
      headers: {
        'content-type': 'application/json'
      }
    })
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 新增返利规则
export let NewRebateRules = '/createMemberRule.json'
/**
 * @param {any} data
 */
export const ApiPushNewRebateRules = async (data) => {
  try {
    const res = await Axios.post(NewRebateRules, data, {
      headers: {
        'content-type': 'application/json'
      }
    })
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 修改返利规则
export let amendRebateRules = '/updateMemberRule.json'
/**
 * @param {any} data
 */
export const ApiAmendNewRebateRules = async (data) => {
  try {
    const res = await Axios.post(amendRebateRules, data, {
      headers: {
        'content-type': 'application/json'
      }
    })
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 修改返利规则
export let deleteRebateRules = '/deleteMemberRule.json'
/**
 * @param {any} data
 */
export const ApiDeleteNewRebateRules = async (data) => {
  try {
    const res = await Axios.get(deleteRebateRules, {params: data})
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 查询商家默认返利规则
export let searchDefaultRules = '/findDefaultMemberRule.json'
/**
 * @param {any} data
 */
export const ApiSearchDefaultRules = async (data) => {
  try {
    const res = await Axios.get(searchDefaultRules, {params: data})
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 删除商品返利规则
export let deleteShopRules = '/deleteMemberGoodsRule.json'
/**
 * @param {any} data
 */
export const ApiDeleteShopRules = async (data) => {
  try {
    const res = await Axios.get(deleteShopRules, {params: data})
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 停用商品返利规则
export let blockUpShopRules = '/updateMemberGoodsRule.json'
/**
 * @param {any} data
 */
export const ApiBlockUpShopRules = async (data) => {
  try {
    const res = await Axios.get(blockUpShopRules, {params: data})
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 设置默认商品返利规则
export let setDefaultMemberRule = '/setDefaultMemberRule.json'
/**
 * @param {any} data
 */
export const ApiSetDefaultMemberRule = async (data) => {
  try {
    const res = await Axios.get(setDefaultMemberRule, {params: data})
    return res
  } catch (err) {
    throw new Error(err)
  }
}

// 设置默认商品返利规则
export let getShopRules = '/findRebateRuleDetails.json'
/**
 * @param {any} data
 */
export const ApiGetShopRules = async (data) => {
  try {
    const res = await Axios.get(getShopRules, {params: data})
    return res
  } catch (err) {
    throw new Error(err)
  }
}
