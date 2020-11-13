# Vuex
---
## Vuex
: Vue.js 애플리케이션에 대한 상태 관리 **패턴 + 라이브러리**입니다.



Vuex를 사용하지 않았을 때, 

**App.vue**

```
      todos: [
        {id:1, name:"안녕"},
        {id:2, name:"하이"}
      ],
```


App.vue에서 데이터를 선언하여 받아오면 다른 참조하는 vue 컴포넌트들은 emit이나 해당 데이터들을 App.vue를 거쳐서 가져와야한다. 그럼 어떤 문제가 발생하는지 다음 그림으로 보이겠습니다.
![](https://images.velog.io/images/ieed0205/post/eb498e50-53c4-4d2c-9546-084e6606eec1/1.PNG)


  동작을 하면서 App.js에서 가져오는 것을 알 수 있지만 코드가 더 복잡해진다면, 굉장히 용이하지 않는 방법입니다. 그래서 Vuex를 이용하여 데이터를 다루는 저장소를 하나 만들게 됩니다.



  그림으로 결과를 나타내면 다음과 같습니다.

![](https://images.velog.io/images/ieed0205/post/0df750a1-f962-4b32-8e96-092a8fdc1c44/2.PNG)



Store라는 참조할 수 있는 .js 파일은 만든 후 상태관리를 해주어 일괄적으로 임시 DB의 모양으로 형성하게 됩니다. 다음을 설정하기 위해선 main.js에 vuex를 사용한다고 선언해주어야 합니다.



## Vuex 적용


**명령어 : npm i vuex**



1. 폴더 생성 'store'
2. 파일 생성 index.js'

3. 하단 절차대로 수행

**main.js**

```
import App from './App.vue'
import store from './store'

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
store를 Vue를 객체를 생성할 때 사용한다고 선언한다.

store>index.js

import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex); // Vue에 Vuex 플러그인을 사용할 것이라 명시

export default new Vuex.Store({
    // 데이터가 들어가는 곳
    state: {

    },
    // 데이터가 실제로 변경되는 위치(규약)
    mutations: {

    },
    // 함수가 들어가는 곳(비동기적 처리)
    actions: {

    },
    // vue의 컴포턴트와 비슷
    getters: {

    }
})
```


**state(index.js)**

```
    state: {
        todos: [
            {id: 1, text: 'buy a car', checked:false},
            {id: 2, text: 'play game', checked:false},        
          ]
    },
```


**state 접근(.vue)**

```
export default {
    computed: {
        todos(){
            return this.$store.state.todos;
        },
    },
}
```

state의 데이터를 가져오기 위해선  computed의 return 값에 this.$store.state.todos 로 접근이 가능하다



**mutations(index.js)**

```
    mutations: {
        ADD_TODO(state, value){
            state.todos.push({
                id: Math.random(),
                text: value,
                checked: false
            });
        },
    }
```


**mutations 접근(.vue)**

```
this.$store.commit('ADD_TODO', e.target.value);
this.$store.commit(' store의 함수명', 매개변수 )으로 접근이 가능하다.
```

**actions(index.js)**

```
    actions: {
        addTodo({commit}, value){
            // axios.post()
            setTimeout(function (){
                commit('ADD_TODO', value);
            }, 2000);
        }
    },
```

actions는 함수들을 비동기적으로 처리시켜주는데 {commit} 자리에는 content가 들어가게 된다.
content는 { commit, dispatch... } 다양하게 포함되어 있다.

주로 비동기처리 작업을 하게 되는데, 영상에서는 setTimeout()으로 요청과 응답을 받는 식으로 사용하였지만, value값을 post방식으로 주고받아 응답이오면 진행되게 하는 방식을 actions에서 사용한다.



**actions 접근(.vue)**

```
this.$store.dispatch('addTodo', e.target.value);
```

actions를 접근할 때는 dispatch를 사용한다. 



**getters(index.js)**

```
    getters: {
        numberOfCompletedTodo: state => {
            return state.todos.filter(todo => todo.checked).length;
        }
    }
```

state로 시작하게되며, 모든 .vue에서 해당 메서드를 사용할 수 있게 해준다.



**getters접근(.vue)**

```
    computed: {
        numberOfCompletedTodo(){
            return this.$store.getters.numberOfCompletedTodo;
        }
    }
```


