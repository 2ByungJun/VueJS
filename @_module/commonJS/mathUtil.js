const PI = 3.14;
const getCircleArea = r => r * r * PI;

/**
 * module 은 전역적으로 선언되어 있다.
 * module.exports는 해당 파일(mathUtil.js)을 연다! 라는 뜻으로 해석된다.
 * 
 * 현재 PI 상수와 gerCircleArea 메서드가 열려있다.
 */

 /**
  * exports로 단체로 내보내기
  */
module.exports = {
    PI,
    getCircleArea
}

/**
 * exports로 개별적으로 내보내기
 */
// exports.PI = PI;
// exports.getCircleArea = getCircleArea;