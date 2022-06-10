// pages/stock/stock.js

const db = wx.cloud.database()
const _ = db.command
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data:{
    goodsdata: null,
    user_openid: '',
    haveLoggedIn: null,
    uid: null,
    keyword: ''
  },

  setKeyWord: function(e){
    this.setData({
      keyword: e.detail.value
    })
  },

  searchKey: function(){
    this.onShow()
  },

  clearKeyword: function() {
    this.setData({
      keyword: ''
    })
    this.onShow()
  },

  cancelSearch: function(){
    this.setData({
      keyword: ''
    })
    this.onLoad()
  },

  // getOpenid: function(){
  //   let page = this;
  //   wx.cloud.callFunction({
  //     name:'getUserOpenId'
  //   }).then(res => {
  //     var openid = res.result.openid
  //     page.setData({
  //       user_openid: openid
  //     })
  //   })
  // },

  addmer: function(e){
    var mid = e.currentTarget.dataset.id;
    // var openid = this.data.user_openid;
    var cid = this.data.uid //要改
    db.collection('user_cart').where({
      // _openid: openid,
      cid: cid //要改
    })
    .update({
      // 加个判断是否存在cart里
      // 但是好像不在会自动添加
      data: {
        merchandise: {
          [mid]: _.inc(1)
        }
      }
    })
  },

  // btntodetail: function(e){
  //   var mid = e.currentTarget.dataset.id
  //   var uid = this.data.uid
  //   console.log(uid)
  //   var url="/pages/merchandiseDetail/merchandiseDetail"+ "?mid=" + mid + "&uid=" + uid;
  //   wx.navigateTo({
  //     url: url,
  //   })
  // },

  goToCart: function(){
    wx.switchTab({
      url: '../cart/cart',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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

      // 之后需要分批取  https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database/read.html
      var that = this
      db.collection('merchandise').get({
        success: function(res) {
          // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
          // this.data.goodsdata.push(res.data)
          that.setData({
            goodsdata: res.data,
          })
        }
      })
    }
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
    if(this.data.keyword != ''){
      let reg = new RegExp(this.data.keyword, 'i')
      db.collection('merchandise').where({
        title: reg
      }).get()
      .then(res => {
        that.setData({
          goodsdata: res.data,
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