const express = require('express');
const app = express();
const sha1=require('sha1');

const config = {
  appID:'wx5018ef00cb480987',
  appsecret:'f1baf1e7d26c24f21d427eb0bbc18bab',
  token:'zxywlw179'
}

app.use((req,res,next)=>{
  console.log(req.query);
  
  const {signature,echostr,timestamp,nonce} =req.query;
  const {token} = config;
  
  // - 将参数签名加密的三个参数（timestamp、nonce、token）组合在一起，按照字典序排序
  const arr = [timestamp, nonce, token].sort();
  console.log(arr);
  
  const str = sha1(arr.join(''));
  console.log(str);
  
  if (signature === str) {
    //说明消息来自于微信服务器
    res.end(echostr);
  } else {
    //说明消息不来自于微信服务器
    res.end('error');
  }
  
})





app.listen(3000, err => {
  if (!err) console.log('服务器启动成功了~');
  else console.log(err);
})
