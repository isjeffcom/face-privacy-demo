<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'app'
}
</script>

<style>

body{
  background: #000;
}

*{
  margin: 0;
  padding: 0;
}

button{
  height: 100%;
  background: #373D41;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 4px;
  color: #ffffff;
  margin-left:10px;
  margin-right: 10px;
  text-align: center;
  padding-top: 20px;
  padding-left: 8px;
  padding-right: 8px;
  font-size:12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.075, 0.82, 0.165, 1);
  -webkit-appearance: none;
}

button:active{
  background: #2D3133;
}

button:focus {outline:0;}

#app {
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #ffffff;
  background: #000;
}

.mapboxgl-popup-content{
  background: rgba(0,0,0,1);
  border: 1px solid rgba(255,255,255,0.05);
}

</style>
