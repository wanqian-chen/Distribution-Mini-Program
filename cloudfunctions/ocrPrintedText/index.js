// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.ocr.printedText({
      type: event.type,
      imgUrl: event.imgUrl
    })
    return result
  } catch (err) {
    return err
  }
}
