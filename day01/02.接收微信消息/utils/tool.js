//方法工具

module.exports = {
  //接收客户数据的方法
  getUserDataAsync (req) {
    return new Promise(resolve=>{
      //接收数据
      let result ='';//定义一个变量来保存data的数值,因为是要接收多次
      req
        .on('data',data=>{
        //req.on(data)来接收客户端的数据
        console.log(data.toString());//因为返回得值是buffer,是二进制,所以要转化为字符串
        result += data.toString();
        })
        .on('end',() =>{
          console.log('用户数据接收完毕');
          resolve(result);//需要将用户的数据返出去
        })
    })
  }
  
  
  
  
  
  
  
}
