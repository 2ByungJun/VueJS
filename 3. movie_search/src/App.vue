<template>
  <v-app>
    <v-container>
      <!-- 검색바 -->
      <SearchBar />
      <!-- 영화 목록 -->
      <MovieList />
    </v-container>
  </v-app>
</template>

<script>
// @ : 절대경로(Vue CLI)
import SearchBar from '@/components/SearchBar'; 
import MovieList from '@/components/MovieList'; 

export default {
  components: {
    SearchBar,
    MovieList
  }
};
</script>
