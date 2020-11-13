import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex); // Vue에 Vuex 플러그인을 사용할 것이라 명시

export default new Vuex.Store({
    // 데이터가 들어가는 곳
    state: {
        todos: [
            {id: 1, text: 'buy a car', checked:false},
            {id: 2, text: 'play game', checked:false},        
          ],
        users: []
    },
    // commit을 하여 데이터를 실제로 변경되게 함(규약)
    mutations: {
        SET_USERS(state, users){
            state.users = users;
        },
        ADD_TODO(state, value){
            state.todos.push({
                id: Math.random(),
                text: value,
                checked: false
            });
        },
        TOGGLE_TODO(state, payload){
            const index = state.todos.findIndex(todo => {
                return todo.id === payload.id;
              });
              state.todos[index].checked = payload.checked;
        },
        DELETE_TODO(state, todoId){
            const index = state.todos.findIndex(todo => {
                return todo.id === todoId;
            });
            state.todos.splice(index, 1);
        }   
    },
    // 함수가 들어가는 곳(비동기적)
    actions: {
        getUsers({commit}){
            axios.get('https://jsonplaceholder.typicode.com/users').then(res => {
                commit('SET_USERS', res.data);
            });
        },
        // context가 들어감
        // 내부의 commit만 사용했음
        addTodo({commit}, value){
            // axios.post()
            setTimeout(function (){
                commit('ADD_TODO', value);
            }, 500);
        },
        toggleTodo({commit}, payload){
            setTimeout(function (){
                commit('TOGGLE_TODO', payload);
            }, 500);
        },
        deleteTodo({commit}, todoId){
            setTimeout(function (){
                commit('DELETE_TODO', todoId);
            }, 500);
        }
    },
    getters: {
        numberOfCompletedTodo: state => {
            return state.todos.filter(todo => todo.checked).length;
        }
    }
})
