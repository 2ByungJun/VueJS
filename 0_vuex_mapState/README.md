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
});
```

모든 소스코드는 [@2ByungJun](https://github.com/2ByungJun/VueJS)에서 확인할 수 있습니다.