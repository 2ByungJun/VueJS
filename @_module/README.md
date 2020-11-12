# Module
---

## 모듈이란? 
A.js 와 B.js의 파일이 두개가 존재 했을 때,

A.js 파일 내용들을 내보내고 ---------------> B.js가 가져오는 방식을 뜻한다.

가져올 수 있는 방식은 **CommonJS 와 ESM** 방식이 있다.



### CommonJS(이하 CLS) 모듈
**require(), module.exports**를 이용해서 공유하게 된다.



**- mathUtil.js ( 내보내는 A.js )**

```
/**
 * 수학 공식을 나타내는 모듈
 */

const PI = 3.14;
const getCircleArea = r => r * r * PI;
const getSquareArea = d => d * d;

 module.exports = {
     PI,
     getCircleArea,
     getSquareArea
 }
```


module은 기본적으로 js에 존재하는 전역모듈이다.
다음과 같이 사용하면 속해있는 모든 파일들을 내보낼 수 있다. 

**- index.js ( 가져오는 B.js )**

```
 const { getCircleArea } = require('../mathUtil');

 const result = getCircleArea(2);
 console.log(result);
```

경로에 .js 는 기본적으로 제공되게 되므로 기입을 생략해도 된다.

CommonJS에서는 가져올 때 require()를 활용한다.
공유되어있는 getCircleArea 만 가져오는 것이 되며 export된 모든 내장함수들을 사용하고 싶다면 다음과 같이 선언하게 된다.

```
 const mathUtil = require('../mathUtil');

 const result = mathUtil.getCircleArea(2);
 console.log(result);
```


**상대경로와 절대경로**가 존재한다.

만약 같은 폴더 선상에 위치한다면 상대경로로  

```
require('./mathUtil');
```

표현이 가능하다.



하지만 상위 폴더에 mathUtil.js 파일이 존재하는 경우에는 

```
require('../mathUtil');
```


그 밖에 정확한 위치를 해야한다면 절대경로를 사용해야할 것이다.



### ESM Scripts(ESM) 모듈
**import, export**로 이용하게 된다. commonJS 는 구버전이기에 Vue.js에는 ESM 모듈을 사용한다.



```
 설치 : npm install esm
 실행 : node -r esm index.js
```


```
 export{
    PI,
    getCircleArea,
    getSquareArea
 }
```


**일반적으로 export로 선언**하게 되면, import는 다음과 같이 받아야한다.

```
import {getCircleArea, getSquareArea} from '../mathUtil';
```


```
 export default{
    PI,
    getCircleArea,
    getSquareArea
 }
```


해당 **defalut가 추가**되면, 

```
 import mathUtil from '../mathUtil';
```

전체를 불러올 수 있게 된다.