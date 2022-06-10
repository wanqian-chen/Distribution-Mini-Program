//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        env: 'cloud1-4gsx799hc2645fc8',
        traceUser: true,
      })
    }

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        this.getOpenId()
      }
    })
  },

  globalData: {
    // myInfo: 12
    openId: '',
    haveLoggedIn: false,
    uId: null
  },

  getOpenId: function() {
    wx.showLoading({
      title: '',
    })
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      config: {
        // env: this.data.envId
        env: 'cloud1-4gsx799hc2645fc8'
      },
      data: {
        type: 'getOpenId'
      }
    }).then((resp) => {
      this.globalData.openId = resp.result.openid
      // this.setData({
      //   // haveGetOpenId: true,
      //   openId: resp.result.openid
      // })
      wx.hideLoading()
  //  }).catch((e) => {
  //     this.setData({
  //       showUploadTip: true
  //     })
    //  wx.hideLoading()
    })
  },

})
