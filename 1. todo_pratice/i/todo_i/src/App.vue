<template>
  <div id="app" class="container">
    <h1 class="text-center">Todo List Pratice -i-</h1>
    <AddTodo />
    <TodoList />
  </div>
</template>

<script>
import AddTodo from './components/AddTodo.vue'
import TodoList from './components/TodoList.vue'

export default {
  components: {
    AddTodo,
    TodoList,
  }
}
</script>
