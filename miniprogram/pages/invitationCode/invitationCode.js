// pages/invitationCode/invitationCode.js

const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    invitation_code: ''
  },

  verifyCode: function(e){
    this.setData({
      invitation_code: e.detail.value
    })
  },

  confirmCode: function(){
    var invitation_code = this.data.invitation_code
    // var code = invitation_code.slice(0, 3)
    var superior_id = invitation_code.slice(3)
    db.collection('user_info').where({
      invitation_code: invitation_code
    }).get()
    .then(res => {
      if(res.data.length != 0){
        console.log('suc')
        wx.navigateTo({
          url: '../userSignUp/userSignUp?superiorId=' + superior_id,
        })
      }
      else{
        wx.showToast({
          title: '邀请码错误',
          icon: 'error',
          duration: 2000
        })
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