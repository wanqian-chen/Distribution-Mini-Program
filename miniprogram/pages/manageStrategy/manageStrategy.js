// pages/manageStrategy/manageStrategy.js

const db = wx.cloud.database()
const _ = db.command
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    stra_info: []
  },

  uploadStrategy: function(){
    wx.navigateTo({
      url: '../uploadStrategyInfo/uploadStrategyInfo',
    })
  },

  setStrategyInfo: function(){
    var that = this

    db.collection('sale_strategy').get()
    .then(res => {
      let all_stra = res.data
      let all_stra_info = []
      for(let i = 0; i < all_stra.length; i++){
        let stra = {}
        stra['sid'] = all_stra[i].sid
        stra['name'] = all_stra[i].name
        stra['detail'] = JSON.stringify(all_stra[i].strategy)
        all_stra_info.push(stra)
      }
      that.setData({
        stra_info: all_stra_info
      })
    })
  },

  modifyStrategy: function(e){
    var sid = String(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '../uploadStrategyInfo/uploadStrategyInfo?sid=' + sid,
    })
  },

  deleteStrategy: function(e){
    var sid = e.currentTarget.dataset.id
    var set = []

    let set_stra = db.collection('sale_strategy').where({
      sid: sid
    }).remove()
    set.push(set_stra)

    let set_id = db.collection('id_status').where({
      id_name: 'strategy_id'
    }).update({
      data: {
        not_used: _.push(sid)
      }
    })
    set.push(set_id)

    Promise.all(set).then(res => {
      this.setStrategyInfo()
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
      // this.setData({
      //   user_openid: openid,
      //   haveLoggedIn: status,
      //   uid: uid
      // })
      db.collection('user_info').where({
        uid: uid
      }).get().then(res => {
        let identity = res.data[0].identity
        if(identity == 1){
          this.setStrategyInfo()
        }
        else{
          wx.showToast({
            title: '权限不足',
            icon: 'error',
            duration: 2000
          }).then(res => {
            setTimeout(function(){
              wx.navigateBack({
                delta: 1,
              })
            }, 2000)
          })
        }
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