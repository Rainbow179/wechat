
const sha1 = require('sha1');
const {getUserDataAsync, parseXMLDataAsync,formatMessage} = require('../utils/tool');
const template =require('./template');
const reply =require('./reply');
const {token} =require('./config');


module.exports=( )=>{
  return async (req, res, next) => {
    console.log(req.query);
    //获取微信内部请求参数
    const {signature, echostr, timestamp, nonce} = req.query;//解构赋值
    // - 将参数签名加密的三个参数（timestamp、nonce、token）组合在一起，按照字典序排序
    const str = sha1([timestamp, nonce, token].sort().join(''));//sort对数组排序,join 将数组变成字符串
    /*
     微信服务器会发送两种类型的消息给开发者
     1. GET 验证服务器有效性逻辑
     2. POST 转发用户消息
     */
    if (req.method === 'GET') {
      if (signature === str) {
        //说明消息来自于微信服务器
        res.end(echostr);//没有任何数据没响应的用end,有响应的用send ,数据中有json信息的用json
      } else {
        //说明消息不来自于微信服务器
        res.end('error');
      }
      
    } else if (req.method === 'POST') {
      if (signature !== str) {
        res.end('error');
        return;
      }
      
      
      //用户发送的消息在请求体
      const xmlData = await getUserDataAsync(req);
      console.log(xmlData);
      
      //将xml信息转换成js信息
      const jsData = await parseXMLDataAsync(xmlData);
      console.log(jsData);
      
      
      //格式化数据
      const message = formatMessage(jsData);
      console.log(message);
      /*
       { ToUserName: 'gh_4fe7faab4d6c',
       FromUserName: 'oAsoR1iP-_D3LZIwNCnK8BFotmJc',
       CreateTime: '1542356422',
       MsgType: 'text',
       Content: '333',
       MsgId: '6624370391693488478' }
       */
      
      
      
      const options = reply(message)
      const replyMessage =template(options);
      console.log(replyMessage);
      res.send(replyMessage);
      
    }else {
      res.end('error');
    }
    
    
  }
  
}