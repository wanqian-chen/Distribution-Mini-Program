// pages/subordinateOrder/subordinateOrder.js

var app = getApp()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    all_sub_merchandise: {},
    sub_mer_info: {},
    uid: null,
    user_openid: null,
    haveLoggedIn: null
  },

  getOpenid: function(){
    return new Promise((resolve, reject) => {
      let page = this;
      wx.cloud.callFunction({
        name:'getUserOpenId'
      }).then(res => {
        var openid = res.result.openid
        page.setData({
          user_openid: openid
        })
        // console.log('success', this.data.user_openid)
        resolve(res)
      })
    })
  },

  setSubInfo: function(){
    return new Promise((resolve, reject) => {
      var openid = this.data.user_openid;  // uid?
      var that = this;
      var all_merchandise = {};
      db.collection('user_info').where({
        _openid: openid
      }).get()
      .then(res => {
        return new Promise((resolve, reject) => {
          console.log(res.data[0].subordinateId_test)
          var all_sub = res.data[0].subordinateId_test
          for (let i = 0; i < all_sub.length; i++){
            db.collection('user_cart').where({
              userId: all_sub[i]
            }).get()
            .then(res => {
              var mer = res.data[0].merchandise;
              // var j = 0;
              // var total_num = Object.keys(mer).length
              for (let key in mer){
                // j++
                if (key in all_merchandise){
                  all_merchandise[key] += mer[key]
                }
                else{
                  all_merchandise[key] = mer[key]
                }
                // console.log('in loop', all_merchandise)
                i == (all_sub.length - 1) && resolve([all_merchandise])
                // j == total_num && resolve([all_merchandise])
              } 
            })
          }
          // resolve([all_merchandise])
        })
      })
      .then(([all_merchandise]) => {
        that.setData({
          all_sub_merchandise: all_merchandise
        })
        resolve()
      })
    })
  },

  setMerchandiseData: function(){
    return new Promise((resolve, reject) => {
      // var openid = this.data.user_openid;
      // console.log('set openid', this.data.user_openid)
      var that = this;
      // console.log('uid', openid)
    
      var mer = this.data.all_sub_merchandise;
      if (JSON.stringify(mer) == '{}'){
        console.log('no data')  // need?
      }
      else{
        var total_num = Object.keys(mer).length;
        var i = 0;
        var all_mer_info = new Array();
        var total_mer_num = 0;
        var total_mer_money = 0;
        new Promise((resolve, reject) => {
          for (let m in mer) {
            db.collection('merchandise').where({
              _id: m
            }).get()
            .then(res => {
              let mer_info = {}
              i += 1
              mer_info['id'] = res.data[0]._id
              mer_info['number'] = mer[res.data[0]._id] // 不知道为什么用mer[m]不行
              mer_info['detail'] = res.data[0].detail
              mer_info['img'] = res.data[0].img
              mer_info['price'] = res.data[0].price
              mer_info['title'] = res.data[0].title
              mer_info['titleTwo'] = res.data[0].titleTwo
              all_mer_info.push(mer_info)
              // console.log('update', mer_info)
              // console.log('update_result', all_mer_info)

              // total_mer_num += mer_info['number']
              // total_mer_money += mer_info['numb er'] * mer_info['price']

              i == total_num && resolve([all_mer_info])
            })
          }
        })
        .then(([all_mer_info]) => {
          this.setData({
            sub_mer_info: all_mer_info,
            // total_mer_num: total_mer_num,
            // total_mer_money: total_mer_money
          })
          resolve()
        })
      }
    })
  },

  calculatePrice: function(){
    var that = this
    new Promise((resolve, reject) => {
      var info = that.data.sub_mer_info
      var info_new = []
      var k = 0
      var j = 0
      for(let i in info){
        let number = info[i]['number']
        let price = info[i]['price']
        let total_price = 0
        let discount = 1
        db.collection('sale_strategy').where({
          class_name: 'A'
        }).get()
        .then(res => {
          // console.log(info, i, info[i])
          // console.log(i)
          var strategy = res.data[0].strategy
          var newkey = Object.keys(strategy).sort(function(a, b){return a - b});
          for (let k = 0; k < newkey.length; k++){
            if (number < newkey[k]){
              break
            }
            else{
              discount = strategy[newkey[k]]
            }
          }
          total_price = number * price * discount
          // console.log('this is infoi', info[i])
          let i_new = info[i]
          i_new['total_price'] = total_price
          info_new.push(i_new)
          j ++
        //   console.log('in')
        // // }).then(j => {
        //   console.log('out')
          // console.log(info_new)
          j == info.length && resolve(info_new)
        })
      }
    }).then(info_new => {
      that.setData({
        sub_mer_info: info_new
      })
      // console.log('new', info_new)
    }) 
  },

  refresh: async function(){
    var openid = app.globalData.openId
    var status = app.globalData.haveLoggedIn
    var uid = app.globalData.uId
    console.log(status)
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
      await this.getOpenid()
      await this.setSubInfo()
      await this.setMerchandiseData()
      this.calculatePrice()
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