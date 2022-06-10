// pages/order/order.js

const db = wx.cloud.database()
var app = getApp()
const _ = db.command
var util = require('../../utils/utils.js');

Page({

  /**
   * 页面的初始数据
   */

  data: {
    navbarActiveIndex: 0,
    navbarTitle: [
      // "待支付",
      "待受理",
      "待发货",
      "待签收",
      "已完成",
      "已取消"
    ],
    navbarIndex: ["0", "1", "2", "3", "4"],
    all_orders: {},
    all_orders_info: {},
    uid: null,
    user_openid: null,
    haveLoggedIn: null,
    identity: null
  },

  detail: function(e){
    var mid=e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../merchandiseDetail/merchandiseDetail?id='+String(mid),
    })
  },

  setMerchandiseInfo: function(identity){
    var all_orders = this.data.all_orders
    var all_mer_info = {}
    var that = this
    let info = []
    // var j = 0
    for(let status in all_orders){
      let orders = all_orders[status]
      let order_mer_info = []
      all_mer_info[status] = []
      for(let i = 0; i < orders.length; i++){
        all_mer_info[status].push({})
        let oid = orders[i]["id"]
        let price = orders[i]["price"]
        let sub_oid = orders[i]["sub_oid"]
        let total_number = orders[i]["total_number"]
        let create_time = orders[i]["create_time"]
        console.log(orders[i])
        all_mer_info[status][i]["id"] = oid
        all_mer_info[status][i]["price"] = price
        all_mer_info[status][i]["order"] = []
        all_mer_info[status][i]["sub_oid"] = sub_oid
        all_mer_info[status][i]["total_number"] = total_number
        all_mer_info[status][i]["create_time"] = create_time
        for(let mid in orders[i]["order"]){
          let mid_number = Number(mid)
          let num = orders[i]["order"][mid]
          let o = {}
          let info_t = db.collection('merchandise').where({
              mid: mid_number
            }).get()
            .then(res => {
              let mer_info = {}
              mer_info['id'] = res.data[0].mid
              mer_info['number'] = num
              mer_info['detail'] = res.data[0].detail
              mer_info['img'] = res.data[0].img
              mer_info['price'] = res.data[0].price
              mer_info['title'] = res.data[0].title
              mer_info['titleTwo'] = res.data[0].titleTwo
              // order_mer_info.push(mer_info)
              all_mer_info[status][i]["order"].push(mer_info)
            })
          info.push(info_t)
        }
      }
    }

    Promise.all(info).then(res => {
      console.log(all_mer_info)
      if(identity == 1){
        let all_mer_info_t= {}
        all_mer_info_t['0'] = all_mer_info['0'].concat(all_mer_info['1']).sort(function(a, b){return a.id - b.id})
        all_mer_info_t['1'] = all_mer_info['2'].sort(function(a, b){return a.id - b.id})
        all_mer_info_t['2'] = all_mer_info['3'].sort(function(a, b){return a.id - b.id})
        all_mer_info_t['3'] = all_mer_info['4'].sort(function(a, b){return a.id - b.id})
        all_mer_info = all_mer_info_t
      }
      console.log(all_mer_info)
      that.setData({
        all_orders_info: all_mer_info
      })
    })
  },

  /**
   * 点击导航栏
   */
  onNavBarTap: function (event) {
    // 获取点击的navbar的index
    let navbarTapIndex = event.currentTarget.dataset.navbarIndex
    // 设置data属性中的navbarActiveIndex为当前点击的navbar
    this.setData({
      navbarActiveIndex: navbarTapIndex
    })
  },

  /**
   *
   */
  onBindAnimationFinish: function ({detail}) {
    // 设置data属性中的navbarActiveIndex为当前点击的navbar
    this.setData({
      navbarActiveIndex: detail.current
    })
  },

  findAllSubOrderInfo: function(sub_oid){
    return new Promise((resolve, reject) => {
      var that = this
      let all_sub_oid = []
      let set = []
      let findall = []
      for(let i = 0; i < sub_oid.length; i++){
        let set_t = db.collection('order').where({
          oid: sub_oid[i]
        }).get()
        .then(res => {
          let sub_sub_oid = res.data[0].sub_order_id
          if(sub_sub_oid.length == 0){    
            all_sub_oid.push(res.data[0])
          }
          else{
            let findall_t = that.findAllSubOrderInfo(sub_sub_oid).then(res => {
              all_sub_oid = all_sub_oid.concat(res)
            })
            findall.push(findall_t)
          }
        })
        set.push(set_t)
      }
      Promise.all(set).then(res => {
        Promise.all(findall).then(res => {
          console.log(all_sub_oid)
          resolve(all_sub_oid)
        })
      })
    })
  },

  getOnlyUserOrder: function(identity){
    return new Promise((resolve, reject) => {
      var uid = this.data.uid
      var that = this
      var orders = {}
      var orders_0 = [] // 待
      var orders_1 = [] // 待发货
      var orders_2 = [] // 待签收
      var orders_3 = [] // 已完成
      var orders_4 = [] // 已取消
      let order_info = []
      let set = []

      let all_order = []
      let findall = []
      // let identity_id = {
      //   subordinate_id: uid,
      //   superior_id: _.neq(uid),
      //   sub_order_id: []
      // } || {
      //   subordinate_id: uid,
      //   superior_id: uid
      // }
      // if(identity == 1){
      //   identity_id = {
      //     superior_id: uid
      //   }
      // }

      if(identity == 2){
        let set_condition1 = db.collection('order').where({
          subordinate_id: uid,
          superior_id: _.neq(uid),
          sub_order_id: []
        }).get()
        .then(res => {
          order_info = order_info.concat(res.data)
          console.log(order_info)
        })
        set.push(set_condition1)

        let set_condition2 = db.collection('order').where({
          subordinate_id: uid,
          superior_id: uid
        }).get()
        .then(res => {
          order_info = order_info.concat(res.data)
          console.log(order_info)
        })
        set.push(set_condition2)
      }
      else if(identity == 1){
        let set_condition3 = db.collection('order').where({
          superior_id: uid
        }).get()
        .then(res => {
          for(let j = 0; j < res.data.length; j++){
            all_order.push(res.data[j].oid)
          }
          let findall_t = that.findAllSubOrderInfo(all_order).then(res => {
            // console.log(all_order)
            console.log(res)
            order_info = res
          })
          findall.push(findall_t)
        })
        set.push(set_condition3)
      }

      Promise.all(set).then(res => {
        Promise.all(findall).then(res => {
          for(let i = 0; i < order_info.length; i++){
            var orders_t = {}
            let oid = order_info[i].oid
            let merchandise = order_info[i].merchandise_info
            let price = order_info[i].price
            let status = order_info[i].status
            let sub_oid = order_info[i].sub_order_id
            let total_number = order_info[i].total_number
            let create_time = order_info[i].create_time
            orders_t["id"] = oid
            orders_t["order"] = merchandise
            orders_t["price"] = price
            orders_t["sub_oid"] = sub_oid
            orders_t["total_number"] = total_number
            orders_t["create_time"] = create_time
            switch (status) {
              case 0:
                orders_0.push(orders_t);
                break;
              case 1:
                orders_1.push(orders_t);
                break;
              case 2:
                orders_2.push(orders_t);
                break;
              case 3:
                orders_3.push(orders_t);
                break;
              case 4:
                orders_4.push(orders_t);
                break;
            }
          }
          orders['0'] = orders_0
          orders['1'] = orders_1
          orders['2'] = orders_2
          orders['3'] = orders_3
          orders['4'] = orders_4
          that.setData({
            all_orders: orders
          })
          resolve()
        })
      })
    })
  },

  // 删除
  getUserOrder: function(identity){
    return new Promise((resolve, reject) => {
      var uid = this.data.uid
      var that = this
      var orders = {}
      var orders_0 = [] // 待
      var orders_1 = [] // 待发货
      var orders_2 = [] // 待签收
      var orders_3 = [] // 已完成
      var orders_4 = [] // 已取消
      let identity_id = {
        subordinate_id: uid,
        superior_id: _.neq(uid)
      }
      if(identity == 1){
        identity_id = {
          superior_id: uid
        }
      }
      console.log(identity_id)
      db.collection('order').where(identity_id).get()
      .then(res => {
        console.log(res.data[0])
        var order_info = res.data
        for(let i = 0; i < order_info.length; i++){
          var orders_t = {}
          let oid = order_info[i].oid
          let merchandise = order_info[i].merchandise_info
          let price = order_info[i].price
          let status = order_info[i].status
          let sub_oid = order_info[i].sub_order_id
          orders_t["id"] = oid
          orders_t["order"] = merchandise
          orders_t["price"] = price
          orders_t["sub_oid"] = sub_oid
          switch (status) {
            case 0:
              orders_0.push(orders_t);
              break;
            case 1:
              orders_1.push(orders_t);
              break;
            case 2:
              orders_2.push(orders_t);
              break;
            case 3:
              orders_3.push(orders_t);
              break;
            case 4:
              orders_4.push(orders_t);
              break;
          }
        }
        orders['0'] = orders_0
        orders['1'] = orders_1
        orders['2'] = orders_2
        orders['3'] = orders_3
        orders['4'] = orders_4
        that.setData({
          all_orders: orders
        })
        resolve()
      })
    })
  },

  setStatus: function(sub_oid, status){
    var sub_oid_str = JSON.stringify(sub_oid)
    if(sub_oid_str == undefined){
      return
    }

    var that = this
    for(let i = 0; i < sub_oid.length; i++){
      db.collection('order').where({
        oid: sub_oid[i]
      }).get()
      .then(res => {
        let sub_sub_oid = res.data[0].sub_order_id
        that.setStatus(sub_sub_oid, status)
      })

      db.collection('order').where({
        oid: sub_oid[i]
      }).update({
        data: {
          status: status
        }
      })
    }
  },

  orderDetail: function(e){
    // var oid = Number(e.currentTarget.dataset.oid);
    var oid = String(e.currentTarget.dataset.oid);
    var identity = String(this.data.identity)

    wx.navigateTo({
      url: '../orderDetail/orderDetail?oid=' + oid + '&identity=' + identity,
    })
  },

  confirmOrder: function(e){
    var oid = Number(e.currentTarget.dataset.oid);
    var that = this

    db.collection('order').where({
      oid: oid
    }).update({
      data: {
        status: 1
      }
    })
  },

  UpdateSupStatus: function(oid){
    return new Promise((resolve, reject) => {
      let that = this
      let sup_oid = null
      let status = null
      let set_findall = []
      let set_continue = []

      let set_find = db.collection('order').where({
        sub_order_id: oid
      }).get().then(res => {
        if(res.data.length == 0){
          resolve()
        }
        else{
          sup_oid = res.data[0].oid
          status = res.data[0].status
          let sup_uid = res.data[0].superior_id

          if(status == 9){
            resolve()
          }
          else{
            let set_self = db.collection('order').where({
              sub_order_id: oid
            }).update({
              data: {
                status: 9
              }
            })
            set_continue.push(set_self)

            let set_next = that.UpdateSupStatus(sup_oid)
            set_continue.push(set_next)
          }
        }
      })
      set_findall.push(set_find)

      Promise.all(set_findall).then(res => {
        Promise.all(set_continue).then(res => {
          resolve()
        })
      })
    })
  },

  confirmSend: function(e){
    var oid = Number(e.currentTarget.dataset.oid);
    var that = this
    var set = []
    let time = util.formatTime(new Date());

    let set_sup_order = this.UpdateSupStatus(oid)
    set.push(set_sup_order)

    let set_iffirst = db.collection('order').where({
      sub_order_id: oid
    }).get().then(res => {
      if(res.data.length != 0){ // 上级订单存在
        let sup_uid = res.data[0].superior_id
        if(sup_uid == that.data.uid){ // 是一级分销商下的订单
          let sub_uid = res.data[0].subordinate_id
          db.collection('order').where({ // 寻找一级分销商的订单
            subordinate_id: sub_uid,
            superior_id: sub_uid,
            oid: _.in(res.data[0].sub_order_id)
          }).get().then(res => {
            if(res.data.length != 0){ // 一级分销商订单存在
              let first_oid = res.data[0].oid
              let first_order_status = res.data[0].status
              if(first_order_status == 0 && first_oid != oid){ //一级分销商订单状态为待受理
                db.collection('order').where({
                  oid: first_oid
                }).update({
                  data: {
                    status: 1
                  }
                })
              }
            }
          })
        }
      }
    })
    set.push(set_iffirst)

    let set_order = db.collection('order').where({
      oid: oid
    }).update({
      data: {
        send_time: time,
        status: 2
      }
    })
    set.push(set_order)

    Promise.all(set).then(res => {
      wx.showToast({
        title: '已确认',
        icon: 'success',
        duration: 2000
      })
    })
  },

  // 删除
  confirmSendOld: function(e){
    var oid = Number(e.currentTarget.dataset.oid);
    var that = this
    var set = []

    let set_sub = db.collection('order').where({
      oid: oid
    }).get()
    .then(res => {
      var sub_oid = res.data[0].sub_order_id
      that.setStatus(sub_oid, 2)
    })
    set.push(set_sub)

    let set_order = db.collection('order').where({
      oid: oid
    }).update({
      data: {
        status: 2
      }
    })
    set.push(set_order)

    Promise.all(set).then(res => {
      wx.showToast({
        title: '已确认',
        icon: 'success',
        duration: 2000
      })
      // .then(res => {
      //   setTimeout(function(){
      //     wx.navigateTo({
      //       url: '../uploadDeliveryInfo/uploadDeliveryInfo',
      //     })
      //   }, 2000)
      // })
    })
  },

  confirmDelivery: function(e){
    var oid = Number(e.currentTarget.dataset.oid);
    var that = this
    let time = util.formatTime(new Date());
    
    db.collection('order').where({
      oid: oid
    }).update({
      data: {
        status: 3,
        finish_time: time
      }
    }).then(res => {
      wx.showToast({
        title: '已确认',
        icon: 'success',
        duration: 2000
      }).then(res => {
        setTimeout(function(){
          that.onShow()
        }, 2000)
      })
    })
  },

  cancelOrder: function(e){
    var oid = Number(e.currentTarget.dataset.oid);
    var that = this
    var set = []

    db.collection('order').where({
      sub_order_id: oid
    }).get().then(res => {
      if(res.data.length != 0){ // 上级订单存在
        let sup_oid = res.data[0].oid
        let sup_sub_oid = res.data[0].sub_order_id

        for(let i = 0; i < sup_sub_oid.length; i++){
          let set_sub = null
          if(sup_sub_oid[i] == oid){
            set_sub = db.collection('order').where({
              oid: sup_sub_oid[i]
            }).update({
              data: {
                status: 4
              }
            })
          }
          else{
            set_sub = db.collection('order').where({
              oid: sup_sub_oid[i]
            }).update({
              data: {
                status: 0
              }
            })
          }
          set.push(set_sub)
        }

        let set_sup = db.collection('order').where({
          oid: sup_oid
        }).update({
          data: {
            status: 4
          }
        })
        set.push(set_sup)
      }
      else{
        let set_self = db.collection('order').where({
          oid: oid
        }).update({
          data: {
            status: 4
          }
        })
        set.push(set_self)
      }

      Promise.all(set).then(res => {
        wx.showToast({
          title: '已取消',
          icon: 'success',
          duration: 2000
        }).then(res => {
          setTimeout(function(){
            that.onShow()
          }, 2000)
        })
      })
    })

  },

  uploadDeliveryInfo: function(e){
    var oid = e.currentTarget.dataset.oid;
    wx.navigateTo({
      url: '../uploadDeliveryInfo/uploadDeliveryInfo?oid=' + oid,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
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
    that.setData({
      user_openid: openid,
      haveLoggedIn: status,
      uid: uid
    })

    db.collection('user_info').where({
      uid: uid
    }).get()
    .then(res => {
      that.setData({
        identity: res.data[0].identity
      })

      if(res.data[0].identity == 1){
        that.setData({
          navbarTitle: [
            // "待确认",
            "待发货",
            "已发货",
            "已完成",
            "已取消"
          ],
          navbarIndex: ["0", "1", "2", "3"],
        })
      }
      else if(res.data[0].identity == 2){
        that.setData({
          navbarTitle: [
            // "待支付",
            "待受理",
            "待发货",
            "待签收",
            "已完成",
            "已取消"
          ],
          navbarIndex: ["0", "1", "2", "3", "4"],
        })
      }
      
      let identity = res.data[0].identity
      // await that.getUserOrder()
      that.getOnlyUserOrder(identity).then(res => {
        that.setMerchandiseInfo(identity)
      })
      // that.getUserOrder(identity).then(res => {
      //   that.setMerchandiseInfo(identity)
      // })
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

  },
})

