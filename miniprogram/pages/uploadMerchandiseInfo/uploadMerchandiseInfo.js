// pages/uploadMerchandiseInfo/uploadMerchandiseInfo.js

// const { promises } = require("dns")

const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mid_now: null,
    imgs_now: [],
    final_num: null,
    merchandise_title: '',
    merchandise_titleTwo: '',
    merchandise_price: '',
    merchandise_detail: '',
    imgs: [],
    del_imgs: [],
    all_strategy: [],
    sid: null
  },

  setMerchandiseTitle: function(e){
    this.setData({
      merchandise_title: e.detail.value
    })
  },

  setMerchandiseTitleTwo: function(e){
    this.setData({
      merchandise_titleTwo: e.detail.value
    })
  },

  setMerchandisePrice: function(e){
    this.setData({
      merchandise_price: e.detail.value
    })
  },

  setMerchandiseDetail: function(e){
    this.setData({
      merchandise_detail: e.detail.value
    })
  },

  uploadInfo: function(){
    var file_path = this.data.imgs
    var that = this
    // var num = (Math.random() * 100).toFixed(0)

    db.collection('id_status').where({
      id_name: 'merchandise_id'
    }).get()
    .then(res => {
      var num = res.data[0].now_id + 1
      var upload = []
      var cloud_path = []

      for (let i = 0 ; i < file_path.length ; i++){
        let cloud_path_t = 'merchandise_img/' + num + '_' + i + '.jpg'
        let upload_t = wx.cloud.uploadFile({
          cloudPath: cloud_path_t, // 上传至云端的路径
          filePath: file_path[i], // 小程序临时文件路径

          // success: res => {
          //   // 返回文件 ID
          //   console.log(res.fileID)
          // },
          // fail: console.error
        })
        upload.push(upload_t)
        cloud_path.push('cloud://cloud1-4gsx799hc2645fc8.636c-cloud1-4gsx799hc2645fc8-1307835410/' + cloud_path_t)
      }

      // for(let i = 0 ; i < file_path.length ; i++){
      //   wx.cloud.uploadFile({
      //     cloudPath: 'merchandise_img/' + num + '_' + i + '.jpg', // 上传至云端的路径
      //     filePath: file_path[i], // 小程序临时文件路径
      //     success: res => {
      //       // 返回文件 ID
      //       console.log(res.fileID)
      //     },
      //     fail: console.error
      //   })
      // }

      db.collection('id_status').where({
        id_name: 'merchandise_id'
      }).update({
        data: {
          now_id: _.inc(1)
        }
      })
  
      Promise.all(upload).then(res => {
        db.collection('merchandise').add({
          data: {
            mid: num,
            title: that.data.merchandise_title,
            titleTwo: that.data.merchandise_titleTwo,
            price: Number(that.data.merchandise_price),
            detail: that.data.merchandise_detail,
            img: cloud_path,
            strategy_id: that.data.sid
          }
        }).then(res => {
          that.setData({
            merchandise_title: '',
            merchandise_titleTwo: '',
            merchandise_price: '',
            merchandise_detail: '',
            imgs: [],
          })
          that.setStrategy()
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
      
    })


  },

  modifyInfo: function(){
    var mid = this.data.mid_now
    var that = this
    var start_num = this.data.final_num + 1
    var imgs = this.data.imgs

    var del_list = []
    var del_index = this.data.del_imgs
    for(let i = 0; i < del_index.length; i++){
      let del_list_t = 'cloud://cloud1-4gsx799hc2645fc8.636c-cloud1-4gsx799hc2645fc8-1307835410/merchandise_img/' + mid + '_' + del_index[i] + '.jpg'
      del_list.push(del_list_t)
    }

    wx.cloud.deleteFile({
      fileList: del_list,
      success: res => {
        // handle success
        console.log(res.fileList)
      },
      fail: console.error
    })

    var pattern = /^cloud:\/\/.*/
    var upload = []
    var cloud_path = []
    for(let j = 0; j < imgs.length; j++){  
      if(!pattern.test(imgs[j])){
        let cloud_path_t = 'merchandise_img/' + mid + '_' + start_num + '.jpg'
        let upload_t = wx.cloud.uploadFile({
          cloudPath: cloud_path_t, // 上传至云端的路径
          filePath: imgs[j], // 小程序临时文件路径
        })
        upload.push(upload_t)
        cloud_path.push('cloud://cloud1-4gsx799hc2645fc8.636c-cloud1-4gsx799hc2645fc8-1307835410/' + cloud_path_t)
        start_num++;
      }
      else{
        cloud_path.push(imgs[j])
      }
    }

    Promise.all(upload).then(res => {
      db.collection('merchandise').where({
        mid: mid
      }).update({
        data: {
          title: that.data.merchandise_title,
          titleTwo: that.data.merchandise_titleTwo,
          price: Number(that.data.merchandise_price),
          detail: that.data.merchandise_detail,
          img: cloud_path,
          strategy_id: that.data.sid
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
            // ({
            //   url: '../manageMerchandise/manageMerchandise'
            // })
          }, 2000)
        })
      })
    })
  },

  confirmInfo: function(){
    if(this.data.mid_now == null){
      this.uploadInfo()
    }
    else{
      this.modifyInfo()
    }
  },

  chooseImg: function(){
    var that = this;
    var imgs = this.data.imgs;
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
      count: 9, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        var imgs = that.data.imgs;
        for (var i = 0; i < tempFilePaths.length; i++) {
          if (imgs.length >= 9) {
            that.setData({
              imgs: imgs
            });
            return false;
          } else {
            imgs.push(tempFilePaths[i]);
          }
        }
        // console.log(imgs);
        that.setData({
          imgs: imgs
        });
      }
    });
  },

  // 删除图片
  deleteImg: function (e) {
    var imgs = this.data.imgs;
    var index = e.currentTarget.dataset.index;
    var del_imgs = this.data.del_imgs
    del_imgs.push(index)
    
    imgs.splice(index, 1);
    this.setData({
      imgs: imgs,
      del_imgs: del_imgs
    });
  },

  previewImg: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var imgs = this.data.imgs;
    wx.previewImage({
      //当前显示图片
      current: imgs[index],
      //所有图片
      urls: imgs
    })
  },

  setMerchandiseNow: function(mid){
    var that = this

    db.collection('merchandise').where({
      mid: mid
    }).get()
    .then(res => {
      let mer_info = res.data[0]
      let final = mer_info.img[mer_info.img.length-1]
      let final_num = final.split("_").pop()
      final_num = final_num.split(".")[0]

      this.setStrategy(Number(mer_info.strategy_id))

      that.setData({
        merchandise_title: mer_info.title,
        merchandise_titleTwo: mer_info.titleTwo,
        merchandise_price: mer_info.price,
        merchandise_detail: mer_info.detail,
        imgs: mer_info.img,
        imgs_now: mer_info.img,
        mid_now: mid,
        final_num: final_num
      })
    })
  },

  setStrategy: function(stra_id){
    var that = this
    db.collection('sale_strategy').get()
    .then(res => {
      let strategy = res.data
      let all_strategy = []
      for(let i = 0; i < strategy.length; i++){
        let strategy_t = {}
        strategy_t['id'] = strategy[i].sid
        strategy_t['name'] = strategy[i].name
        strategy_t['detail'] = strategy[i].strategy
        console.log(typeof(strategy[i].sid))
        if(strategy[i].sid == stra_id){
          strategy_t['checked'] = true
        }
        all_strategy.push(strategy_t)
      }
      that.setData({
        all_strategy: all_strategy,
        sid: stra_id
      })
    })
  },

  radioChange: function(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    this.setData({
      sid: Number(e.detail.value)
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var options_str = JSON.stringify(options)
    if(options_str != '{}'){
      this.setMerchandiseNow(Number(options.mid)) // include setStrategy()
    }
    else{
      this.setStrategy()
    }

    // try{
    //   if(options.mid != undefined){
    //     this.setMerchandiseNow(Number(options.mid))
    //   }
    // } catch(err){
    //   // console.error(err)
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