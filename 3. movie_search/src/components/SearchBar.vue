<template>
  <div>
      <v-text-field
        v-model="title"
        outlined
        @keypress.enter = "searchMovies" >
        <template v-slot:prepend-inner>
            <v-icon>search</v-icon>
        </template>
        <template v-slot:append>
            <v-progress-circular
                v-if="loading"
                size="24"
                color="primary"
                indeterminate />
        </template>
      </v-text-field>
  </div>
</template>

<script>
import axios from 'axios'

export default {
    data(){
        return {
            title: '',
            loading: false
        }
    },
    methods: {
        searchMovies() {
            console.log("searchMovies")
            axios.get(`http://www.omdbapi.com/?i=tt3896198&apikey=e77f1431&s=${this.title}`)
                .then(res => {
                    console.log(res)
                })
        }
    }
}
</script>

<style>

</style>