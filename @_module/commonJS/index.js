/**
 * 1. 원의 넓이를 구하는 공식
 * 2. PI 정의
 * 3. 공식을 통한 결과 얻기
 */

 const { getCircleArea } = require('./mathUtil');
/**
 * ※ 선언되어 있는 mathUtil Module에 대해서 getCircleArea만 require하는 것으로 가져와 사용한다.
 */

 const result = getCircleArea(2);
 console.log(result);