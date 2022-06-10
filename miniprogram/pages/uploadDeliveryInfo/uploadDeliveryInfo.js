// pages/uploadDeliveryInfo/uploadDeliveryInfo.js
import WeCropper from '../../components/we-cropper/we-cropper';	

const device = wx.getSystemInfoSync() // 获取设备信息
const width = device.windowWidth // 示例为一个与屏幕等宽的正方形裁剪框
const height = width;
var app = getApp();
const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cropperOpt: {
      id: 'cropper', // 用于手势操作的canvas组件标识符
      targetId: 'targetCropper', // 用于用于生成截图的canvas组件标识符
      pixelRatio: device.pixelRatio, // 传入设备像素比
      width,  // 画布宽度
      height, // 画布高度
      scale: 2.5, // 最大缩放倍数
      zoom: 8, // 缩放系数
      cut: {
        x: (width - 200) / 2, // 裁剪框x轴起点
        y: (width - 200) / 2, // 裁剪框y轴期起点
        width: 200, // 裁剪框宽度
        height: 200 // 裁剪框高度
      }
    },
    is_img: false,
    imgPath: '',
    img_text: [],
    delivery_id: '',
    oid: null
  },

  chooseText: function(e){
    var id = Number(e.currentTarget.dataset.id)
    this.setData({
      delivery_id: this.data.img_text[id].text
    })
  },

  printedText(tempFileURL){
    var that = this
    that.setData({
      imgPath: tempFileURL
    })
    // console.log(that.data.imgPath)
    wx.cloud.callFunction({
      name:"ocrPrintedText",
      data:{
        type:"photo",
        // imgUrl: encodeURI("https://img.alicdn.com/imgextra/i4/52451301/O1CN01iroZe71LTu1l0WFWH_!!0-saturn_solar.jpg_468x468q75.jpg_.webp")
        imgUrl: encodeURI(tempFileURL)
      },
      success:function(res){
        let result = res.result.items
        that.setData({
          img_text: result
        })
        console.log(result)
      },
      fail:function(e){
        console.log(e)
      }
    })
  },

  uploadTap () {
    const self = this
    var that = this
    //点击上传图片按钮后获取图片地址，并通过pushOrign方法载入图片
    wx.chooseImage({
      count: 1, // 默认9
      // 可以指定是原图还是压缩图，默认二者都有
      sizeType: ['original', 'compressed'], 
      // 可以指定来源是相册还是相机，默认二者都有
      sourceType: ['album', 'camera'], 
      success (res) {
        const src = res.tempFilePaths[0];
        self.cropper.pushOrign(src)
        that.setData({
          is_img: true
        })
      }
    })
  },
  
  
  //缩放调整画布中的图片直到满意的状态，点击生成图片按钮，导出图片
  getCropperImage () {
    var that = this
    this.wecropper.getCropperImage((tempFilePath) => {
      // tempFilePath 为裁剪后的图片临时路径
      if (tempFilePath) {
        wx.cloud.uploadFile({
          cloudPath: 'delivery_photo/' + that.data.oid + '.jpg', // 上传至云端的路径
          filePath: tempFilePath, // 小程序临时文件路径

          // success: res => {
          //   // 返回文件 ID
          //   console.log(res.fileID)
          // },
          // fail: console.error
        }).then(res => {
          console.log(res)
          wx.cloud.getTempFileURL({
            fileList: [{
              fileID: 'cloud://cloud1-4gsx799hc2645fc8.636c-cloud1-4gsx799hc2645fc8-1307835410/delivery_photo/' + that.data.oid + '.jpg',
              // maxAge: 60 * 60, // one hour
            }]
          }).then(res => {
            let url_time = res.fileList[0].tempFileURL+'?'+(new Date().valueOf())
            // get temp file URL
            wx.previewImage({
              current: '',
              urls: [url_time]
            });

            that.printedText(url_time)
          }).catch(error => {
            // handle error
          })
        })
        //这个地方我们就可以拿到切割后的图片来做相应的操作了
      } else {
        console.log('获取图片地址失败，请稍后重试')
      }
    })
  },

  touchStart (e) {
    this.cropper.touchStart(e)
  },
  touchMove (e) {
    this.cropper.touchMove(e)
  },
  touchEnd (e) {
    this.cropper.touchEnd(e)
  },

  setDeliveryId: function(e) {
    this.setData({
      delivery_id: e.detail.value
    })
  },

  comfirmDelivery: function(){
    let oid = this.data.oid
    let delivery_id = this.data.delivery_id
    db.collection('order').where({
      oid: oid
    }).update({
      data: {
        delivery_id: delivery_id
      }
    }).then(res => {
      wx.showToast({
        title: '上传成功',
        icon: 'success',
        duration: 2000
      }).then(res => {
        setTimeout(function(){
          wx.navigateBack({
            delta: 1,
          })
        }, 2000)
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var oid = Number(options.oid)
    var that = this

    this.setData({
      oid: oid
    })

    db.collection('order').where({
      oid: oid
    }).get().then(res => {
      let delivery_id = res.data[0].delivery_id
      that.setData({
        delivery_id: delivery_id
      })
    })

    const { cropperOpt } = this.data

  //   this.createSelectorQuery().select(`#${cropperOpt.id}`).fields({ node: true, size: true }).exec((res) => {
  //     const canvas = res[0].node
  //     const ctx = canvas.getContext('2d')

  //     const dpr = wx.getSystemInfoSync().pixelRatio
  //     canvas.width = res[0].width * dpr
  //     canvas.height = res[0].height * dpr
  //     ctx.scale(dpr, dpr)
  //     cropperOpt.canvas = canvas
  //     cropperOpt.ctx = ctx

  //     this.cropper = new WeCropper(cropperOpt)
  //     .on('ready', (ctx) => {
  //         console.log(`wecropper is ready for work!`)
  //     })
  //     .on('beforeImageLoad', (ctx) => {
  //         wx.showToast({
  //             title: '上传中',
  //             icon: 'loading',
  //             duration: 20000
  //         })
  //     })
  //     .on('imageLoad', (ctx) => {
  //         wx.hideToast()
  //     })
  // })

    this.cropper = new WeCropper(cropperOpt)
        .on('ready', (ctx) => {
            console.log(`wecropper is ready for work!`)
        })
        .on('beforeImageLoad', (ctx) => {
            wx.showToast({
                title: '上传中',
                icon: 'loading',
                duration: 20000
            })
        })
        .on('imageLoad', (ctx) => {
            wx.hideToast()
        })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})