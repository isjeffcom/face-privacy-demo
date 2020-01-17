<template>
  <div id="main">

    
    
    <div id="camera" style="position: relative" class="margin">
      <video :onloadedmetadata="detectAndReco()" id="inputVideo" ref="webcam" autoplay muted playsinline></video>
      <canvas id="overlay" ref="overlay" />
    </div>

    <div>
      <canvas id="res" ref="res"/>
      <img src="" alt="" ref="cap">
    </div>

    <div id="performance">
      <span ref="avgTIM"></span>
      <span ref="avgFPS"></span>
    </div>


  </div>
</template>

<script>

import * as faceapi from "face-api.js"

import * as faceControl from '../../faceControls'

export default {
  name: 'home',
  props: {
    
  },
  data(){
    return {
      webcamRef: null,
      isCaptured: false,
      forwardTimes: [],
      avgTIM: null,
      avgFPS: null,
      lastPerson: null,
      lastMatch: null,
      faceMatcher: null,

      allMatcher: [],
      targetFaces: ['./assets/targets/YiPing_Cao.png'],
      targetFacesBase64:[],

      SSD_MOBILENETV1: 'ssd_mobilenetv1',
      TINY_FACE_DETECTOR: 'tiny_face_detector',
      selectedFaceDetector: 'tiny_face_detector'
    }
  },
  created(){
    
    
    this.init()
    
  },
  methods:{
    async init() {
      //await faceapi.loadTinyFaceDetectorModel("/models");
      await this.run()
      await this.initAllTargetBase64()
      await this.initAllMatcher()
    },
    async run() {
      // load face detection model

      // Load ML Models
      await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models/')
      await faceapi.loadFaceLandmarkModel('/assets/models/')
      await faceapi.loadFaceRecognitionModel('/assets/models/')

      // try to access users webcam and stream the images
      // to the video element
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
      const videoEl = this.$refs.webcam

      const matcher = []

      // Storage video element reference to this.webcamRef
      this.webcamRef = videoEl
      videoEl.srcObject = stream

      this.avgTIM = this.$refs.avgTIM
      this.avgFPS = this.$refs.avgFPS

      
      //this.initAllMatcher()
      
      //this.faceMatcher = new faceapi.FaceMatcher(fullFaceDescriptions)
      
    },

    async initAllMatcher () {
      var that = this
      const matchers = []

      this.targetFaces.forEach(async (tf, index) => {

        const imgEle = document.createElement('img')
        imgEle.src = this.targetFacesBase64[0]

        const des = await faceapi
        .detectAllFaces(imgEle, that.getFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors()

        const matcher = new faceapi.FaceMatcher(des)

        matchers.push(matcher)
        
      })

      this.allMatcher = matchers
    },

    async initAllTargetBase64 () {
      await this.imgToBase64(this.targetFaces[0]).then((res)=>{
        this.targetFacesBase64.push(res)
      })
    },

    async detectAndShot() {
      
      const videoEl = this.webcamRef
      
      if(!videoEl || videoEl.paused || videoEl.ended || !this.isFaceDetectionModelLoaded()){
        return setTimeout(() => this.detectAndShot())
      }
        
      const options = this.getFaceDetectorOptions()

      const ts = Date.now()

      // DETECT SINGLE
      const result = await faceapi.detectSingleFace(videoEl, options)
                      .withFaceLandmarks()
                      .withFaceDescriptor()

      // Could display FPS frame rate
      this.updateTimeStats(Date.now() - ts)

      if (result) {

        const canvas = this.$refs.overlay
        const resCanvas = this.$refs.res
        
        const dims = faceapi.matchDimensions(canvas, videoEl, true)

          if(this.lastPerson){

            const thisMatch = this.faceMatcher.findBestMatch(result.descriptor)

            if(this.lastMatch){
              if(thisMatch.label != this.lastMatch.label){
                // DIFFERENT PERSON BEEN REC 
                console.log('DIFFERENT')
                this.faceMatcher = new faceapi.FaceMatcher(this.lastPerson)
                this.lastPerson = result
                console.log(thisMatch.label + ":" + this.lastMatch.label)
                // Draw by capture canvas
                this.capture(canvas)
              } else{
                // SAME PERSON AS THE LAST ONE
                console.log('SAME')
              }
            } else {
              this.lastMatch = thisMatch
            }
          } else {
            // FIRST TIME A PERSON BEEN REC FRONT OF THE CAM
            console.log('FIRST')
            this.lastPerson = result
            this.faceMatcher = new faceapi.FaceMatcher(this.lastPerson)
            // Draw by capture canvas
            this.capture(canvas)
          }

        faceapi.draw.drawDetections(canvas, faceapi.resizeResults(result, dims))
        
      }
      setTimeout(() => this.detectAndShot(), 500)
      
    },

    // Reco by ref
    async detectAndReco() {

      var that = this
      
      const videoEl = this.webcamRef
      
      if(!videoEl || videoEl.paused || videoEl.ended || !this.isFaceDetectionModelLoaded()){
        return setTimeout(() => this.detectAndReco())
      }
        
      const options = this.getFaceDetectorOptions()

      const ts = Date.now()
      
      // DETECT MULTIPLE
      const results = await faceapi
                      .detectAllFaces(videoEl, options)
                      .withFaceLandmarks()
                      .withFaceDescriptors()

      this.updateTimeStats(Date.now() - ts)

      if (results.length > 0) {

        const canvas = this.$refs.overlay
        const resCanvas = this.$refs.res
        
        const dims = faceapi.matchDimensions(canvas, videoEl, true)
        // Reco is me
        results.forEach(resS => {
          that.allMatcher.forEach(mat => {
            const thisMatch = mat.findBestMatch(resS.descriptor).toString()
            if(thisMatch){
              const label = thisMatch.toString()
              const options = { label }
              const drawBox = new faceapi.draw.DrawBox(resS.detection.box, options)
              drawBox.draw(canvas)
            }
          })
          //faceapi.draw.drawDetections(canvas, faceapi.resizeResults(resS, dims))
        })

        //faceapi.draw.drawDetections(canvas, faceapi.resizeResults(results[0], dims))
      }
      
     setTimeout(() => this.detectAndReco(), 500)

    },

    async imgToBase64(url){
      const data = await this.axios.get(url, { responseType: 'arraybuffer' })
      data.hh = data.headers
      data.ii = btoa(
          new Uint8Array(data.data)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        )
      const res = `data:${data.hh['content-type'].toLowerCase()};base64,${data.ii}`
      return res
    },


    // Performance detector
    updateTimeStats(timeInMs) {

      if(!this.avgTIM || !this.avgFPS) return false

      this.forwardTimes = [timeInMs].concat(this.forwardTimes).slice(0, 30)
      const avgTimeInMs = this.forwardTimes.reduce((total, t) => total + t) / this.forwardTimes.length
      this.avgTIM.innerHTML = `${Math.round(avgTimeInMs)} ms`
      this.avgFPS.innerHTML = `${faceapi.utils.round(1000 / avgTimeInMs)}`
    },

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

    isFaceDetectionModelLoaded() {
      return this.getCurrentFaceDetectionNet() ? true : false
    },

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

      var scale = 0.25
      var _video = this.$refs.webcam

      var strDownloadMime = "image/octet-stream";
      var timestamp = Date.parse(new Date());
      var imgData, imgNode;

      try {
        
          var strMime = "image/png"
          var cav = document.createElement("canvas");
          cav.width = _video.videoWidth * scale
          cav.height = _video.videoHeight * scale
          cav.getContext('2d').drawImage(_video, 0, 0, cav.width, cav.height)
          
          imgData = cav.toDataURL(strMime)
          this.$refs.cap.src = imgData

          this.isCaptured = true

      } catch (e) {
          console.log(e);
          return;
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
</style>
