// pages/manageMerchandise/manageMerchandise.js

const db = wx.cloud.database()
const _ = db.command
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mer_info: []
  },

  uploadMerchandise: function(){
    wx.navigateTo({
      url: '../uploadMerchandiseInfo/uploadMerchandiseInfo',
    })
  },
  
  setMerInfo: function(){
    var that = this

    db.collection('merchandise').get()
    .then(res => {
      let all_mer = res.data
      let all_mer_info = []
      for(let i = 0; i < all_mer.length; i++){
        let mer = {}
        mer['mid'] = all_mer[i].mid
        mer['img'] = all_mer[i].img[0]
        mer['title'] = all_mer[i].title
        all_mer_info.push(mer)
      }
      that.setData({
        mer_info: all_mer_info
      })
    })
  },

  modifyMer: function(e){
    var mid = String(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '../uploadMerchandiseInfo/uploadMerchandiseInfo?mid=' + mid,
    })
  },

  deleteMer: function(e){
    var mid = e.currentTarget.dataset.id
    var set = []

    wx.showModal({
      title: '提示',
      content: '是否确认删除商品',
      success: function(res){
        if(res.confirm){

          let set_mer = db.collection('merchandise').where({
            mid: mid
          }).remove()
          set.push(set_mer)
      
          let set_id = db.collection('id_status').where({
            id_name: 'merchandise_id'
          }).update({
            data: {
              not_used: _.push(mid)
            }
          })
          set.push(set_id)
      
          Promise.all(set).then(res => {
            this.setMerInfo()
          })
        }
        else if(res.cancel){
          wx.showToast({
            title: '未删除',
            icon: 'error',
            duration: 2000
          })
          return
        }
      }
      
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
          this.setMerInfo()
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