<template>
    <div id="imgs" style='background: rgba(0,0,0,1);display:flex;flex-wrap: wrap; width: 100%; height: 100%;'>
        <div v-for="ig in igs" :key="ig" style="margin: 30px;">
            <img :src="'https://playground.isjeff.com/efassets/'+dist+'/'+ig+'_img.jpg'" alt="ig" width="300px">
        </div>
    </div>
</template>

<script>
export default {
    name: "imgs",
    data(){
        return{
            dist: "",
            igs: [1,2,3,4,5,6,7,8,9,10,11]
        }
    },
    created(){
        this.dist = this.$route.query.dist
    }
}
</script>