# Axios
---
**axios는 비동기적으로 요청과 응답을 받게 해줍니다.**

**명령어 : npm i axios**



## 선언부

import axios from 'axios';


### vuex > state

```
    state: {
        users: []
    },
```

state에서 데이터가 들어갈 공간을 만듭니다.



### vuex > actions

```
actions: {
        getUsers({commit}){
            axios.get('https://jsonplaceholder.typicode.com/users').then(res => {
                commit('SET_USERS', res.data);
            });
        },
}
```

**actions는 데이터를 비동기적으로 요청, 응답 받는 공간입니다.**

axios.get( url ) 이나 axios.post( url, value ) 로 값을 요청, 응답 받을 수 있게 됩니다.

해당 url은 데이터를 json형태로 제공해주는 사이트이며 /users 데이터들을 요청받게됩니다.
commit을 통해 mutations에 접근하여 데이터들을 실제로 변경받게 합니다.



### vuex > mutations

```
SET_USERS

        SET_USERS(state, users){
            state.users = users;
        },
```

데이터를 실제로 변경됨을 적용시키는데, 

**'vue파일 → actions → mutations '** 순으로 데이터 가공이 이루어집니다. 



### .vue 

```
<template>
  <div>
      <h3> User List </h3>
      <div v-for="user in users" :key="user.id">
          {{ user.name }}
      </div>
  </div>
</template>

<script>
export default {
    computed: {
        users() {
            return this.$store.state.users;
        }
    },
    methods: {
        getUsers(){
            this.$store.dispatch('getUsers');
        }
    },
    created(){
        this.getUsers();
    }
}
</script>
```

![](https://images.velog.io/images/ieed0205/post/a97cc372-9995-4a6a-afa2-45082ae6e5b6/a.PNG)

