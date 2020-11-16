<template>
    <div>
        <span>완료 횟수 : {{ numberOfCompletedTodo }}</span>
    </div>
</template>

<script>
export default {
    computed: {
        numberOfCompletedTodo(){
            return this.$store.getters['todo/numberOfCompletedTodo'];
        }
    }
}
</script>

<style>

</style>