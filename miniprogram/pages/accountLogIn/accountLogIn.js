// pages/accountLogIn/accountLogIn.js

var app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    user_id: null,
    user_password: '', //待加密
  },

  setUserId: function(e){
    this.setData({
      user_id: Number(e.detail.value)
    })
  },

  setUserPassword: function(e){
    this.setData({
      user_password: e.detail.value
    })
  },

  signUp: function(){
    wx.navigateTo({
      url: '../invitationCode/invitationCode',
    })
  },

  logIn: function(){
    var id = this.data.user_id
    var password = this.data.user_password

    db.collection('user_info').where({
      uid: id
    }).get()
    .then(res => {
      let correct_pwd = res.data[0].password
      if(res.data[0].activate_status == false){
        wx.showToast({
          title: '用户状态失效',
          icon: 'error',
          duration: 2000
        })
      }
      else if(password == correct_pwd){
        app.globalData.uId = id
        app.globalData.haveLoggedIn = true
        wx.showToast({
          title: '登陆成功',
          icon: 'success',
          duration: 2000
        }).then(res => {
          setTimeout(function(){
            wx.navigateBack({
              delta: 1,
            })
          }, 2000)
        })
      }
      else{
        wx.showToast({
          title: '密码错误',
          icon: 'error',
          duration: 2000
        })
      }
    })
  },

  directLogIn: function(){
    var that = this;
    var openid = app.globalData.openId

    wx.getUserProfile({
      desc: '用于登录与展示'
    }).then(res => {
      // 查找用户
      db.collection('user_info').where({
        _openid: openid,
        bind_status: true
      }).get()
      .then(res => {
        if(res.data.length == 0){
          wx.showModal({
            title: '提示',
            content: '用户不存在，是否注册',
            success: function(res){
              if(res.confirm){
                wx.navigateTo({
                  url: '../invitationCode/invitationCode',
                })
              }
              else if(res.cancel){
                return
              }
            }
          })
        }  
        else{
          var uid = res.data[0].uid
          if(res.data[0].activate_status == false){
            wx.showModal({
              title: '提示',
              content: '用户状态错误，是否重新注册',
              success: function(res){
                if(res.confirm){
                  db.collection('user_info').where({
                    _openid: openid,
                    bind_status: true
                  }).update({
                    data: {
                      bind_status: false
                    }
                  })
                  wx.navigateTo({
                    url: '../invitationCode/invitationCode',
                  })
                }
                else if(res.cancel){
                  return
                }
              }
            })
          }
          else{
            // that.setData({
            //   uid: uid,
            //   haveLoggedIn: true
            // })
            app.globalData.uId = uid
            app.globalData.haveLoggedIn = true
            wx.showToast({
              title: '登陆成功',
              icon: 'success',
              duration: 2000
            }).then(res => {
              setTimeout(function(){
                wx.navigateBack({
                  delta: 1,
                })
              }, 2000)
            })
          }
          
        }
      })
    }).catch(res => {
      wx.showToast({
        title: '授权失败',
        icon: 'error',
        duration: 2000
      })
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