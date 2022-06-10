// pages/userInfo/userInfo.js

const app = getApp();
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    uid: null,
    user_openid: null,
    haveLoggedIn: null,
    user_info: {}
  },

  setUserInfo: function(){
    var that = this
    db.collection('user_info').where({
      uid: that.data.uid
    }).get()
    .then(res => {
      that.setData({
        user_info: res.data[0]
      })
    })
  },

  changeInfo: function(){
    //  传uid：与数据库交互多
    //  传密码：不安全？
    var uid = String(this.data.uid)
    wx.navigateTo({
      // url: '../userInfoChange/userInfoChange?uid=' + uid,
      url: '../userSignUp/userSignUp?uid=' + uid + '&superiorId=existed',
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
    var openid = app.globalData.openId
    var status = app.globalData.haveLoggedIn
    var uid = app.globalData.uId
    if(status == false){
      wx.showToast({
        title: '请先登录',
        icon: 'error',
        duration: 2000
      }).then(res => {
        setTimeout(function(){
          wx.switchTab({
            url: '../mine/mine'
          })
        }, 2000)
      })
    }
    else{
      this.setData({
        user_openid: openid,
        haveLoggedIn: status,
        uid: uid
      })
      this.setUserInfo()
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