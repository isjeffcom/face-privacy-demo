<template>
  <div id="main">

    <div id="cont">

      <div id="face-cont">
        <div id="camera" style="position: relative; width: 100%;" class="margin">
          <video :onloadedmetadata="detectExpression()" id="inputVideo" ref="webcam" autoplay muted playsinline style="width: 100%;"></video>
          <canvas id="overlay" ref="overlay" style="width: 100%;" />
        </div>

        <div>
          <canvas id="res" ref="res"/>
          <img src="" alt="" ref="cap">
        </div>
      </div>
      

      <div id="score">
        
        <cprogress 
          :val="score" 
          :emo="allEmo">

        </cprogress>
        
      </div>

      <!--div id="performance">
        <span ref="avgTIM">{{avgTIM}}</span>
        <span ref="avgFPS">{{avgFPS}}</span>
      </div-->
    </div>


    <div id="loading" v-show="isLoading">
      <div id="loading-inner">
         <span>Loading...</span>
      </div>
     
    </div>
    
    


  </div>
</template>

<script>

import * as faceapi from "face-api.js"
import * as faceControl from '../../faceControls'


import ls from 'local-storage'

import cprogress from '../widgets/progress'

export default {
  name: 'home',
  components: {
    cprogress
  },
  data(){
    return {
      stream: null,
      isLoading: true,
      score: 0,

      // Emotion Storager
      happyCurrent: 0,
      allEmo: {
        happy:0,
        sad: 0,
        angry: 0,
        neutral: 0,
        fearful: 0,
        disgusted: 0,
        surprised: 0
      },
      
      // Flag
      happyLimit: 0.97,
      scoreStep: 0.1,

      // Camera
      webcamRef: null,

      // UI Flag
      showCam: true,
      isCaptured: false,

      forwardTimes: [],

      // UI Element
      avgTIM: null,
      avgFPS: null,
      faceMatcher: null,

      // AI Models
      SSD_MOBILENETV1: 'ssd_mobilenetv1',
      TINY_FACE_DETECTOR: 'tiny_face_detector',
      selectedFaceDetector: 'tiny_face_detector'
    }
  },
  created(){
    
    this.init()

    setTimeout(()=>{
      this.happyLimit = 0.75
    }, 200000)
  },
  methods:{

    async init() {
      // Initilize
      await this.run()
    },
    async run() {
      // load face detection model

      // Load ML Models
      await faceapi.nets.tinyFaceDetector.loadFromUri('./assets/models/')
      await faceapi.loadFaceRecognitionModel('./assets/models/')
      await faceapi.loadFaceExpressionModel('./assets/models/')

      // try to access users webcam and stream the images
      // to the video element
      this.stream = await navigator.mediaDevices.getUserMedia({ video: {} })
      const videoEl = this.$refs.webcam

      //this.faceMatcher = new faceapi.FaceMatcher()

      const matcher = []

      // Storage video element reference to this.webcamRef
      this.webcamRef = videoEl
      videoEl.srcObject = this.stream
      
    },

    // Main function for detect expression
    async detectExpression(){

      //console.log(this.score)

      if(this.score >= 100){
        this.stopCam()
        this.$router.push("receipt")
        return
      }

      let withBoxes = true

      const videoEl = this.webcamRef
      
      if(!videoEl || videoEl.paused || videoEl.ended || !this.isFaceDetectionModelLoaded()){
        return setTimeout(() => this.detectExpression())
      }

      // Close loading screen
      this.isLoading = false
      
      // Get Options
      const options = this.getFaceDetectorOptions()

      //const ts = Date.now()

      // DETECT SINGLE
      const result = await faceapi.detectSingleFace(videoEl, options)
                    //.withFaceLandmarks()
                    //.withFaceDescriptor()
                    .withFaceExpressions()

      //this.updateTimeStats(Date.now() - ts)

      if (result) {
        const canvas = this.$refs.overlay
        const resCanvas = this.$refs.res

        const dims = faceapi.matchDimensions(canvas, videoEl, true)

        const resizedResult = faceapi.resizeResults(result, dims)

        if(this.score > 50){
          this.capture()
        }
        // Check current status and add to progress
        this.allEmo.happy = result.expressions.happy
        this.allEmo.angry = result.expressions.angry
        this.allEmo.disgusted = result.expressions.disgusted
        this.allEmo.fearful = result.expressions.fearful
        this.allEmo.neutral = result.expressions.neutral
        this.allEmo.sad = result.expressions.sad
        this.allEmo.surprised = result.expressions.surprised


        if(this.allEmo.happy > this.happyLimit){
          this.score = this.score + this.scoreStep
        }

        if (withBoxes) {
          faceapi.draw.drawDetections(canvas, resizedResult)
        }

        faceapi.draw.drawFaceExpressions(canvas, resizedResult, 0.05)

      }

      setTimeout(() => this.detectExpression(), 300)

    },

    // Performance detector
    updateTimeStats(timeInMs) {

      if(!this.avgTIM || !this.avgFPS) return false
      
      // Display preformance index
      this.forwardTimes = [timeInMs].concat(this.forwardTimes).slice(0, 30)
      const avgTimeInMs = this.forwardTimes.reduce((total, t) => total + t) / this.forwardTimes.length
      this.avgTIM = `${Math.round(avgTimeInMs)} ms`
      this.avgFPS = `${faceapi.utils.round(1000 / avgTimeInMs)}`
    },

    // Get config, return tinyfacedetector with input size 256 and thershole 0.5
    getFaceDetectorOptions() {

      // ssd_mobilenetv1 options
      let minConfidence = 0.5

      // tiny_face_detector options
      let inputSize = 256
      let scoreThreshold = 0.5
      return this.selectedFaceDetector === this.SSD_MOBILENETV1
        ? new faceapi.SsdMobilenetv1Options({ minConfidence })
        : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
    },

    // Make sure model loaded
    isFaceDetectionModelLoaded() {
      return this.getCurrentFaceDetectionNet() ? true : false
    },

    // Get current Model
    getCurrentFaceDetectionNet() {

      if (this.selectedFaceDetector === this.SSD_MOBILENETV1) {
        return faceapi.nets.ssdMobilenetv1
      }
      if (this.selectedFaceDetector === this.TINY_FACE_DETECTOR) {
        return faceapi.nets.tinyFaceDetector
      }

      

      return false

    },

    capture () {

      if(this.isCaptured){
        return
      }

      let scale = 0.5
      let _video = this.$refs.webcam

      let strDownloadMime = "image/octet-stream";
      let timestamp = Date.parse(new Date());
      let imgData, imgNode;

      try {
        
          let strMime = "image/png"
          let cav = document.createElement("canvas");
          cav.width = _video.videoWidth * scale
          cav.height = _video.videoHeight * scale
          cav.getContext('2d').drawImage(_video, 0, 0, cav.width, cav.height)
          
          imgData = cav.toDataURL(strMime)
          ls.set("cap", imgData)
          //this.$refs.cap.src = imgData

          this.isCaptured = true

      } catch (e) {
          console.log(e)
          return;
      }
    },

    stopCam(){
      this.stream.getTracks().forEach(function(track) {
        track.stop()
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

#loading{
  position: fixed;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(4px);
  text-align: center;
}

#loading-inner{
  width: 100%;
  margin-top: 200px;
}

h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

#overlay, .overlay {
  position: absolute;
  top: 0;
  left: 0;
}

#cont{
  display: flex;
}

#face-cont{
  width: 80%;
}

#score{
  width: 20%;
  height: 200px;
  margin-top: 50px;
  text-align: center;
}

@media only screen and (max-width: 800px) {
  
  #cont{
    display: block;
  }

  #face-cont{
    width: 100%;
  }

  #score{
    width: 100%;
    margin-top: 10px;
    text-align: center;
  }
  
}
</style>
