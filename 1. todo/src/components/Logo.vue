<template>
  <div class="row logo">
      <img @click="git" src="../assets/git.png" alt="git">
      <img @click="insta" src="../assets/insta.png" alt="insta">
      <img @click="blog" src="../assets/blog.png" alt="blog">
  </div>
</template>

<script>
export default {
    methods:{
        git(){
            window.open('https://github.com/2ByungJun');
        },
        insta(){
            window.open('https://www.instagram.com/2_byung_jun/');
        },
        blog(){
            window.open('https://velog.io/@ieed0205');
        },
    }
}
</script>

<style>
.logo {
    place-content: center;
}

img {
    width: 5%;
    cursor:pointer;
    padding: 3px;
}
</style>