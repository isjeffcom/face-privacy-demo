<template>

    <div id="cmap">
        <div style="position:fixed;height:60px;width:100%;background:#000;color:#fff;font-weight:bold;top:0px;left:0px;padding:18px;font-size: 24px;">
            <span>Mental Health Big Data Surveillance - London</span>
        </div>

        <div id="mmap" style="width: 100%;height:100%;position:fixed;top:60px;left:0px;">
            <!--cmap></cmap-->
            <mmap v-if="ready" :markers="markers"></mmap>
        </div>

        <transition name="fade">
            <div id="intro" v-if="!ready">

                <div id="concent" v-if="start">
                    <div style="width: 80%; margin-left: auto; margin-right: auto; margin-top: 100px; text-align:center;">
                        <span style="font-size:32px;font-weight: bold;">ART PROJECT</span>
                        <br>
                        <br>
                        <span style="font-size:24px;font-weight: bold;">The following content is served to only and purely to art demonstration purpose. The cookie is in used for the statistic.</span>
                        <br>
                        <br>
                        <br>
                        <button class="chooseBtn" v-on:click="toIntro()" style="background: #000AFF;color:#FFF500;">OK</button>
                    </div>
                </div>

                <div id="intro-inner" v-if="intro">
                    <VueTyper :text="introText" :repeat="0" :shuffle='true'></VueTyper>

                    <div id="intro-choose" v-if="next">
                        <button class="chooseBtn" v-on:click="toNext('yes')" style="background: #000AFF;color:#FFF500;">YES</button>
                        <button class="chooseBtn" v-on:click="toNext('no')" style="background: #FF003D;color:#000000;">NO</button>
                    </div>
                    
                </div>

                <div style="position: fixed; top: 30px; right: 40px;cursor: pointer">
                    <span v-on:click="ready = true; stopAllAudio(); stopAllTimer()" v-if="!start && !ready">Skip</span>
                </div>
                
            </div>
        </transition>

        <transition name="fade">
            <div id="send-win" v-if="sendWindow">
                <div id="send-win-inner">
                    <div v-if="sendBefore">
                        <div>
                            <h3>EMOTION FACTORY</h3>
                        </div>

                        <div style="margin-top: 10px;">
                            <h5>Send him to emotion factory?</h5>
                        </div>

                        <div style="margin-top: 30px;">
                            <button class="chooseBtn" v-on:click="sendAft()" style="background: #000AFF;color:#FFF500;">YES</button>
                            <button class="chooseBtn" v-on:click="sendWindow=false" style="background: #FF003D;color:#000000;">CANCEL</button>
                        </div>
                    </div>

                    <div v-if="sendAfter">
                        <video ref="sending" width="80%" @ended="toEmo()">
                            <source :src="'./assets/video/sending.mp4'" type="video/mp4">
                        </video>
                    </div>
                    
                </div>
            </div>
        </transition>


    </div>
    
</template>

<script>

import { EventBus } from '../../bus'

//import cmap from '../widgets/cmap'
// VFX
import { VueTyper } from 'vue-typer'

import mmap from '../widgets/mmap'
import { genGet } from '../../request'

export default {
    name: "cmap",
    components:{
        mmap,
        VueTyper
    },
    data(){
        return{
            api: "./assets/data/london.json",
            start: true,
            ready: false,
            intro: false,
            next: false,
            sendWindow: false,
            sendBefore: true,
            sendAfter: false,
            allPlayer: [],
            allTimer: [],
            introText: "The development of AI makes massive surveillance down to the individual level more possible than ever.",
            audioRoot: "./assets/audio/",
            markers: [],
            audios:['1.mp3', '2.mp3', '3a.mp3', '3b.mp3', '4.mp3', '5.mp3']
        }
    },
    created(){
        this.getMarkers()
        this.typeAni()

        EventBus.$on("emotion", ()=>{
            this.askToEmotion()
        })
    },
    methods:{
        getMarkers(){
            genGet(this.api, [], true, (res)=>{
                this.markers = res.data
            })
        },

        typeAni(){
            //this.introText = "The development of artificial intelligence makes massive surveillance down to the individual more possible than ever."

            let timer1 = setTimeout(()=>{
                this.playAudio(this.audios[1])
                this.introText = "Do you believe even your emotions can be monitored?"
            }, 13000)

            let timer2 = setTimeout(()=>{
                this.next = true
            }, 16000)

            this.allTimer.push(timer1)
            this.allTimer.push(timer2)
        },

        toIntro(){
            this.start = false
            this.intro = true
            this.playAudio(this.audios[0])
        },

        playAudio(src){

            if(!src){
                return
            }

            var audio = new Audio(this.audioRoot + src)
            audio.play()
            this.allPlayer.push(audio)
        },

        stopAllAudio(){
            this.allPlayer.forEach((el, idx) => {
                el.pause()

                if(idx == this.allPlayer.length){
                    this.allPlayer = []
                }
            })
        },

        stopAllTimer(){
            this.allTimer.forEach((el, idx) => {
                clearTimeout(el)

                if(idx == this.allTimer.length){
                    this.allTimer = []
                }
            })
        },

        toNext(select){

            this.next = false

            if(select == "yes"){
                this.playAudio(this.audios[2])
                this.introText = "Good, you have a long-term vision. But, we haven't there yet."
            } 
            else{
                this.playAudio(this.audios[3])
                this.introText = "We think it's only a matter of time."
            }

            let timer3 = setTimeout(()=>{
                this.playAudio(this.audios[4])
                this.introText = "Let us show you a glance at how emotion data be monitored."
            }, 8000)

            let timer4 = setTimeout(()=>{
                this.playAudio(this.audios[5])
                this.ready = true
            }, 16000)

            this.allTimer.push(timer3)
            this.allTimer.push(timer4)

        },

        askToEmotion(){
            this.sendWindow = true
        },

        toEmo(){
            this.$router.push('emotion')
        },

        sendAft(){
            this.sendBefore = false
            this.sendAfter = true

            this.$nextTick(()=>{
                this.$refs.sending.play()
            })
        },

        displayMay(){
            this.ready = true
        }
    }
}
</script>

<style>

.fade-enter-active, .fade-leave-active {
  transition: opacity 2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.chooseBtn{
    height: 50px; 
    width: 100px; 
    padding-top:14px;
    padding-bottom: 10px;
    border-radius: 100px;
    font-size: 16px;
    font-weight: bold;
}
.vue-typer{
    color: #ffffff;
}

.vue-typer .custom.char.typed {
    color: #ffffff;
}

#intro{
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    color: #ffffff;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(4px);
    
}

#intro-inner{
    width: 77%;
    margin-top: 20%;
    margin-left: auto;
    margin-right: auto;
    transform: translateY(-50%);
    font-weight: bold;
    font-size: 32px;
    text-align: center;
    word-wrap: break-word;
}

#intro-choose{
    margin-top:40px;
}

#send-win{
    position: fixed;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(6px);
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    text-align: center;
}

#send-win-inner{
    position: fixed;
    background: rgba(255,255,255,1);
    width: 30%;
    border-radius: 14px;
    margin-left: auto;
    margin-right: auto;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #222;
    padding:24px;
}
</style>