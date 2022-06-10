// pages/mine/mine.js

var app = getApp()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    haveLoggedIn: null,
    uid: null,
    user_info: null
  },

  myOrder: function(){
    wx.navigateTo({
      url: '../order/order'
    })
  },

  Test: function(){
    wx.navigateTo({
      url: '../test/test'
    })
  },

  userLogin: function(){
    wx.navigateTo({
      url: '../userLogin/userLogin'
    })
  },

  myInfoShow: function(){
    wx.navigateTo({
      url: '../userInfo/userInfo',
    })
  },

  subOrder: function(){
    wx.navigateTo({
      url: '../subordinateOrder/subordinateOrder',
    })
  },

  codeTest: function(){
    wx.navigateTo({
      url: '../codetest/codetest',
    })
  },

  manageSub: function(){
    wx.navigateTo({
      url: '../manageSubordinate/manageSubordinate',
    })
  },

  // signUp: function(){
  //   wx.navigateTo({
  //     url: '../invitationCode/invitationCode',
  //   })
  // },

  // logIn: function(){
  //   var that = this;
  //   var openid = this.data.openid

  //   wx.getUserProfile({
  //     desc: '用于登录与展示'
  //   }).then(res => {
  //     let user = res.userInfo

  //     // 查找用户
  //     db.collection('user_info').where({
  //       // openid的方式待修改
  //       // _openid: res.userInfo._openid
  //       _openid: openid,
  //       bind_status: true
  //       // _openid: '0'
  //     }).get()
  //     .then(res => {
  //       if(res.data.length == 0){
  //         wx.showModal({
  //           title: '提示',
  //           content: '用户不存在，是否注册',
  //           success: function(res){
  //             if(res.confirm){
  //               wx.navigateTo({
  //                 url: '../invitationCode/invitationCode',
  //               })
  //             }
  //             else if(res.cancel){
  //               return
  //             }
  //           }
  //         })
  //       }  
  //       else{
  //         var uid = res.data[0].uid
  //         that.setData({
  //           uid: uid,
  //           haveLoggedIn: true
  //         })
  //         app.globalData.uId = uid
  //         app.globalData.haveLoggedIn = true
  //         wx.showToast({
  //           title: '登陆成功',
  //           icon: 'success',
  //           duration: 2000
  //         }).then(res => {
  //           setTimeout(function(){
  //             wx.switchTab({
  //               url: '../index/index',
  //             })
  //           }, 2000)
  //         })
  //       }
  //     })
  // })
  // },

  logOut: function(){
    app.globalData.haveLoggedIn = false
    app.globalData.uId = null
    this.onShow()
  },

  accountLogIn: function(){
    wx.navigateTo({
      url: '../accountLogIn/accountLogIn',
    })
  },

  toShippingAddress: function(){
    wx.navigateTo({
      url: '../manageShippingAddress/manageShippingAddress?type=0',
    })
  },

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
    var that = this
    var openid = app.globalData.openId
    var status = app.globalData.haveLoggedIn
    var uid = app.globalData.uId
    this.setData({
      openid: openid,
      haveLoggedIn: status,
      uid: uid
    })

    if(uid != null){
      db.collection('user_info').where({
        uid: uid
      }).get().then(res => {
        let user_info = res.data[0]
        that.setData({
          user_info: user_info
        })
      })
    }
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