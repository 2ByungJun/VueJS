import axios from "axios";

export default{
    namespaced: true, // 모듈사용할 때 필수
    state: {
        users: []
    },
    mutations: {
        SET_USERS(state, users){
            state.users = users;
        },
    },
    actions: {
        getUsers({commit}){
            axios.get('https://jsonplaceholder.typicode.com/users').then(res => {
                commit('SET_USERS', res.data);
            });
        },
    }
}