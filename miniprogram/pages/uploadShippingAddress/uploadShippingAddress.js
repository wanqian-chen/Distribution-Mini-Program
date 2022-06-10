// pages/uploadShippingAddress/uploadShippingAddress.js

var app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    phone: '',
    address: '',
    is_default: false,
    default_change: false,
    index: null,
    uid: null,
    // type: ''
  },

  setName: function(e){
    this.setData({
      name: e.detail.value
    })
  },

  setPhone: function(e){
    this.setData({
      phone: e.detail.value
    })
  },

  setAddress: function(e){
    this.setData({
      address: e.detail.value
    })
  },

  switchDefault: function(e){
    var is_default = e.detail.value
    let is_change = !this.data.default_change
    this.setData({
      is_default: is_default,
      default_change: is_change //还是加判断，决定改不改？
    })
  },

  deleteOldDefault: function(){
    var uid = this.data.uid
    db.collection('user_info').where({
      uid: uid
    }).get().then(res => {
      let old_address = res.data[0].shipping_address
      let old_default_index = old_address.findIndex(element => element.is_default == true);
      console.log(old_address)
      console.log(old_default_index)
      if(old_default_index >= 0){
        db.collection('user_info').where({
          uid: uid
        }).update({
          data: {
            ['shipping_address.' + [old_default_index]]: {
              is_default: false
            }
          }
        })
      }
    })
  },

  uploadInfo: function(){
    var that = this
    let uid = this.data.uid
    let address_info = {}
    address_info['name'] = this.data.name
    address_info['phone'] = this.data.phone
    address_info['address'] = this.data.address
    address_info['is_default'] = this.data.is_default

    db.collection('user_info').where({
      uid: uid
    }).update({
      data: {
        shipping_address: _.push(address_info)
      }
    }).then(res => {
      // that.setData({  
      //   name: '',
      //   phone: '',
      //   address: '',
      // })
      
      wx.showToast({
        title: '添加成功',
        icon: 'success',
        duration: 2000
      }).then(res => {
        setTimeout(function(){
          wx.navigateBack({
            delta: 1
          })
        }, 2000)
      })
    })
  },

  modifyInfo: function(){
    var uid = this.data.uid
    var index = this.data.index
    var that = this
    db.collection('user_info').where({
      uid: uid
    }).update({
      data: {
        ['shipping_address.' + [index]]: {
          name: that.data.name,
          phone: that.data.phone,
          address: that.data.address,
          is_default: that.data.is_default
        }
      }
    }).then(res => {
      wx.showToast({
        title: '修改成功',
        icon: 'success',
        duration: 2000
      }).then(res => {
        setTimeout(function(){
          wx.navigateBack({
            delta: 1,
          })
        }, 2000)
      })
    })
  },

  confirmInfo: function(){
    console.log(this.data.default_change)
    console.log(this.data.is_default)
    if(this.data.is_default == true && this.data.default_change == true){
      this.deleteOldDefault()
    }
    if(this.data.index == null){
      this.uploadInfo()
    }
    else{
      this.modifyInfo()
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var uid = Number(options.uid)
    var that = this
    this.setData({
      uid: uid
    })
    if(options.type == 'modify'){
      let index = Number(options.index)
      db.collection('user_info').where({
        uid: uid
      }).get().then(res => {
        let address = res.data[0].shipping_address[index]
        that.setData({
          name: address.name,
          phone: address.phone,
          address: address.address,
          is_default: address.is_default,
          index: index
        })
      })
    }
    // else if(options.type == 'upload'){
    //   this.setData({
    //     type: 'upload'
    //   })
    // }
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