<template>
  <div id="app" class="container">
    <h1 class="text-center">Todo App</h1>
    <input v-model="todoText" @keyup.enter="addTodo" type="text" class="w-100 p-2" placeholder="Type todo">
    <hr>
    <div class="alert alert-warning alert-dismissible fade show" role="alert" :style="{display: displayAlert}">
      <strong>!경고</strong> 입력란에 글이 입력되지 않았습니다.
    </div>
    <Todo 
    v-for="todo in todos" 
    :key="todo.id" 
    :todo="todo" 
    @toggle-checkbox="toggleCheckbox"
    @click-delete="deleteTodo"
    />
  </div>
</template>

<script>
import Todo from '@/components/Todo.vue';

export default {
  components: {
    Todo
  },
  data() {
    return {
      todoText: '',
      todos: [
        {id: 1, text: 'buy a car', checked:false},
        {id: 2, text: 'play game', checked:false},        
      ],
      displayAlert: 'none'
    }
  },
  methods: {
    addTodo(e){
      if(e.target.value == ''){
        this.displayAlert = 'block'
      }else{
        this.todos.push({
          id: Math.random(),
          text: e.target.value,
          checked: false
        })
        this.todoText = '';
        this.displayAlert = 'none'
      }
    },
    toggleCheckbox({id, checked}){
      const index = this.todos.findIndex(todo => {
        return todo.id === id;
      });
      this.todos[index].checked = checked;
    },
    deleteTodo(id){
      // const index = this.todos.findIndex(todo => {
      //   return todo.id === id;
      // });
      // this.todos.splice(index, 1);
      this.todos = this.todos.filter(todo => todo.id !== id);
    }
  }
}
</script>

<style>
</style>
