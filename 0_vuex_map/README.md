# Map...
---

Vuex에서 일반직으로 state의 데이터들을 components로 가져오고 싶으면 코드를 다음과 같이 작성해야합니다.

### mapState 사용 전

```
export default {
    computed: {
        users() {
            return this.$store.state.users;
        },
        todos() {
            return this.$store.state.todos;
        }
    },
 }
```

하지만 매번 이렇게 가져오는 것을 막아주기 위해 vuex에서는 mapState를 제공합니다.

### mapState 사용 후
```
import { mapState } from 'vuex';

export default {
    computed: {
        ...mapState([
            'users',
            'todos'
        ])
    },
}
```
구조 분해를 사용해 'vuex'에서 원하는 모듈만 가져오게 되고,
computed로 값들을 반환해올 수 있게 ...mapState([])를 사용합니다.

혹시 이름을 변경하고 싶다면 다음과 같이 사용합니다.

```
    computed: {
        ...mapState([
            'users',
            {people: 'users'}
        ])
    },
```
그렇담 users 데이터들이 people라는 이름으로 담기게 됩니다.

### mapActions
마찬가지로 vuex에서는 state만 있는 것이 아니라 actions, getters... 등 등 많습니다.
몰론 mapState처럼 동일하게 사용이 가능합니다.

```
    methods: {
        ...mapActions([
            'getUsers'
        ])
    }
```
### store.state
store.state는 다음과 같이 선언되어있습니다.

```
export default new Vuex.Store({
    // 데이터가 들어가는 곳
    state: {
        todos: [
            {id: 1, text: 'buy a car', checked:false},
            {id: 2, text: 'play game', checked:false},        
          ],
        users: []
    },
     actions: {
        getUsers({commit}){
            axios.get('https://jsonplaceholder.typicode.com/users').then(res => {
                commit('SET_USERS', res.data);
            });
        },
    }
});
```

모든 소스코드는 [@2ByungJun](https://github.com/2ByungJun/VueJS)에서 확인할 수 있습니다.