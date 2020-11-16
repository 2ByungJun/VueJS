<template>
  <div>
      <input type="text" v-model="todoText" @keyup.enter="addTodo" class="w-100 p-2" placeholder="입력하세요">
  </div>
</template>

<script>
export default {
    data(){
        return {
            todoText: '',
        }
    },
    methods:{
        addTodo(e){
            console.log(e.target.value);
            this.todoText = '';
        }
    }
}
</script>

<style scoped>

</style>
