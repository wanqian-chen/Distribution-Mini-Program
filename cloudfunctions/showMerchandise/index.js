// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // const wxContext = cloud.getWXContext()
  const fileList = ['cloud://cloud1-4gsx799hc2645fc8.636c-cloud1-4gsx799hc2645fc8-1307835410/img/arrow.png',]
  const result1 = await cloud.getTempFileURL({fileList})

  return {
    result1
    // event,
    // openid: wxContext.OPENID,
    // appid: wxContext.APPID,
    // unionid: wxContext.UNIONID,
  }
}