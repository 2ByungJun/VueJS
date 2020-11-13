<template>
  <div>
      <h3> User List </h3>
      <div v-for="user in users" :key="user.id">
          {{ user.name }}
      </div>
  </div>
</template>

<script>
export default {
    computed: {
        users() {
            return this.$store.state.users;
        }
    },
    methods: {
        getUsers(){
            this.$store.dispatch('getUsers');
        }
    },
    created(){
        this.getUsers();
    }
}
</script>

<style>

</style>