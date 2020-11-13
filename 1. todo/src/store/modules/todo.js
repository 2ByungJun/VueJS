export default {
    namespaced: true, // 모듈사용할 때 필수
    state: {
        todos: [
            {id: 1, text: 'buy a car', checked:false},
            {id: 2, text: 'play game', checked:false},        
          ],
    },
    mutations: {
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
    actions: {
        addTodo({commit}, value){
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
}