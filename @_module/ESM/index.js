/**
 * 1. npm install esm
 * 2. node -r esm index.js
 */

 //const { getCircleArea } = require('./mathUtil');
 import mathUtil from './mathUtil';

 const result = mathUtil.getCircleArea(2);
 console.log(result);