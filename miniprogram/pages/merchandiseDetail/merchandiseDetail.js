// pages/merchandiseDetail/merchandiseDetail.js

const db = wx.cloud.database()
const _ = db.command

var app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mid: null,
    title: null,
    titleTwo: null,
    price: null,
    detail: null,
    img: null,
    cart_total_num: null,
    uid: null,
    mer_num: 0,
    current: 0,
    strategy: {},
    strategy_str: ''
  },

  bindchange: function(e) {
    let current = e.detail.current;
    this.setData({
        current: current
    })
},

  previewImage: function (e) {
    let current = e.currentTarget.dataset.src;
    let that = this;
    wx.previewImage({
        current: current, // 当前显示图片的http链接  
        urls: that.data.img // 需要预览的图片http链接列表  
    })
},

  addToCart: function(){
    var mid = this.data.mid;
    var that = this;
    var cid = this.data.uid // revise
    db.collection('user_cart').where({
      _openid: this.data.user_openid,
      cid: cid  // revise
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
    this.setData({
      cart_total_num: this.data.cart_total_num + 1,
      mer_num: this.data.mer_num + 1
    })
  },

  goIndexPage: function(e){
    wx.redirectTo({
      url: '../index/index',
    })
  },

  openCartPage: function(e){
    wx.switchTab({
      url: '../cart/cart',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var uid = Number(options.uid)
    var mid = Number(options.mid)
    db.collection('merchandise').where({
      mid: mid
    }).get({
      success: function(res) {
        // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
        that.setData({
          mid: res.data[0].mid,
          title: res.data[0].title,
          titleTwo: res.data[0].titleTwo,
          price: res.data[0].price,
          detail: res.data[0].detail,
          img: res.data[0].img,
        })
        var strategy_id = res.data[0].strategy_id
        db.collection('sale_strategy').where({
          sid: strategy_id
        }).get()
        .then(res => {
          that.setData({
            strategy: res.data[0].strategy,
            strategy_str: JSON.stringify(res.data[0].strategy)
          })
        })
      }
    })

    // 下级
    db.collection('order').where({
      superior_id: uid,
      subordinate_id: _.neq(uid),
      status: 0
    }).get()
    .then(res => {
      var data = res.data
      let sub_num = 0
      for(let i = 0; i < data.length; i++){
        let mer = data[i].merchandise_info;
        for (let key in mer){
          if (Number(key) == mid){
            sub_num += mer[key]
          }
        }
      }
      that.setData({
        sub_num: sub_num
      })
    })

    db.collection('user_cart').where({
      cid: uid
    }).get().then(res => {
      var merchandise = res.data[0].merchandise
      var total = 0
      var mer_num = 0
      for(let m in merchandise){
        if(Number(m) == Number(options.mid)){
          mer_num = merchandise[m]
        }
        total += merchandise[m]
      }
      that.setData({
        cart_total_num: total,
        uid: Number(options.uid),
        mer_num: mer_num
      })
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