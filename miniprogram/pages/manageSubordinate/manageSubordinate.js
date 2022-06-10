// pages/manageSubordinate/manageSubordinate.js

const db = wx.cloud.database()
const _ = db.command
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sub_id: [],
    sub_info: [],
    uid: null,
    user_openid: null,
    haveLoggedIn: null
  },

  findSub: async function(){
    return new Promise((resolve, reject) => {
      var uid = this.data.uid
      var that = this
      db.collection('user_info').where({
        uid: uid
      }).get()
      .then(res => {
        var sub_id = res.data[0].subordinate_id
        that.setData({
          sub_id: sub_id
        })
        resolve()
      })
    })
  },

  setSubInfo: function(){
    var sub_id = this.data.sub_id
    var sub_info = []
    var set = []
    var that = this

    for(let i = 0; i < sub_id.length; i++){
      let sub_info_t = {}
      let set_t = db.collection('user_info').where({
        uid: sub_id[i]
      }).get()
      .then(res => {
        if(res.data[0].activate_status == true){
          let info = res.data[0]
          sub_info_t['uid'] = info.uid
          sub_info_t['avatar'] = info.avatarUrl
          sub_info_t['nickName'] = info.nick_name
          sub_info.push(sub_info_t)
        }
      })
      set.push(set_t)
    }

    Promise.all(set).then(res => {
      that.setData({
        sub_info: sub_info
      })
    })
  },

  deleteSub: function(e){
    var sub_uid = e.currentTarget.dataset.id
    var user_id = this.data.uid
    var all_sub = []
    db.collection('user_info').where({
      uid: user_id
    }).get()
    .then(res => {
      let set = []
      all_sub = res.data[0].subordinate_id
      all_sub.map((val, i) => {
        if(val == sub_uid){
          all_sub.splice(i, 1)
        }
      })

      let set_sub = db.collection('user_info').where({
        uid: sub_uid
      }).update({
        data: {
          activate_status: false,
          error_code: _.push(301)
        }
      })
      set.push(set_sub)

      let set_user = db.collection('user_info').where({
        uid: user_id
      }).update({
        data: {
          subordinate_id: all_sub
        } 
      })
      set.push(set_user)

      Promise.all(set).then(res => {
        this.refresh()
      })
    })
  },

  refresh: async function(){
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
  
      await this.findSub()
      this.setSubInfo()
    }
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
    this.refresh()
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