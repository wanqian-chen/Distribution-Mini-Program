// pages/confirmOrder/confirmOrder.js

var app = getApp()
const db = wx.cloud.database()
const _ = db.command
var util = require('../../utils/utils.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    merchandise_data: null,
    user_mer: {},
    sub_mer_info: {},
    total_mer_num: 0,
    total_mer_money: 0.0,
    all_sub_oid: [],
    uid: null,
    user_openid: null,
    haveLoggedIn: null,
    superior_id: null,
    // uid: 1003  // revise
    address: [],
    now_address_index: null,
    user_money: 0.0
  },

  toSelectAddress: function () {
    let index = Number(this.data.now_address_index)
    wx.navigateTo({
        url: '/pages/manageShippingAddress/manageShippingAddress?type=1&now_address_index=' + index,
    });
},

  setAddressInfo: function(index){
    let uid = this.data.uid
    var that = this
    
    db.collection('user_info').where({
      uid: uid
    }).get().then(res => {
      let address = res.data[0].shipping_address
      let default_index = index
      if(index == null){
        default_index = address.findIndex(element => element.is_default == true);
      }
      that.setData({
        address: address,
        now_address_index: default_index
      })
    })
  },

  resetInfo: function(sub_oid){
    var cid = this.data.uid
    // var sub_oid = this.data.all_sub_oid
    var that = this
    db.collection('user_cart').where({
      cid: cid
    }).update({
      data: {
        merchandise: _.set({}),
        total_number: 0,  // revise?
        total_price: 0  // revise?
      }
    })

    let reset_order = []
    for(let i = 0; i < sub_oid.length; i++){
      let reset_order_t = db.collection('order').where({
        oid: sub_oid[i]
        // status: 0
      }).update({
        data: {
          status: 1
        }
      })
      reset_order.push(reset_order_t)

      let find_sub_order = db.collection('order').where({
        oid: sub_oid[i]
      }).get().then(res => {
        let sub_sub_oid = res.data[0].sub_order_id
        if(sub_sub_oid.length > 0){
          db.collection('order').where({ //执行顺序可能在之后
            oid: sub_oid[i] - 1
          }).update({
            data: {
              status: 1
            }
          })
        }
      })
      reset_order.push(find_sub_order)
    }

    Promise.all(reset_order).then(res => {
      wx.showToast({
        title: '下单成功',
        icon: 'success',
        duration: 2000
      }).then(res => {
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2]; //上一个页面
        prevPage.setData({
          all_user_merchandise: [],
          // total: 0.0,
          // totalnum: 0,
          total_mer_num: 0,
          total_mer_money: 0.0,
          all_sub_merchandise: {},
          sub_mer_info: {},
          user_mer_num: {},
          all_merchandise: [],
          all_sub_oid: [],
          uid: null,
          user_openid: null,
          haveLoggedIn: null
        })
        
        setTimeout(function(){
          // wx.switchTab({
          //   url: '../cart/cart',
          // })

          wx.navigateBack({
            delta: 1,
          })

        }, 2000)
      })
    })
  },

  createOrder: function(){
    var that = this
    var order_id = 0
    var sub_oid = this.data.all_sub_oid
    var index = this.data.now_address_index
    var shipping_address = this.data.address[index]

    db.collection('id_status').where({
      id_name: 'order_id'
    }).get()
    .then(res => {
      order_id = res.data[0].now_id + 1
      let set = []
      let time = util.formatTime(new Date());
      if (JSON.stringify(that.data.all_sub_oid) != '[]'){
        db.collection('id_status').where({
          id_name: 'order_id'
        }).update({
          data: {
            now_id: _.inc(2)
          }
        })
        
        // 子订单
        let set_user = db.collection('order').add({
          data: {
            merchandise_info: that.data.user_mer,
            status: 0,
            oid: order_id,
            price: that.data.user_money,
            subordinate_id: that.data.uid,
            superior_id: that.data.uid,
            sub_order_id: [],
            delivery_id: '',
            shipping_address: shipping_address,
            create_time: time,
            finish_time: '',
            send_time: '',
            total_number: that.data.total_mer_num,
          }
        })
        set.push(set_user)

        let all_sub_oid = JSON.parse(JSON.stringify(sub_oid))
        all_sub_oid.push(order_id)
        // 父订单
        let set_all = db.collection('order').add({
          data: {
            merchandise_info: that.data.merchandise_data,
            status: 0,
            oid: order_id + 1,
            price: that.data.total_mer_money,
            subordinate_id: that.data.uid,
            superior_id: that.data.superior_id,
            sub_order_id: all_sub_oid,
            create_time: time,
            finish_time: ''
          }
        })
        set.push(set_all)
      }
      else{
        db.collection('id_status').where({
          id_name: 'order_id'
        }).update({
          data: {
            now_id: _.inc(1)
          }
        })

        let set_user = db.collection('order').add({
          data: {
            merchandise_info: that.data.user_mer,
            status: 0,
            oid: order_id,
            price: that.data.user_money,
            subordinate_id: that.data.uid,
            superior_id: that.data.superior_id,
            sub_order_id: sub_oid,
            delivery_id: '',
            shipping_address: shipping_address,
            create_time: time,
            finish_time: '',
            send_time: '',
            total_number: that.data.total_mer_num
          }
        })
        set.push(set_user)
      }

      Promise.all(set).then(res => {
        that.resetInfo(sub_oid)
      })
      
      // this.onLoad()
    })
    
  },

  setMerchandiseData: function(){
    return new Promise((resolve, reject) => {
      // var openid = this.data.user_openid;
      // console.log('set openid', this.data.user_openid)
      var that = this;
      // console.log('uid', openid)

      db.collection('user_info').where({
        uid: that.data.uid
      }).get()
      .then(res => {
        let superior_id = res.data[0].superior_id
        that.setData({
          superior_id: superior_id
        })
      })
    
      var mer = this.data.merchandise_data;
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
            m = Number(m)
            db.collection('merchandise').where({
              mid: m
            }).get()
            .then(res => {
              let mer_info = {}
              i += 1
              mer_info['id'] = res.data[0].mid
              mer_info['number'] = mer[res.data[0].mid] // 不知道为什么用mer[m]不行
              mer_info['detail'] = res.data[0].detail
              mer_info['img'] = res.data[0].img
              mer_info['price'] = res.data[0].price
              mer_info['title'] = res.data[0].title
              mer_info['titleTwo'] = res.data[0].titleTwo
              all_mer_info.push(mer_info)
              // console.log('update', mer_info)
              // console.log('update_result', all_mer_info)

              // total_mer_num += mer_info['number']
              // total_mer_money += mer_info['number'] * mer_info['price']

              i == total_num && resolve([all_mer_info])
            })
          }
        })
        .then(([all_mer_info, total_mer_num, total_mer_money]) => {
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var mer_info = JSON.parse(options.merchandise);
    var mer_num = parseInt(options.totalnum);
    var mer_money = parseFloat(options.totalmoney);
    var sub_oid = JSON.parse(options.suboid);
    var user_money = parseFloat(options.usermoney);
    var user_mer = JSON.parse(options.usermer);

    this.setData({
      merchandise_data: mer_info,
      total_mer_num: mer_num,
      total_mer_money: mer_money,
      all_sub_oid: sub_oid,
      user_money: user_money,
      user_mer: user_mer
    })
    
    // console.log(this.data.merchandise_data)
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
    var that = this
    this.setData({
      user_openid: openid,
      haveLoggedIn: status,
      uid: uid
    })

    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1]; //当前页面
    let index = currPage.data.now_address_index
    this.setAddressInfo(index)
    this.setMerchandiseData()
    // if (change) {
    //   db.collection('user_info').where({
    //     uid: uid
    //   }).get().then(res => {
    //     let address = res.data[0].shipping_address[index]
    //     that.setData({
    //       name: info.name,
    //       tel: info.tel,
    //       company: info.company,
    //       address: info.address
    //     })
    //   })
    // }
    // else{
    //   
    // }
    // 加个判断，初始才setaddress
  
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