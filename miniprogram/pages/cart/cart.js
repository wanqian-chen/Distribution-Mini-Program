// const { resolve } = require("path");

// pages/cart/cart.js
var app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    all_user_merchandise: [],
    // total: 0.0,
    // totalnum: 0,
    total_mer_num: 0,
    total_mer_money: 0.0,
    sub_total_money: 0.0,
    user_money: 0.0,
    all_sub_merchandise: {},
    sub_mer_info: {},
    user_mer_num: {},
    all_merchandise: [],
    all_sub_oid: [],
    uid: null,
    user_openid: null,
    haveLoggedIn: null,
    hasCartGoods: 0,
    all_strategy: {}
  },

  checkedItem: function(e){
    var mid = Number(e.currentTarget.dataset.id);
    var all_merchandise = this.data.all_merchandise
    var that = this
    for(let i = 0; i < all_merchandise.length; i++){
      if(all_merchandise[i].id == mid){
        if(all_merchandise[i].sub_number > 0){
          wx.showToast({
            title: '下级订单存在',
            icon: 'error',
            duration: 2000
          })
        }
        else{
          all_merchandise[i].is_checked = !all_merchandise[i].is_checked
          that.setData({
            all_merchandise: all_merchandise  //视图层更新
          })
        }
        break
      }
    }
  },

  goStock: function(){
    wx.navigateTo({
      url: '../stock/stock',
    })
  },

  buy: function(){
    var merchandise = {};
    var sub_oid = this.data.all_sub_oid;
    var total_mer_num = String(this.data.total_mer_num);
    var total_mer_money = String(this.data.total_mer_money)
    var user_money = String(this.data.user_money)
    var user_mer = JSON.stringify(this.data.user_mer_num)
    // var all_mer = this.data.all_merchandise;
    var sub_total_money = this.data.sub_total_money
    let mer = this.data.all_merchandise

    // for(let j = 0; j < all_mer.length; j++){
    //   if(all_mer[j].is_checked == true){
    //     mer.push(all_mer[j])
    //   }
    // }

    // console.log(total_mer_money)
    for (let i = 0; i < mer.length; i++){
      merchandise[mer[i].id] = mer[i].total_number
    }
    let merchandise_str = JSON.stringify(merchandise);
    let sub_oid_str = JSON.stringify(sub_oid)
    // console.log(merchandise_str)
    wx.navigateTo({
      url: '../confirmOrder/confirmOrder?merchandise=' + merchandise_str + '&totalnum=' + total_mer_num + '&totalmoney=' + total_mer_money + '&suboid=' + sub_oid_str + '&usermoney=' + user_money+ '&usermer=' + user_mer,
    })

    // if (app.globalData.balance >= this.data.total){
    //   app.globalData.balance -= this.data.total;
    //   for(var j=0; j<4; j++){
    //     app.globalData.mer[j]["number"]=0;
    //   }
    //   wx.navigateTo({
    //     url: '../success/success?t=成功支付￥'+String(this.data.total)+'&last=../cart/cart'
    //   })
    // }
    // else{
    //   wx.navigateTo({
    //     url: '../failure/failure'+"?t=余额不足，请先充值"
    //   })
    // }
  },

  zero: function(){
    // app.globalData.total = 0;
    // for(var i=0; i<4; i++){
    //   app.globalData.mer[i]["number"]=parseInt(0);
    // }
    var that = this;
    var uid = this.data.uid // revise
    db.collection('user_cart').where({
      _openid: this.data.user_openid,
      uid: uid
    })
    .update({
      data: {
        merchandise: _.set({})
      }
    })
    .then(res => {
      that.setData({
        all_user_merchandise: [],
        total_mer_num: 0,
        total_mer_money: 0.0,
        all_sub_merchandise: {},
        sub_mer_info: {},
        user_mer_num: {},
        all_merchandise: [],
        all_sub_oid: [],
        uid: null,
        user_openid: null,
        haveLoggedIn: null,
        hasCartGoods: 0
      })
      that.onShow()
    })
  },

  detail: function(e){
    var mid = e.currentTarget.dataset.id;
    var uid = this.data.uid
    wx.navigateTo({
      url: '../merchandiseDetail/merchandiseDetail?mid='+ String(mid) + '&uid=' + String(uid),
    })
  },

  addmer: function(e){
    var mid = e.currentTarget.dataset.id;
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
    .then(res => {
      that.onShow()
    })
  },

  minmer: function(e){
    var mid=e.currentTarget.dataset.id;
    var that = this;
    var cid = this.data.uid // revise

    db.collection('user_cart').where({
      // uid: this.data.user_openid,
      cid: cid // revise
    }).get().then(res => {
      let all_num = res.data[0].merchandise
      let num = all_num[mid]
      if(num <= 1){
        delete all_num[mid]
        db.collection('user_cart').where({
          _openid: this.data.user_openid,
          cid: cid // revise
        })
        .update({
          data: {
            merchandise: _.set(all_num)
          }
        }).then(res => {
          that.setData({
            all_user_merchandise: [],
            total_mer_num: 0,
            total_mer_money: 0.0,
            all_sub_merchandise: {},
            sub_mer_info: {},
            user_mer_num: {},
            all_merchandise: [],
            all_sub_oid: [],
            uid: null,
            user_openid: null,
            haveLoggedIn: null,
            hasCartGoods: 0
          })
          that.onShow()
        })
      }
      else{
        db.collection('user_cart').where({
          _openid: this.data.user_openid,
          cid: cid // revise
        })
        .update({
          // 加个判断是否存在cart里
          // 但是好像不在会自动添加
          data: {
            merchandise: {
              [mid]: _.inc(-1)
            }
          }
        }).then(res => {
          that.onShow()
        })
      }
    })
  },

  // getOpenid: function(){
  //   return new Promise((resolve, reject) => {
  //     let page = this;
  //     wx.cloud.callFunction({
  //       name:'getUserOpenId'
  //     }).then(res => {
  //       var openid = res.result.openid
  //       page.setData({
  //         user_openid: openid
  //       })
  //       // console.log('success', this.data.user_openid)
  //     // }).then(res => {
  //       resolve(res)
  //     })
  //   })
  // },

  nothing: function(){

  },



  inputNumber: function(e){
    var mid = e.currentTarget.dataset.id;
    var number = Number(e.detail.value);
    var that = this;
    var cid = this.data.uid // revise
    console.log(number)
    if(!isNaN(number)){
      if(number <= 0){
        db.collection('user_cart').where({
          cid: cid // revise
        }).get().then(res => {
          let all_num = res.data[0].merchandise

          delete all_num[mid]
          db.collection('user_cart').where({
            _openid: this.data.user_openid,
            cid: cid // revise
          })
          .update({
            data: {
              merchandise: _.set(all_num)
            }
          }).then(res => {
            that.setData({
              all_user_merchandise: [],
              total_mer_num: 0,
              total_mer_money: 0.0,
              all_sub_merchandise: {},
              sub_mer_info: {},
              user_mer_num: {},
              all_merchandise: [],
              all_sub_oid: [],
              uid: null,
              user_openid: null,
              haveLoggedIn: null,
              hasCartGoods: 0
            })
            that.onShow()
          })
        })
      }
      else{
        if(number > 999){
          number = 999
        }
        db.collection('user_cart').where({
          _openid: this.data.user_openid,
          cid: cid  // revise
        })
        .update({
          // 加个判断是否存在cart里
          // 但是好像不在会自动添加
          data: {
            merchandise: {
              [mid]: number
            }
          }
        })
        .then(res => {
          that.onShow()
        })
      }
    }
    else{
      that.onShow()  // 能直接取消输入而不是刷新吗
    }


  },

  setUserMerchandiseData: function(){
    return new Promise((resolve, reject) => {
      var openid = this.data.user_openid;
      var that = this;
      var cid = this.data.uid  //要改
      db.collection('user_cart').where({
        // _openid: openid,
        cid: cid
      }).get()
      .then(res => {
        // return new Promise((resolve, reject) => {
        var mer = res.data[0].merchandise;
        var all_mer_info = new Array();
        var set = [];
        console.log(JSON.stringify(mer))
        if (JSON.stringify(mer) == '{}'){
          all_mer_info = [{}]
          set.push(new Promise((resovle, reject) => {resolve()}))
          // return([{}, 0, 0])
          that.setData({
            hasCartGoods: 0,
          })
          console.log('in here')
        }
        else{
          var total_num = Object.keys(mer).length;
          var i = 0;
          var total_mer_num = 0;
          var total_mer_money = 0;

          that.setData({
            user_mer_num: mer,
            hasCartGoods: 1
          })

          for (let m in mer) {
            m = Number(m)
            let set_t = db.collection('merchandise').where({
              mid: m
            }).get()
            .then(res => {
              var mer_info = {}
              i += 1
              mer_info['id'] = res.data[0].mid
              mer_info['user_number'] = mer[res.data[0].mid]
              mer_info['detail'] = res.data[0].detail
              mer_info['img'] = res.data[0].img
              mer_info['price'] = res.data[0].price.toFixed(2)
              mer_info['title'] = res.data[0].title
              mer_info['titleTwo'] = res.data[0].titleTwo
              mer_info['strategy'] = res.data[0].strategy_id
              // mer_info['is_checked'] = false
              all_mer_info.push(mer_info)

              // total_mer_num += mer_info['user_number']
              // total_mer_money += mer_info['user_number'] * mer_info['price']
              // i == total_num && resolve([all_mer_info, total_mer_num, total_mer_money])
            })
            set.push(set_t)
          }
        }

        Promise.all(set).then(res => {
          that.setData({
            all_user_merchandise: all_mer_info
            // total_mer_num: num,
            // total_mer_money: money
          })
          console.log(that.data.hasCartGoods)
          resolve()
        })
      })
    })
  },

  setSubInfo: function(){
    return new Promise((resolve, reject) => {
      var openid = this.data.user_openid;
      var that = this;
      var all_merchandise = {};
      var uid = this.data.uid
      var all_order_id = []

      db.collection('order').where({
        superior_id: uid,
        subordinate_id: _.neq(uid),
        status: 0
      }).get()
      .then(res => {
        var data = res.data
        var sub_total_money = 0
        for(let i = 0; i < data.length; i++){
          let mer = data[i].merchandise_info;
          let oid = data[i].oid
          all_order_id.push(oid)
          for (let key in mer){
            if (key in all_merchandise){
              all_merchandise[key] += mer[key]
            }
            else{
              all_merchandise[key] = mer[key]
            }
          }
          sub_total_money += data[i].price
        }
        that.setData({
          all_sub_merchandise: all_merchandise,
          all_sub_oid: all_order_id,
          sub_total_money: sub_total_money
        })
        resolve()
      })
    })
  },

  combineMerchandiseData: function(){
    var that = this
    return new Promise((resolve, reject) => {
      var user_mer = this.data.all_user_merchandise
      var sub_mer_num = this.data.all_sub_merchandise

      for(let i = 0; i < user_mer.length; i++){
        user_mer[i]['sub_number'] = 0
        user_mer[i]['total_number'] = user_mer[i]['user_number']
      }

      var add = []
      for(let key in sub_mer_num){
        var existed = 0
        for(let i = 0; i < user_mer.length; i++){
          if(user_mer[i]['id'] == key){
            user_mer[i]['sub_number'] = sub_mer_num[key]
            user_mer[i]['total_number'] = user_mer[i]['user_number'] + sub_mer_num[key]
            // user_mer[i]['is_checked'] = true
            existed = 1
            break
          }
        }
        if(existed == 0){
          let k = Number(key)
          let add_t = db.collection('merchandise').where({
            mid: k
          }).get()
          .then(res => {
            let mer_info = {}
            mer_info['id'] = res.data[0].mid
            mer_info['user_number'] = 0
            mer_info['sub_number'] = sub_mer_num[res.data[0].mid] // 不知道为什么用mer[m]不行
            mer_info['total_number'] = sub_mer_num[res.data[0].mid]
            mer_info['detail'] = res.data[0].detail
            mer_info['img'] = res.data[0].img
            mer_info['price'] = res.data[0].price.toFixed(2)
            mer_info['title'] = res.data[0].title
            mer_info['titleTwo'] = res.data[0].titleTwo
            mer_info['strategy'] = res.data[0].strategy_id
            // mer_info['is_checked'] == true

            if(Object.keys(user_mer).length == 0){
              user_mer = [mer_info]
            }
            else{
              user_mer.push(mer_info)
            }
            
          })
          add.push(add_t)
        }
      }
      Promise.all(add).then(res => {
        console.log(user_mer)
        that.setData({
          all_merchandise: user_mer
        })
        resolve()
      })
      // resolve(user_mer)
    // }).then(all_user_mer => {
    })
  },

  calculatePrice: function(){
    var that = this
    return new Promise((resolve, reject) => {
      var info = that.data.all_merchandise
      // console.log('info:', info)
      var info_new = []
      var k = 0
      var set = []

      var mer_strategy = {}
      for(let j = 0; j < info.length; j++){
        let strategy_id = String(info[j].strategy)
        if(mer_strategy.hasOwnProperty(strategy_id)){
          mer_strategy[strategy_id] += info[j].total_number
        }
        else{
          mer_strategy[strategy_id] = info[j].total_number
        }
      }
      that.setData({
        all_strategy: mer_strategy
      })

      for(let i in info){
        let number = info[i]['total_number']
        let number_strategy = mer_strategy[String(info[i].strategy)]
        let price = info[i]['price']
        let total_price = 0
        let discount = 1
        let set_t = db.collection('sale_strategy').where({
          // class_name: 'A'
          sid: info[i]['strategy']
        }).get()
        .then(res => {
          // console.log(info, i, info[i])
          // console.log(i)
          var strategy = res.data[0].strategy
          var newkey = Object.keys(strategy).sort(function(a, b){return a - b});
          for (let k = 0; k < newkey.length; k++){  // 找出商品数量对应的销售策略
            if (number_strategy < newkey[k]){
              break
            }
            else{
              discount = strategy[newkey[k]]
            }
          }
          total_price = number * price * discount
          total_price = Number(total_price.toFixed(2)) // 四舍五入两位小数
          let i_new = info[i]
          i_new['origin_total_price'] = Number((number * price).toFixed(2))
          i_new['total_price'] = Number(total_price.toFixed(2))
          i_new['per_price'] = Number((price * discount).toFixed(2))
          info_new.push(i_new)
        })
        set.push(set_t)
      }
      Promise.all(set).then(res => {
        // console.log(info_new)
        info_new.sort(function(a, b){
          if(a.strategy == b.strategy){
            return a.id - b.id
          }
          else{
            return a.strategy - b.strategy
          }
        })
        that.setData({
          all_merchandise: info_new
        })
        resolve()
      })
    }) 
  },

  calculateTotal: function(){
    var that = this
    // return new Promise((resolve, reject) => {
    var info = that.data.all_merchandise
    var num = 0
    var money = 0
    for(let i = 0; i < info.length; i++){
      num += info[i]['total_number']
      money += info[i]['total_price']
    }
    if(num != 0){
      that.setData({
        hasCartGoods: 1
      })
    }
    let user_money = (money - that.data.sub_total_money).toFixed(2)
    money = money.toFixed(2)
    that.setData({
      total_mer_num: num,
      total_mer_money: money,
      user_money: user_money
    })
    // })
  },

  refresh: async function(){
    // await this.getOpenid()
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

      await this.setUserMerchandiseData()
      await this.setSubInfo()
      await this.combineMerchandiseData()
      await this.calculatePrice()
      this.calculateTotal()
    } 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // onshow有了，这里暂时注释掉
    // this.getOpenid().then(res => {
    //   this.setmerchandise_data()
    // }).catch(res => {
    //   console.log('fail!!')
    // })
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