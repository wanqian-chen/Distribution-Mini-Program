// pages/userLogin/userLogin.js

const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    superior_id: null
  }, 

  randomCode: function(){
    var code = []
    var n = 3
    for(let i = 0; i < n; i++){
      let randomNum = Math.ceil(Math.random() * 25)
      code.push(String.fromCharCode(65 + randomNum))
    }
    return code.join('')
  },

  userLogin: function() {
    var that = this;

    wx.getUserProfile({
      desc: '用于展示'
    }).then(res => {
      let user = res.userInfo
      wx.cloud.callFunction({
        name: 'getUserOpenId'
      }).then(res => {
        console.log(res.result)
        let openid = res.result.openid
        // wx.login().then(res => {
        //   console.log(res)
        // })

        // 查找用户
        db.collection('user_info').where({
          // openid的方式待修改
          // _openid: res.userInfo._openid
          openId: openid
          // _openid: '0'
        }).get()
        .then(res => {
          let set = []
          if(res.data.length == 0){
            // wx.getUserProfile({
            //   desc: '用于展示'
            // }).then(res =>{
            //   console.log('result userinfo', res.userInfo)
            //   var user = res.userInfo

              // that.setData({
              //   userInfo: user
              // })

            let set_user = db.collection('id_status').where({
              id_name: 'user_id'
            }).get()
            .then(res => {
              let uid_now = res.data[0].now_id
              let random_code = that.randomCode()
              let invitation_code = random_code + String(uid_now)
              let superior_id = Number(that.data.superior_id)
              // 向数据库添加用户
              db.collection('user_info').add({
                data: {
                  avatarUrl: user.avatarUrl,
                  nick_name: user.nickName,
                  uid: uid_now,
                  invitation_code: invitation_code,
                  subordinate_id: [],
                  superior_id: superior_id,
                  openId: openid
                }
              })

              db.collection('id_status').where({
                id_name: 'user_id'
              }).update({
                data: {
                  now_id: _.inc(1)
                }
              })
            })

            let set_cart = db.collection('id_status').where({
              id_name: 'cart_id'
            }).get()
            .then(res => {
              var cid_now = res.data[0].now_id
              // 向数据库添加用户的购物车
              db.collection('user_cart').add({
                data: {
                  merchandise_amount: 0,
                  merchandise_price_total: 0,
                  cid: cid_now
                  // merchandise: null
                }
              })

              db.collection('id_status').where({
                id_name: 'cart_id'
              }).update({
                data: {
                  now_id: _.inc(1)
                }
              })
            })

            set.push(set_user)
            set.push(set_cart)
          }  
          else{
            set = [new Promise((resolve, reject) => {resolve()})]
          }
        // })
        // .then(res => {
          Promise.all(set).then(res => {
            app.globalData.myInfo = user
            wx.navigateTo({
              url: '../userInfo/userInfo',
            })
          })
        })



      })
  })


  },

  userLogout: function(){

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      superior_id: options.superiorId
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