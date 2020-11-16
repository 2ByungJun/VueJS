<template>
  <div id="app" class="container">
    <h1 class="text-center">Todo List</h1>
    <Logo />
    <CompletedTodo/>
    <AddTodo />
    <TodoList />
    <!-- <UserList /> -->
  </div>
</template>

<script>
import Logo from '@/components/Logo';
import TodoList from '@/components/TodoList';
import AddTodo from '@/components/AddTodo';
import CompletedTodo from '@/components/CompletedTodo';
// import UserList from '@/components/UserList';

export default {
  components: {
    Logo,
    TodoList,
    AddTodo,
    CompletedTodo,
    // UserList
  }
}
</script>
