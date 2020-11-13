<template>
  <div>
      <h3> User List </h3>
      <div v-for="user in users" :key="user.id">
          {{ user.name }}
      </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    computed: {
        ...mapState([
            'users',
            'todos'
        ])
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