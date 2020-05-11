<template>

    <MglMap 
    :accessToken="accessToken" 
    :mapStyle="mapStyle" 
    @load="onMapLoaded">

    <div id="back" v-on:click="back()" v-if="focus">BACK</div>

        <!-- UTLA Geo Json -->
        <MglGeojsonLayer 
            v-if="ready" 
            :sourceId="'id'" 
            :source="geoJsonSrc" 
            layerId="UTLA" 
            :layer="geoJsonLayer">

        </MglGeojsonLayer>

        <div 
            v-for="(item, index) in markers"
            :key="index">

            <MglMarker :coordinates="[item.lo, item.la]">

                <div slot="marker"> 
                    <img :src="setIcon(item.emo).src" alt="area" :width="setIcon(item.emo).size"> 
                </div>

                <MglPopup>
                    <div style="color:#000;">
                        <div style="font-size: 18px;font-weight: bold;">{{ item.name }}</div>
                        <div style="font-size: 14px;">Emotion: {{ parseFloat((item.emo * 100).toFixed(2)) }}% </div>
                        <div class="ref-imgs">

                            <img 
                            v-for="ig in igs" :src="'./assets/imgs/places/'+item.dict+'/'+ig+'.jpg'" 
                            :key="ig"
                            width="30px"
                            height="30px"
                            alt="">

                        </div>

                        <div v-if="item.name == 'City of London'" style="width:100%" v-on:click="inside()">
                            <button style="width:90%;padding-top: 10px;padding-bottom:10px;">Detail</button>
                        </div>
                    </div>
                </MglPopup>
            </MglMarker>

        </div>

        <div id="click-indicator" v-if="focus" ref="indicator" v-on:click="displayEmoWin()"></div>
            

    </MglMap>


</template>

<script>

// EventBus
import { EventBus } from '../../../bus'

// 3D Loader
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

// Mapbox
import Mapbox from "mapbox-gl"
import { MglMap, MglGeojsonLayer, MglMarker, MglPopup } from "vue-mapbox"

// Request
import { genGet } from '../../../request'

