// pages/orderDetail/orderDetail.js

const db = wx.cloud.database()
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    identity: null,
    order_id: null,
    all_sub_order: [],
    create_time: '',
    finish_time: '',
    send_time: '',
    shipping_address: {},
    price: 0.0,
    status: null,
    total_number: 0,
    all_merchandise_info: []
  },

  // 需要？  这写的是个啥
  findSubOrder: function(oid){
    var that = this
    db.collection('order').where({
      oid: oid
    }).get().then(res => {
      let sub_oid = res.data[0].sub_order_id
      if(JSON.stringify(sub_oid) == '[]'){
        let all_sub_order = that.data.all_sub_order
        all_sub_order.push(oid)
        that.setData({
          all_sub_order: all_sub_order
        })
      }
      else{
        for(let i = 0; i < sub_oid.length; i++){
          that.findSubOrder(parseInt(sub_oid[i]))
        }
      }
    })
  },

  setMerchandiseInfo: function(merchandise) {
    var that = this
    let all_merchandise_info = []
    let set = []
    for(let mid in merchandise){
      let per_merchandise = {}
      let set_merchandise = db.collection('merchandise').where({
        mid: Number(mid)
      }).get().then(res => {
        per_merchandise['title'] = res.data[0].title
        per_merchandise['titleTwo'] = res.data[0].titleTwo
        per_merchandise['price'] = res.data[0].price
        per_merchandise['img'] = res.data[0].img
        per_merchandise['id'] = Number(mid)
        per_merchandise['number'] = merchandise[mid]
        all_merchandise_info.push(per_merchandise)
      })
      set.push(set_merchandise)
    }
    Promise.all(set).then(res => {
      that.setData({
        all_merchandise_info: all_merchandise_info
      })
    })
  },

  setOrderInfo: function(oid){
    var that = this
    db.collection('order').where({
      oid: oid
    }).get()
    .then(res => {
      let create_time = res.data[0].create_time
      let finish_time = res.data[0].finish_time
      let send_time = res.data[0].send_time
      let shipping_address = res.data[0].shipping_address
      let merchandise = res.data[0].merchandise_info
      let price = res.data[0].price
      let status = res.data[0].status
      let total_number = res.data[0].total_number
      that.setData({
        create_time: create_time,
        finish_time: finish_time,
        send_time: send_time,
        shipping_address: shipping_address,
        price: price,
        status: status,
        total_number: total_number
      })
      that.setMerchandiseInfo(merchandise)
    })
  },

  uploadDeliveryInfo: function(e) {
    var pages = getCurrentPages();
    if (pages.length > 1) {
      var prePage = pages[pages.length - 2];
      prePage.uploadDeliveryInfo(e)
    }
  },

  confirmSend: function(e) {
    var pages = getCurrentPages();
    if (pages.length > 1) {
      var prePage = pages[pages.length - 2];
      prePage.confirmSend(e)
    }
  },

  confirmDelivery: function(e) {
    var pages = getCurrentPages();
    if (pages.length > 1) {
      var prePage = pages[pages.length - 2];
      prePage.confirmDelivery(e)
    }
  },

  cancelOrder: function(e) {
    var pages = getCurrentPages();
    if (pages.length > 1) {
      var prePage = pages[pages.length - 2];
      prePage.cancelOrder(e)
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var oid = parseInt(options.oid);
    var identity = parseInt(options.identity)
    this.setData({
      order_id: oid,
      identity: identity
    })
    this.setOrderInfo(oid)
    // this.findSubOrder(oid)
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