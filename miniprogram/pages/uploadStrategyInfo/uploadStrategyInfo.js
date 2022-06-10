// pages/uploadStrategy/uploadStrategy.js

const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sid_now: null,
    strategy_name: '',
    strategy_detail: ''
  },

  setStrategyName: function(e){
    this.setData({
      strategy_name: e.detail.value
    })
  },

  setStrategyDetail: function(e){
    this.setData({
      strategy_detail: e.detail.value
    })
  },

  setStrategyNow: function(sid){
    var that = this

    db.collection('sale_strategy').where({
      sid: sid
    }).get()
    .then(res => {
      let stra_info = res.data[0]
      let stra_str = JSON.stringify(stra_info.strategy).slice(1, -1)
      stra_str = stra_str.split('"').join('')
      that.setData({
        strategy_name: stra_info.name,
        strategy_detail: stra_str,
        sid_now: sid
      })
    })
  },

  modifyInfo: function(){
    var sid = this.data.sid_now
    var that = this

    var strategy = this.data.strategy_detail
    var strategy_per = strategy.split(',')
    var strategy_final = {}
    var that = this
    for(let i = 0; i < strategy_per.length; i++){
      let strategy_t = strategy_per[i].split(':')
      strategy_final[strategy_t[0]] = Number(strategy_t[1])
    }

    db.collection('sale_strategy').where({
      sid: sid
    }).update({
      data: {
        name: that.data.strategy_name,
        strategy: _.set(strategy_final)
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

  uploadInfo: function(){
    var strategy = this.data.strategy_detail
    var strategy_per = strategy.split(',')
    var strategy_final = {}
    var that = this
    for(let i = 0; i < strategy_per.length; i++){
      let strategy_t = strategy_per[i].split(':')
      strategy_final[strategy_t[0]] = Number(strategy_t[1])
    }
    wx.showModal({
      title: '销售策略是否为',
      content: JSON.stringify(strategy_final),
      success: function(res){
        db.collection('id_status').where({
          id_name: 'strategy_id'
        }).get()
        .then(res => {
          let sid = res.data[0].now_id + 1
          db.collection('sale_strategy').add({
            data: {
              sid: sid,
              name: that.data.strategy_name,
              strategy: strategy_final
            }
          }).then(res => {
            db.collection('id_status').where({
              id_name: 'strategy_id'
            }).update({
              data: {
                now_id: _.inc(1)
              }
            })

            that.setData({
              strategy_name: '',
              strategy_detail: ''
            })
            wx.showToast({
              title: '上传成功',
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
        })
      }
    })
  },

  confirmInfo: function(){
    if(this.data.sid_now == null){
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
    var options_str = JSON.stringify(options)
    if(options_str != '{}'){
      this.setStrategyNow(Number(options.sid))
    }
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