<template>
    <div>
        Completed Todo : {{ numberOfCompletedTodo }}
    </div>
</template>

<script>
export default {
    computed: {
        numberOfCompletedTodo(){
            return this.$store.getters.numberOfCompletedTodo;
        }
    }
}
</script>

<style>

</style>