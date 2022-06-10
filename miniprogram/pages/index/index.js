// pages/index/index.js
const app = getApp()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: '',
    uid: null,
    haveLoggedIn: false,
    merchandise_sample: [],
    notice: ["这是一个分销小程序", "欢迎使用", "用户分为生产商和分销商", "请先登录获取更多功能"],
    banner: ["/img/banner/room1.png", "/img/banner/room2.png"]
  },

  getMerchandiseInfo: function(){
    var that = this
    db.collection('merchandise').limit(3).get().then(res => {
      that.setData({
        merchandise_sample: res.data
      })
    })
  },

  goToMer: function(e){
    if(this.data.uid != null){
      var mid = e.currentTarget.dataset.mid
      var that = this
      wx.navigateTo({
        url: '../merchandiseDetail/merchandiseDetail?mid=' + mid + '&uid=' + that.data.uid,
      })
    }
    else{
      wx.showToast({
        title: '请先登录',
        icon: 'error',
        duration: 2000
      })
    }
  },

  startStock: function(){
    if(this.data.uid != null){
      wx.navigateTo({
        url: '../stock/stock',
      })
    }
    else{
      wx.showToast({
        title: '请先登录',
        icon: 'error',
        duration: 2000
      })
    }
  },

  uploadMerchandise: function(){
    wx.navigateTo({
      url: '../uploadMerchandiseInfo/uploadMerchandiseInfo',
    })
  },

  manageMerchandise: function(){
    wx.navigateTo({
      url: '../manageMerchandise/manageMerchandise',
    })
  },

  uploadStrategy: function(){
    wx.navigateTo({
      url: '../uploadStrategyInfo/uploadStrategyInfo',
    })
  },

  manageStrategy: function(){
    wx.navigateTo({
      url: '../manageStrategy/manageStrategy',
    })
  },

  openId: function(){
    wx.navigateTo({
      url: '../getOpenId/index',
    })
  },

  getOpenId: function() {
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: '',
      })
      wx.cloud.callFunction({
        name: 'quickstartFunctions',
        config: {
          // env: this.data.envId
          env: 'cloud1-4gsx799hc2645fc8'
        },
        data: {
          type: 'getOpenId'
        }
      }).then((resp) => {
        this.setData({
          // haveGetOpenId: true,
          openId: resp.result.openid
        })
       wx.hideLoading()
       resolve()
    //  }).catch((e) => {
    //     this.setData({
    //       showUploadTip: true
    //     })
      //  wx.hideLoading()
      })
    })
  },

  getUserId: function(){
    var openid = app.globalData.openId
    var status = app.globalData.haveLoggedIn
    var uid = app.globalData.uId
    this.setData({
      openid: openid,
      haveLoggedIn: status,
      uid: uid
    })
    console.log(uid)
    // var openId = this.data.openId
    // var that = this
    // db.collection('user_info').where({
    //   _openid: openId
    // }).get()
    // .then(res => {
    //   var uid = res.data[0].uid
    //   that.setData({
    //     uid: uid
    //   })
    // })
  },

  uploadDeliveryInfo: function(){
    wx.navigateTo({
      url: '../uploadDeliveryInfo/uploadDeliveryInfo?'
    })
  },

  // refresh: async function(){
  //   await this.getOpenId()
  //   this.getUserId()
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.getMerchandiseInfo()
    // this.refresh()
    this.getUserId()
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