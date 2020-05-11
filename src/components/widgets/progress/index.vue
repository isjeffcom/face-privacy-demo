<template>
    <div id="cprogress">
        <vue-circle
            style="margin-top:-10px;margin-bottom: 50px;"
            ref="progress"
            :progress="0"
            :size="150"
            line-cap="round"
            :fill="fill"
            :animation="ani"
            empty-fill="rgba(0, 0, 0, .1)"
            :start-angle="0"
            insert-mode="append"
            :thickness="8"
            :show-percent="true">

            <p style="font-size: 12px; opacity: 0.5;">Progress</p>

        </vue-circle>

        <hr style="margin-bottom: 20px; opacity: 0.3;">

        <div style="font-size: 12px;opacity: 0.3;font-weight: normal; margin-bottom: 20px;">Keep happiness score upper than {{ happyLimit * 100}}</div>
        
        <div class="pt-cont">
            <div class="progress-text" v-for="(value, name) in emo" :key="name">
                <div style="font-size: 12px; opacity: 0.6;margin-bottom: 4px; text-transform: uppercase;">{{ name }}</div>
                
                <div style="font-size: 14px;margin-bottom: 4px; margin-top:6px;" :style="'color:' + getColor(name) + ';'">{{ parseFloat((value * 100).toFixed(2)) }}% </div>
                
                <div style="width: 75%; height: 2px; background:#333; margin-top: 6px;">
                    <div :style="'height: 2px;width:' + parseFloat((value * 100).toFixed(0)) + '%;background:' + getColor(name) + ';'"></div>
                </div>
            </div>
        </div>

        

        
    </div>
</template>

<script>
import VueCircle from 'vue2-circle-progress'
export default {
    name: "cprogress",
    components: {
        VueCircle
    },
    props:{
        val: {
            type: Number,
            default: 0
        },
        emo:{
            type: Object,
            default(){
                return {}
            }
        }
    },
    watch:{
        val: function(){
            this.$refs.progress.updateProgress(this.val)
        }
    },
    data(){
        return{
            fill : { gradient: ["rgb(255,80,80)", "rgb(199,79,255)"] },
            happyLimit: 0.97,
            ani:{
                duration: 0, 
                easing: "circleProgressEasing"
            },
            colors: {
                happy: "#29C078",
                sad: "#8E59FF",
                angry: "#FF7575",
                neutral: "#D0E0FF",
                fearful: "#C495FF",
                disgusted: "#729F5D",
                surprised: "#FF7AAA"
            }
        }
    },
    methods:{
        getColor(name){

            let res = "#ffffff"
            for (const key in this.colors) {
                if(name == key){
                    res =  this.colors[key]
                }
            }

            return res
        }
    }
}
</script>

<style scoped>

#cprogress{
    width: 100%;
}

.pt-cont{
    width: 85%;
    margin-left: auto;
    margin-right: auto;
}

.progress-text{
    margin-bottom: 20px;
    text-align: left;
    font-weight: bold;
}
</style>