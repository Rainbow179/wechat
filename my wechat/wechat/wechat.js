const rp =require ('request-promise-native');
const {writeFile, readFile} = require('fs');
const {appID,appsecret} = require('../reply/config');
const api =require('../api/index');

class Wechat {
  /**
   * 获取access_token
   * @return {Promise<result>}
   */
  
  async getAccessToken(){
    //定义请求地址
    const url = `${api.accessToken}$appid=${appID}&secret=${appsecret}`;
    //发送请求
    const result = await rp({method:'GET',url,json: true});
    //设置access_token的过期时间,提前五分钟刷新
    result.expires_in = Date.now() + 7200000- 300000;
    return result;
  }
  
  /**
   * 保存access_token
   * @param filePath  要保存的文件路径
   * @param accessToken  要保存的凭据
   * @return {Promise<any>}
   */
  saveAccessToken (filePath,accessToken) {
    return new Promise((resolve,reject)=>{
      //js对象没办法存储，会默认调用toString() --->  [object Object]
      //将js对象转化为json字符串
      writeFile(filePath,JSON.stringify(accessToken),err=>{
        if(!err){
           resolve();
           }else{
          reject('saveAccessToken方法出问题了:'+err);
        }
      })
    })
  }
  
  
  /**
   * 读取access_token
   * @param filePath 文件路径
   * @return {Promise<any>}
   */
  
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
  /**
   * 判断access_token是否过期
   * @param accessToken
   * @return {boolean}
   */
  isValidAccessToken ({expires_in}) {
    /*if (Date.now() >= expires_in) {
     //说明过期了
     return false
     } else {
     //说明没有过期
     return true
     }*/
    return Date.now() < expires_in;
  }
  /**
   * 返回有效access_token的方法
   * @return {Promise<accessToken>}
   */
  fetchAccessToken () {
    if(this.access_token && this.expires_in && this.isValidAccessToken(this)){
      console.log('进来啦~');
      //说明access_token是有效的
      return Promise.resolve({access_token:this.access_token,expires_in:this.expires_in});
      
    }
      
      //最终目的返回有效的access_token
      return this.readAccessToken('./accessToken.txt')
        .then(async res=>{
          if(this.isValidAccessToken(res)){
            //没有过期直接使用
            
            return res;
                 
             }else {
            //过期了
            
            const accessToken = await this.getAccessToken();
            await this.saveAccessToken('./accessToken.txt',accessToken);
            //作为then 函数返回值,promise 对象包着accessToken
            return accessToken;
          }
        })
      
        .catch(async err=> {
          const accessToken = await this.getAccessToken();
          await  this.saveAccessToken('./accessToken.txt', accessToken);
          return accessToken;
        })
        .then(res => {
          this.access_token = res.access_token;
          this.expires_in = res.expires_in;
          
          return Promise.resolve(res);
        })
    
  }
  
  /**
   * 创建自定义菜单
   * @param menu
   * @return {Promise<*>}
   */
  
  async createMenu (menu) {
    try {
      //获取access_token
      const {access_token} = await this.fetchAccessToken();
      //定义请求地址
      
      const url = `${api.menu.create}access_token=${access_token}`;
      
      //发送请求
      
      const result = await rp({method:'POST',url,json:true,body:menu});
      return result;
    } catch (e) {
      return 'createMenu 方法出了问题:' + e;
    }
  }
  /**
   * 删除菜单
   * @return {Promise<*>}
   */
  
  async deleteMenu () {
    try {
      //获取access_token
      const {access_token} =await this.fetchAccessToken();
      //定义请求地址
  
      const url = `${api.menu.delete}access_token=${access_token}`;
      //发送请求
      const result = await rp({method:'GET',url,json:true});
      
      return result;
    }catch (e) {
      return 'deleteMenu方法出了问题:' +e;
    }
  }
  
  /**
   * 创建标签
   * @param name 标签名
   * @return {Promise<*>}
   */
  async createTag (name) {
    try {
      const {access_token} = await this.fetchAccessToken();
      
      const url = `${api.tag.create}access_token=${access_token}`;
      const result =await rp({method:'POST',url,json:true,body:{tag:{name}}});
      return result;
    } catch (e) {
      return 'createTag方法出了问题:' + e;
    }
  }
  //得到用户信息
  async getTagUser (tagid,next_openid='') {
    try {
      const {access_token} = await  this.fetchAccessToken();
      const url = `${api.tag.getUsers}access_token=${access_token}`;
      return await rp ({method:'POST',url,json:true,body:{tagid,next_openid}});
    } catch (e) {
      return 'getTagUsers方法出了问题:' + e ;
    }
  }
  //获取用户列表
  
  async batchUsersTag (openid_list,tagid) {
    try{
      const {access_token} = await this.fetchAccessToken();
      const url = `${api.tag.batch}access_token=${access_token}`;
      return await rp ({method:'POST',url,json:true,body:{tagid,openid_list}});
    } catch (e) {
      return 'batchUsersTag方法除了问题' + e;
    }
  }
  
}



(async() => {
  //读取本地保存的access_token
  
  const w = new Wechat();
  let result1 = await w.createMenu(require('./menu'));
  console.log(result1);
  //粉丝列表的设置
  let result2 = await w.batchUsersTag([
    'oAsoR1rnW1QrtFPSqsClTTl2stE0',
    'oAsoR1ktRa8MGiuxEC5RphecPXKs',
    'oAsoR1sBFZ1uvG4Qt64IbhDZLZFU',
    'oAsoR1kvRB5hCjHOKCsNpb78aeyE',
    'oAsoR1iP-_D3LZIwNCnK8BFotmJc'
  ], result1.tag.id);
  console.log(result2);
  let result3 = await  w.getTagUsers(result1.tag.id);
  console.log(result3);
})()



  
  
  
  
  
  
  
  
  
  
  
  
  