export default {
  components: {
    MglMap,
    MglGeojsonLayer,
    MglMarker,
    MglPopup,
    //VCard
  },
  props:{
      markers:{
          type: Array,
          value: []
      }
  },
  data() {
    return {
        ready: false,
        igs: [0,1,2,3,4,5,6,7,8,9,10],
        accessToken: "pk.eyJ1IjoiaGVpbG8xNDMiLCJhIjoiY2s5MXU3OWg0MDE5MDNlbXJxc3I5bGllMSJ9.pH2B__COb1ub7QPXDJxzaA",
        mapStyle: "mapbox://styles/heilo143/ck9wxvkif0ujd1ipgxmuzf0he",
        geoJsonSrc: {},
        geoJsonLayer: {
            "type": "line",
            "paint": {
                "line-color": "#FF5F5F"
            }
        },

        // UI Flag
        focus: false,

        // Three js layer
        obj: null,
        clock: null,
        scene: null,
        camera: null,
        renderer: null,
        mixer: null,
        raycaster: null,
        mouse: null
    }
  },

  created() {
    // We need to set mapbox-gl library here in order to use it in template
    this.mapbox = Mapbox
    this.map = null

    //this.animate()

  },
  mounted(){
      /*addEventListener('click', (e)=>{

          e.preventDefault()

          if(this.mouse){
            this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1
            this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1

            const camInverseProjection = new THREE.Matrix4().getInverse(this.camera.projectionMatrix)
            const cameraPosition = new THREE.Vector3().applyMatrix4(camInverseProjection)
            const mousePosition = new THREE.Vector3(this.mouse.x, this.mouse.y, 1).applyMatrix4(camInverseProjection)
            const viewDirection = mousePosition.clone().sub(cameraPosition).normalize()

            this.raycaster.set(cameraPosition, viewDirection)
            
            // Raycaster
            //this.raycaster.setFromCamera(this.mouse, this.camera)

            let intersects = this.raycaster.intersectObjects(this.scene.children, true)

            if(intersects.length > 0){
                if(this.focus) EventBus.$emit("emotion", true)
                //this.$router.push('emotion')
            }
        

            //this.$router.push('emotion')
          }
      })*/
  },
  methods:{
    async onMapLoaded(event) {

        this.map = event.map

        // Here we cathing 'load' map event
        const asyncActions = event.component.actions
        
        genGet("./assets/geojson/utla.geojson", [], true, (res)=>{
            
            this.geoJsonSrc = { type:'geojson', data: res.data }
            this.ready = true
        })

        await asyncActions.flyTo({
            center: [-0.09211,51.50592],
            zoom: 12,
            speed: 1,
            bearing: 0,
            pitch: 0
        })

        
    },
    setIcon(emo){


        // Emotion score
        emo = emo * 100

        let u = ""

        if(emo > 35){
            u = './assets/imgs/marker_ye.svg'
        }

        else if(emo > 30){
            u = './assets/imgs/marker_ye.svg'
        }

        else if(emo > 27){
            u = './assets/imgs/marker_or.svg'
        }

        else if(emo > 25){
            u = './assets/imgs/marker_or.svg'
        }

        else if(emo > 0){
            u = './assets/imgs/marker_red.svg'
        }
        //let s = (emo * 4)
        return {size: 60, src: u}
    },

    async inside(){

        this.focus = true

        await this.map.flyTo({
            center: [-0.0898073,51.5133187],
            zoom: 18,
            speed: 1,
            bearing: 60,
            pitch: 80
        })

        this.addModel()
    },

    async back(){

        this.focus = false

        if(this.map.getLayer('3d-model')){
            this.map.removeLayer('3d-model')
        }

        await this.map.flyTo({
            center: [-0.09211,51.50592],
            zoom: 12,
            speed: 1,
            bearing: 0,
            pitch: 0
        })
    },

    addModel(){

        let that = this

        // parameters to ensure the model is georeferenced correctly on the map
        let modelOrigin = [-0.090324, 51.513164]
        let modelAltitude = 3
        let modelRotate = [Math.PI / 2, -45.2, 0]
        
        let modelAsMercatorCoordinate = this.mapbox.MercatorCoordinate.fromLngLat(
            modelOrigin,
            modelAltitude
        )
        
        // transformation parameters to position, rotate and scale the 3D model onto the map
        let modelTransform = {
            translateX: modelAsMercatorCoordinate.x,
            translateY: modelAsMercatorCoordinate.y,
            translateZ: modelAsMercatorCoordinate.z,
            rotateX: modelRotate[0],
            rotateY: modelRotate[1],
            rotateZ: modelRotate[2],
            scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() / 20
        }

        let customLayer = {
            id: '3d-model',
            type: 'custom',
            renderingMode: '3d',

            onAdd: function(map, gl) {

                that.clock = new THREE.Clock()
                that.camera = new THREE.PerspectiveCamera()
                that.scene = new THREE.Scene()
                that.mouse = new THREE.Vector2() 
                that.raycaster = new THREE.Raycaster()
                
                // create two three.js lights to illuminate the model
                let directionalLight = new THREE.DirectionalLight(0xffffff)
                directionalLight.position.set(0, -70, 100).normalize()
                that.scene.add(directionalLight)
                
                let directionalLight2 = new THREE.DirectionalLight(0xffffff)
                directionalLight2.position.set(0, 70, 100).normalize()
                that.scene.add(directionalLight2)
                
                // use the three.js FBX loader to add the 3D model to the three.js scene
                let loader = new FBXLoader()
                loader.load('./assets/ddd/man.fbx',
                    function(obj) {

                        obj.name = "walking_man"

                        // Mixer
                        that.mixer = new THREE.AnimationMixer( obj )
                        let action = that.mixer.clipAction( obj.animations[0] )
                        action.play()

                        // Add to scene
                        that.scene.add(obj)
                        that.obj = that.scene.getObjectByName( "walking_man", true )
                    }.bind(this)
                )
                
                // use the Mapbox GL JS map canvas for three.js
                that.renderer = new THREE.WebGLRenderer({
                    canvas: map.getCanvas(),
                    context: gl,
                    antialias: true
                })
                
                that.renderer.autoClear = false
            
            },
            onRemove: function(){
                that.clock = null
                that.mixer = null
                that.camera = null
                that.scene = null
                that.renderer = null
                that.raycaster = null
                that.mouse = null,
                that.obj = null
            },
            render: function(gl, matrix) {

                // Disable on response render
                that.map.triggerRepaint()

                let rotationX = new THREE.Matrix4().makeRotationAxis(
                    new THREE.Vector3(1, 0, 0),
                    modelTransform.rotateX
                )
                let rotationY = new THREE.Matrix4().makeRotationAxis(
                    new THREE.Vector3(0, 1, 0),
                    modelTransform.rotateY
                )
                let rotationZ = new THREE.Matrix4().makeRotationAxis(
                    new THREE.Vector3(0, 0, 1),
                    modelTransform.rotateZ
                )
                
                let m = new THREE.Matrix4().fromArray(matrix);
                let l = new THREE.Matrix4()

                .makeTranslation(
                    modelTransform.translateX,
                    modelTransform.translateY,
                    modelTransform.translateZ
                )
                .scale(
                    new THREE.Vector3(
                    modelTransform.scale,
                    -modelTransform.scale,
                    modelTransform.scale
                    )
                )
                .multiply(rotationX)
                .multiply(rotationY)
                .multiply(rotationZ)
                
                that.camera.projectionMatrix = m.multiply(l)
                that.renderer.state.reset()

                let delta = that.clock.getDelta()

                if ( that.mixer ){
                    that.mixer.update( delta )
                }


                // Display Indicator
                if(that.focus && that.obj){
                    let proj = that.toScreenPosition(that.obj, that.camera)
                    that.$refs.indicator.style.left = proj.x + 'px'
                    that.$refs.indicator.style.top = proj.y + 'px'
                }
                
                that.renderer.render(that.scene, that.camera)
                //this.map.triggerRepaint()
                //console.log(that.renderer)
                
            }
        }

        

      this.map.addLayer(customLayer, 'waterway-label')
    
    },

    displayEmoWin(){
        if(this.focus) EventBus.$emit("emotion", true)
    },
    toScreenPosition(obj, camera){

        var vector = new THREE.Vector3()
        var widthHalf = 0.5 * screen.width
        var heightHalf = 0.5 * screen.height


        obj.updateMatrixWorld()
        vector.setFromMatrixPosition(obj.matrixWorld)
        vector.project(this.camera)

        vector.x = ( vector.x * widthHalf ) + widthHalf
        vector.y = - ( (vector.y+0.26) * heightHalf ) + heightHalf

        return { 
            x: vector.x,
            y: vector.y
        }

    }
  }
}
</script>

<style scoped>

@keyframes zooming {
    0% {transform: scale(1,1);}
    50% {transform: scale(1.6,1.6);}
    100% {transform: scale(1,1);}
}

#back{
    position: fixed;
    left: 20px;
    top: 80px;
    font-weight: bold;
    cursor: pointer;
}

#click-indicator{
    position: absolute;
    width: 12px;
    height: 12px;
    background: red;
    border-radius: 10px;
    cursor: pointer;
    animation-name: zooming;
    animation-duration: 1s;
    animation-iteration-count: infinite;
}
</style>