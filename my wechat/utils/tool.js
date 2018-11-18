//方法工具
const {parseString} = require('xml2js');

module.exports = {
  //接收客户数据的方法
  getUserDataAsync (req) {
    return new Promise(resolve => {
      //接收数据
      let result = '';//定义一个变量来保存data的数值,因为是要接收多次
      req
        .on('data', data => {
          //req.on(data)来接收客户端的数据
          console.log(data.toString());//因为返回得值是buffer,是二进制,所以要转化为字符串
          result += data.toString();
        })
        .on('end', () => {
          console.log('用户数据接收完毕');
          resolve(result);//需要将用户的数据返出去
        })
    })
  },
  parseXMLDataAsync (xmlData) {
    return new Promise((resolve, reject) => {
      parseString(xmlData, {trim: true}, (err, data) => {
        if (!err) {
          resolve(data);
        } else {
          reject('parseXMLDataAsync方法出了问题：' + err);
        }
      })
    })
  },
  formatMessage ({xml}) {
    // const {xml} = jsData
    //去掉xml
    //去掉[]
    let result = {};
    //遍历对象
    for (let key in xml) {
      //获取属性值
      let value = xml[key];
      //去掉[]
      result[key] = value[0];
    }
    
    return result;
  }
}