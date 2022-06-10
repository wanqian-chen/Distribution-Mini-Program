// pages/userSignUp/userSignUp.js

var app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    superior_id: null,
    user_nickName: '',
    user_password: '', //待加密
    avatar: '',
    openid: '',
    haveLoggedIn: null,
    uid: null,
    isChange: false,
    open: false
  },

  switchOpen: function(){
    this.setData({
      open: !this.data.open
    })
  },

  setUserInfo: function(){
    var uid = this.data.uid
    var that = this
    db.collection('user_info').where({
      uid: uid
    }).get()
    .then(res => {
      var user_info = res.data[0]
      that.setData({
        user_nickName: user_info.nick_name,
        // user_password: '', //待加密
        avatar: user_info.avatarUrl,
      })
    })
  },

  randomCode: function(){
    var code = []
    var n = 3
    for(let i = 0; i < n; i++){
      let randomNum = Math.ceil(Math.random() * 25)
      code.push(String.fromCharCode(65 + randomNum))
    }
    return code.join('')
  },

  userSignUp: function() {
    var that = this;

    wx.showModal({
      title: '提示',
      content: '是否使用微信信息注册',
      success: function(res){
        if(res.confirm){
          wx.getUserProfile({
            desc: '用于注册与展示'
          }).then(res => {
            let user = res.userInfo
            let openid = that.data.openid
      
            // 查找用户
            db.collection('user_info').where({
              // openid的方式待修改
              _openid: openid,
              bind_status: true
            }).get()
            .then(res => {
              if(res.data.length == 0){
                db.collection('id_status').where({
                  id_name: 'user_id'
                }).get()
                .then(res => {
                  let set = []
                  let uid_now = res.data[0].now_id
                  let random_code = that.randomCode()
                  let invitation_code = random_code + String(uid_now)
                  let superior_id = Number(that.data.superior_id)
                  // let cloud_path_t = 'user_avatar/' + String(uid_now) + '.jpg'
                  // let cloud_path = 'cloud://cloud1-4gsx799hc2645fc8.636c-cloud1-4gsx799hc2645fc8-1307835410/' + cloud_path_t

                  // wx.cloud.uploadFile({
                  //   cloudPath: cloud_path_t, // 上传至云端的路径
                  //   filePath: user.avatarUrl, // 小程序临时文件路径
                  // })

                  // 向数据库添加用户
                  let set_user = db.collection('user_info').add({
                    data: {
                      avatarUrl: user.avatarUrl,
                      nick_name: user.nickName,
                      uid: uid_now,
                      invitation_code: invitation_code,
                      subordinate_id: [],
                      superior_id: superior_id,
                      openId: openid,
                      bind_status: true,
                      activate_status: true
                    }
                  })
                  set.push(set_user)

                  let set_cart = db.collection('user_cart').add({
                    data: {
                      cid: uid_now,
                      merchandise: {},
                      // total_price: 0,
                      // total_number: 0
                    }
                  })
                  set.push(set_cart)
    
                  let update_uid = db.collection('id_status').where({
                    id_name: 'user_id'
                  }).update({
                    data: {
                      now_id: _.inc(1)
                    }
                  })
                  set.push(update_uid)

                  let update_cid = db.collection('id_status').where({
                    id_name: 'cart_id'
                  }).update({
                    data: {
                      now_id: _.inc(1)
                    }
                  })
                  set.push(update_cid)

                  let update_sup_info = db.collection('user_info').where({
                    uid: superior_id
                  }).update({
                    data: {
                      subordinate_id: _.push(uid_now)
                    }
                  })
                  set.push(update_sup_info)

                  Promise.all(set).then(res => {
                    wx.showToast({
                      title: '注册成功',
                      icon: 'success',
                      duration: 2000
                    }).then(res => {
                      setTimeout(function(){
                        wx.switchTab({
                          url: '../mine/mine'
                        })
                      }, 2000)
                    })
                  })

                })
              }  
              else{
                console.log(res)
                let uid = res.data[0].uid
                wx.showModal({
                  title: '提示',
                  content: '用户已存在，是否直接登录',
                  success: function(res){
                    if(res.confirm){
                      that.setData({
                        uid: uid,
                        haveLoggedIn: true
                      })
                      app.globalData.uId = uid
                      app.globalData.haveLoggedIn = true
                      wx.showToast({
                        title: '登陆成功',
                        icon: 'success',
                        duration: 2000
                      }).then(res => {
                        setTimeout(function(){
                          wx.switchTab({
                            url: '../index/index',
                          })
                        }, 2000)
                      })
                    }
                  }
                })
              }
            })
    
          }).catch(res => {
            wx.showToast({
              title: '授权失败',
              icon: 'error',
              duration: 2000
            })
            return
          })
        }
        else if(res.cancel){
          wx.showToast({
            title: '授权失败',
            icon: 'error',
            duration: 2000
          })
          return
        }
      }
      
    })
  },

  submitInfo: function(){
    var that = this

    db.collection('id_status').where({
      id_name: 'user_id'
    }).get()
    .then(res => {
      let set = []
      let uid_now = res.data[0].now_id
      let random_code = that.randomCode()
      let invitation_code = random_code + String(uid_now)
      let superior_id = Number(that.data.superior_id)
      let avatarUrl = 'user_avatar/' + uid_now + '.jpg'
      let nickName = that.data.user_nickName
      let password = that.data.user_password

      let url = 'cloud://cloud1-4gsx799hc2645fc8.636c-cloud1-4gsx799hc2645fc8-1307835410/' + avatarUrl
      let set_user = db.collection('user_info').add({
        data: {
          avatarUrl: url,
          nick_name: nickName,
          uid: uid_now,
          invitation_code: invitation_code,
          subordinate_id: [],
          superior_id: superior_id,
          // openId: openid,
          bind_status: false,
          activate_status: true,
          password: password,
          identity: 2,
          shipping_address: []
        }
      })
      set.push(set_user)
  
      let set_cart = db.collection('user_cart').add({
        data: {
          cid: uid_now,
          merchandise: {},
          total_price: 0,
          total_number: 0
        }
      })
      set.push(set_cart)
  
      let update_uid = db.collection('id_status').where({
        id_name: 'user_id'
      }).update({
        data: {
          now_id: _.inc(1)
        }
      })
      set.push(update_uid)
  
      let update_cid = db.collection('id_status').where({
        id_name: 'cart_id'
      }).update({
        data: {
          now_id: _.inc(1)
        }
      })
      set.push(update_cid)
  
      let update_sup_info = db.collection('user_info').where({
        uid: superior_id
      }).update({
        data: {
          subordinate_id: _.push(uid_now)
        }
      })
      set.push(update_sup_info)

      let avatar = that.data.avatar
      let set_avatar = wx.cloud.uploadFile({
        cloudPath: avatarUrl, // 上传至云端的路径
        filePath: avatar, // 小程序临时文件路径
      })
      set.push(set_avatar)
  
      Promise.all(set).then(res => {
        wx.showModal({
          title: '请牢记帐号',
          content: '帐号:' + String(uid_now),
          showCancel: false
        }).then(res => {
          setTimeout(function(){
            wx.switchTab({
              url: '../mine/mine'
            })
          }, 2000)
        })
      })
    })
  },

  modifyInfo: function(){
    var that = this
    db.collection('user_info').where({
      uid: that.data.uid
    }).update({
      data: {
        nick_name: that.data.user_nickName,
        // user_password: '', //待加密
        avatarUrl: that.data.avatar
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

  setUserNickName: function(e){
    this.setData({
      user_nickName: e.detail.value
    })
    console.log(this.data.user_nickName)
  },

  setUserPassword: function(e){
    this.setData({
      user_password: e.detail.value
    })
    console.log(this.data.user_password)
  },

  chooseAvatar: function(){
    var that = this;
    // if (imgs.length >= 9) {
    //   this.setData({
    //     lenMore: 1
    //   });
    //   setTimeout(function () {
    //     that.setData({
    //       lenMore: 0
    //     });
    //   }, 2500);
    //   return false;
    // }
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths[0];
        that.setData({
          avatar: tempFilePaths
        });
      }
    });
  },

  previewAvatar: function (e) {
    var avatar = this.data.avatar;
    wx.previewImage({
      urls: avatar
    })
  },

  deleteAvatar: function (e) {
    this.setData({
      avatar: ''
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.superiorId != 'existed'){
      this.setData({
        superior_id: options.superiorId
      })
      this.userSignUp()
    }
    else{
      this.setData({
        uid: Number(options.uid),
        isChange: true
      })
      this.setUserInfo()
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
    var openid = app.globalData.openId
    var status = app.globalData.haveLoggedIn
    this.setData({
      openid: openid,
      haveLoggedIn: status
    })
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