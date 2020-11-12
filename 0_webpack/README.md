# Webpack
---

## Webpack이란? 
웹 어플리케이션을 구성할 때 도움을 주는 도구들이다.
웹팩은 모듈들을 다룬다.
여러가지 모듈들을 의존성을 안전하게 유지시키면서, 하나의 파일로 묶어준다. 이 과정은 bundle이라 칭한다. 

### 미리 정리
- Entry : 의존을 가진 모듈들의 참조관계에 의존성 그래프를 만들고, 어떤 모듈을 시작 node 정한 뒤 번들과정을 수행한다.
- outPut : 의존성 그래프를 만들고, 번들과정을 거치면 Output에서 설정된 옵션들로 파일이 생성된다.
- Mode : build 환경을 구분 지을 수 있다.
- Loader : mode를 입력 받아 처리하는 환경(js, json 을 기반으로 하기 때문에 다른 파일(css, sass, file)들을 로더를 통해 js형태로 변환해주어야 한다.)
- Plugin : 객체를 할당하면 plugin을 활용할 수 있다.

### 기본구조

웹팩은 bundle 구조를 띈다.
웹펙이 바라보는 Module
- js
- sass
- hbs
- jpg, png
- ...

### i) bundle 파일 생성
1. npm init -y  : package.json 생성
2. npm install webpack webpack-cli --save-dev : webpack 다운로드
3. src, dist 폴더 생성
4. src에 js파일들을 이동
5. npx webpack --target=node  : bundle node 설정 후 bundling
6. dist 폴더에 생성됨을 확인(미설정시 main.js)

### ii) webpack.config로 bundle 파일 생성
1. webpack.config.js로 파일 생성

```
const path =require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    target: 'node'
}
```

    ※ entry로 bundle 노드를 설정해주고, index.js 기준으로 bundle 파일을 생성.

    ※ target은 node로 칭하는데, 파일을 생성할 때 node 기준이기에 작성됨.

    ※ path.resolve(__dirname, 'dist')는 path의 내장으로 __dirname을 가지고 있는데 파일 경로를 뜻함.

    ※ .resolve()는 __dirname이 xxx/xxxx/xxx/ .... 이와같은 패턴이라면 뒤에 오는 "dist" 문자열도 같은 패턴으로 붙여줌.

2. npx webpack --target=node  : 재생성


### package.json

1. 어플리케이션 내부에 직접 포함되는 모듈( dependencies: -save )
2. 개발 과정에 필요한 모듈 ( devDependencies: --save )

만약 **node_modules 폴더**가 형성되어 있지 않다면 npm install을 통해서 package.json에 등록되어 있는 관련된 모듈들이 일괄 설치된다.

ex) 만약 package.json만 공유했을 때 일일히 이름을 쳐서 -save, --save로 인스톨해주지 않아도 자동 설치할 수 있다.

### Loader

의존관계를 갖는 다양한 모듈들을 입력받아 처리하는 역할

```
module.exports = {
    module: {
        rules: [loader1, loader2]
    }
}
```
rules는 배열 타입을 갖고 loader를 담을 수 있는 형태이다.

#### css-loader, style-loader 
ii_loader에서는 두 가지의 css, style loader을 가져올 것인데, 
- css loader : css를 번들링 할 수 있게 js로 변환
- style loader : js로 변환된 css 내용들을 동적으로 DOM에 추가

### 사용이유
-


npm 명령어로 넣어야한다.

```
npm install style-loader css-loader --save-dev
```

**packge.json**

```
  "scripts": {
    "build": "webpack"
  },
```
'npm run build'라는 명령어로 "webpack"을 동작시킬 수 있다.

**webpack.config.js**

```
const path = require('path');

module.exports = {
    entry: './index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [
                    'style-loader',
                    ,{
                        loader: 'css-loader',
                        options: {
                            modules: true
                        }
                    }
                ]
            }
        ]
    },
    mode: 'none'
}
```
각기 다른 형태의 웹 브라우저를 위해 css를 초기화 시켜준다.
위 장에서는 normalize css를 다뤄본다.

```
npm install normalize.css --save
```

모듈을 설치 후 ``` import 'normalize.css'; ``` 선언을 해주면 된다.

1. index.css를 css-loader를 이용하여 .js 코드로 변환시켜준다.
2. ``` import styles from './index.css'; ``` 원하는 css파일을 가져온다.
3.  element.classList = styles.helloWebpack(CSS 명);
4. css가 로더에 의해 .js파일로 적용이 된다.

마지막으로 'style-loader'도 옵션을 적용한다.

**webpack.config.js**

```
use: [
    {
        loader: 'style-loader',
        options: {
            injectType: 'singletonStyleTag'
        }
    },
    ...
]
```

설정하면 bundling이 정상적으로 되는 것을 확인할 수 있다.


