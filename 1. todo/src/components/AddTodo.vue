<template>
  <div>
      <input 
      v-model="todoText" 
      type="text" 
      class="w-100 p-2" 
      placeholder="Type todo"
      @keyup.enter="addTodo" 
      >
      <hr>
      <div class="alert alert-warning alert-dismissible fade show" role="alert" :style="{ display : displayAlert }">
      <strong>!경고</strong> 입력란에 글이 입력되지 않았습니다.
    </div>
  </div>
</template>

<script>
export default {
    data(){
        return {
            todoText: '',
            displayAlert: 'none'
        }
    },
    methods: {
        addTodo(e){
            if(!this.todoText){
                this.displayAlert = 'block';
            }else{
                this.$store.dispatch('todo/addTodo', e.target.value);
                this.todoText = '';
            }
        }
    }
}
</script>

<style>

</style>