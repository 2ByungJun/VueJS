import Vue from 'vue';
import Vuex from 'vuex';
import todo from './modules/todo';
import user from './modules/user';

Vue.use(Vuex); // Vue에 Vuex 플러그인을 사용할 것이라 명시

export default new Vuex.Store({
    modules: {
        todo,
        user
    }
})
