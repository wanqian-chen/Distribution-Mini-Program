// pages/manageShippingAddress/manageShippingAddress.js

const db = wx.cloud.database()
var app = getApp()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    uid: null,
    user_openid: null,
    haveLoggedIn: null,
    shipping_address: [],
    type: null,
    now_address_index: null
  },

  setAddressInfo: function(uid){
    var that = this
    db.collection('user_info').where({
      uid: uid
    }).get().then(res => {
      let address = res.data[0].shipping_address
      if(address.length != 0){
        that.setData({
          shipping_address: address
        })
      }
    })
  },

  addAddress: function(id){
    var uid = String(this.data.uid)
    wx.navigateTo({
      url: '../uploadShippingAddress/uploadShippingAddress?type=upload&uid=' + uid,
    })
  },

  modifyAddress: function(e){
    var index = String(e.currentTarget.dataset.addressid)
    var uid = String(this.data.uid)
    wx.navigateTo({
      url: '../uploadShippingAddress/uploadShippingAddress?type=modify&uid=' + uid + '&index=' + index,
    })
  },

  selectAddress:function(e) {
    // let addressId = e.currentTarget.dataset.addressid
    // wx.setStorageSync('addressId', addressId);
    // wx.navigateBack();
    let pages = getCurrentPages()  //获取当前页面栈的信息
    let prevPage = pages[pages.length - 2]   //获取上一个页面
    prevPage.setData({   //把需要回传的值保存到上一个页面
      now_address_index: e.currentTarget.dataset.addressid
    });
    wx.navigateBack({   //然后返回上一个页面
      delta: 1
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let type = Number(options.type);
    if(type == 1){
      let index = Number(options.now_address_index)
      this.setData({
        now_address_index: index
      })
      console.log(options.now_address_index)
    }
    this.setData({
      type: type
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
    var openid = app.globalData.openId
    var status = app.globalData.haveLoggedIn
    var uid = app.globalData.uId
    var that = this
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
      that.setData({
        user_openid: openid,
        haveLoggedIn: status,
        uid: uid
      })
      that.setAddressInfo(uid)
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