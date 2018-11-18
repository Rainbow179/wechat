const rp =require ('request-promise-native');
const {appID,appsecret} = require('../config');

class Wechat {
  
  async getAccessToken(){
    //定义请求地址
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`;
    //发送请求
    const result = await rp({method:'GET',url,json: true});
    //设置access_token的国企时间,提前五分钟刷新
    result.expires_in = Date.now() + 7200000- 300000;
    return result;
  }
  
  
  // 保存 access_token
  saveAccessToken (filePath,accessToken) {
    return new Promise((resolve,reject)=>{
      writeFile(filePath,JSON.stringify(accessToken),err=>{
        if(!err){
           resolve();
           }else{
          reject('saveAccessToken方法出问题了:'+err);
        }
      })
    })
  }
  
  
  //读取access_token
  
  readAccessToken (filePath){
    return new Promise((resolve,reject)=>{
      readFile(filePath,(err,data)=>{
        //读取的data数据是buffer数据,需要转化程JS数据
        if (!err){
          //先调用toString转化为json字符串
          //JSON.parse将json解析为js对象
          resolve(JSON.parse(data,toString()));
        }else {
          reject('readAccessToken方法出错了:'+ err);
        }
      })
    })
  }
  //判断access_token是否过期
  isValidAccessToken ({expires_in}){
    return Date.now() < expires_in;
  }
  
}

/*
 读取本地保存access_token（readAccessToken）
 - 有
 - 判断是否过期（isValidAccessToken）
 - 过期了, 重新发送请求，获取access_token（getAccessToken），保存下来（覆盖之前的）(saveAccessToken)
 - 没有过期, 直接使用
 - 没有
 - 发送请求，获取access_token，保存下来
 */

(async()=>{
  const w =new Wechat();
  w.readAccessToken('./accessToken.txt')
    .then(async res=>{
      if(w.isValidAccessToken(res)){
           console.log(res);
           console.log('没有过期,直接使用');
         }else{
        //过期了
        const accessToken = await w.getAccessToken();
        await w.saveAccessToken('./accessToken.txt',accessToken);
      }
    })
    .catch(async err=>{
      const  accessToken = await  w.getAccessToken();
      await w.saveAccessToken('./accessToken.txt',accessToken);
    })
  
})()
