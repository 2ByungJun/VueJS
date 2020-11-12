/**
 * CommonJS(CLS) 모듈
 * 
 * require(), module.exports를 이용
 */

 const { getCircleArea } = require('./mathUtil');

 const result = getCircleArea(2);
 console.log(result);


//  const mathUtil = require('../mathUtil');

//  const result = mathUtil.getCircleArea(2);
//  console.log(result);