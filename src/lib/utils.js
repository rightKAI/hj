const QRCode = require('./qrcode')
const utils = {}

/**
 * 格式化时间
 * @param {Number} timestamp 时间戳
 * @param {String} format 格式化样式
 */
utils.timeFormat = function (time, format = 'yyyy-MM-dd') {
  if (typeof time === 'number') {
    var theTime = typeof(time) === 'object'
    ? time
    : new Date(time)
    var _year = theTime.getFullYear();
    format = format.replace('yyyy', _year);
    var _month = theTime.getMonth() + 1;
    format = format.replace('MM', _month < 10
    ? '0' + _month
    : _month);
    var _day = theTime.getDate();
    format = format.replace('dd', _day < 10
    ? '0' + _day
    : _day);
    var _hour = theTime.getHours();
    format = format.replace('HH', _hour < 10
    ? '0' + _hour
    : _hour);
    var _minute = theTime.getMinutes();
    format = format.replace('mm', _minute < 10
    ? '0' + _minute
    : _minute);
    var _second = theTime.getSeconds();
    format = format.replace('ss', _second < 10
    ? '0' + _second
    : _second);
    return format
  } else {
    return false
  }
},

/**
 * 滚动动画scrollTo
 * @param {Element} el DOM节点
 * @param {Number} y scrollTop
 */
utils.scrollTo = function (el, y = 0) {
  if (y < 0) {
    throw Error('y must greater than 0')
  }
  const yD = el.scrollTop - y
  if (yD === 0 || yD === 1) {
    return
  } else {
    const targetY = Math.round(yD / 1.5)
    const timer = setTimeout(() => {
      el.scrollTop = targetY
      this.scrollTo(el, y)
      clearTimeout(timer)
    }, 20)
  }
}

/**
 * 图片地址处理
 * @param {String} imgUrl 图片地址
 */
utils.handleImgPrefix = function (imgUrl) {
  if (!imgUrl) return
  const protocol = location.protocol
  let _splitImg = imgUrl.split('/')
  _splitImg.shift()
  return protocol + '//' + location.host + '/' + _splitImg.join('/')
}

/**
 * 生成二维码
 */
utils.qrcode = (id, url, size = 120) => {
  var qrcode = new QRCode(id, {
    text: url,
    width: size,
    height: size,
    colorDark: '#000',
    colorLight: '#fff',
    correctLevel: QRCode.CorrectLevel.H
  })
}

/**
 * 数组排序
 * @param {Array} arr 数组
 * @param {Number} newIndex 新位置
 * @param {Number} oldIndex 旧位置
 */
utils.arraySort = (arr, newIndex, oldIndex) => {
  let tempArr = [...arr]
  const target = tempArr.splice(oldIndex, 1)
  tempArr.splice(newIndex, 0, target[0])
  return tempArr
}

export default utils
