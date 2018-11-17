const express = require('express');
const sha1=require('sha1');
const {getUserDataAsync} = require('./utils/tool');
const app = express();
//定义了config 来保存微信里的东西

/*
 1. 搭建开发者服务器, 使用中间件接受请求
 2. 默认localhost:3000访问本地服务器， 需要一个互联网能够访问的域名地址
 借助ngrok工具，能将本地地址映射为互联网能访问的域名地址 ngrok http 3000
 3. 测试号管理页面填写服务器配置：
 url：通过ngrok映射的地址   http://3389687c.ngrok.io
 token：参与微信签名加密的参数， 自己定义，尽量复杂
 4. 验证微信服务器有效性
 目的：验证消息来自于微信服务器， 同时返回一个特定参数给微信服务器（告诉微信服务器我这里准备ok）
 
 - 将参数签名加密的三个参数（timestamp、nonce、token）组合在一起，按照字典序排序
 - 将排序后的参数拼接在一起，进行sha1加密
 - 加密后的到的就是微信签名，将其与微信发送过来的微信签名对比，
 - 如果一样，说明消息来自于微信服务器，返回echostr给微信服务器
 - 如果不一样，说明消息不是微信服务器发送过来的，返回error
 
 */
const config = {
  appID:'wx5018ef00cb480987',
  appsecret:'f1baf1e7d26c24f21d427eb0bbc18bab',
  token:'zxywlw179'
}

//利用中间件来获取参数
app.use(async (req,res,next)=>{
  console.log(req.query);
  
  /*
   { signature: 'ff299dfb0059ee0359f0851e30d9ae8ee439790a',  微信签名
   echostr: '3330701733801130972',  微信后台生成随机字符串
   timestamp: '1542349780',   时间戳
   nonce: '1704777037' }      微信后台生成随机数字
   */
  
  //获取请求参数
  const {signature,echostr,timestamp,nonce} =req.query;//解构赋值
  const {token} = config;
  
  // - 将参数签名加密的三个参数（timestamp、nonce、token）组合在一起，按照字典序排序
  // const arr = [timestamp, nonce, token].sort();
  // console.log(arr);
  //
  // const str = sha1(arr.join(''));
  // console.log(str);
  
  const str =sha1([timestamp,nonce,token].sort().join(''));//sort对数组排序,join 将数组变成字符串
  /*
   微信服务器会发送两种类型的消息给开发者
   1. GET 验证服务器有效性逻辑
   2. POST 转发用户消息
   */
  
  
  if(req.method === 'GET'){
    if (signature === str) {
      //说明消息来自于微信服务器
      res.end(echostr);//没有任何数据没响应的用end,有响应的用send ,数据中有json信息的用json
    } else {
      //说明消息不来自于微信服务器
      res.end('error');
    }
         
  }else if (req.method==='POST'){
    if(signature !==str){
        res.end('error');
        return;

    }
  
    //用户发送的消息在请求体
    const userData = await getUserDataAsync(req);
    console.log(userData);
    
    /*
     <xml>
     <ToUserName><![CDATA[gh_4fe7faab4d6c]]></ToUserName>    开发者的微信号
     <FromUserName><![CDATA[oAsoR1iP-_D3LZIwNCnK8BFotmJc]]></FromUserName>  微信用户openid
     <CreateTime>1542355200</CreateTime>   发送消息的时间戳
     <MsgType><![CDATA[text]]></MsgType>   消息类型
     <Content><![CDATA[111]]></Content>    消息的具体内容
     <MsgId>6624365143243452763</MsgId>    消息id，微信服务器会默认保存3天微信用户发送的消息，在此期间内通过这id就能找到当前消息
     </xml>
     */
    
    //将用户发送过来的xml数据解析为js对象
    
  //   const  jsData = await
  //
  //
  //
  }
  

  
  
})








app.listen(3000, err => {
  if (!err) console.log('服务器启动成功了~');
  else console.log(err);
})
