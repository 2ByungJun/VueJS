<template>
  <div>
      <h3> User List </h3>
      <div v-for="user in users" :key="user.id">
          {{ user.name }}
      </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
    created(){
        this.getUsers();
    },
    computed: {
        ...mapState( 'user', {
            users: state => state.users
        })
        //...mapState('user', ['users'])
    },
    methods: {
        ...mapActions('user', ['getUsers'])
    }
}
</script>

<style>

</style>