<template>

  <div style="height: 100%; width: 100%;">
    
    <l-map
      v-if="showMap"
      :zoom="zoom"
      :center="center"
      :options="mapOptions"
      ref="lmap"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
    >

      <l-tile-layer
        :url="url"
        :detectRetina="true"
        :attribution="attribution"
      ></l-tile-layer>

      <l-geo-json :geojson="geojson" :options="gJStyle"></l-geo-json>

      <l-marker 
        v-for="(item, index) in mapData"
        :key="index"
        :icon="setIcon(item.emo)"
        :lat-lng="setLatLng(item.la, item.lo)" >


        <l-popup>
          <div style="font-weight:bold;">
            Area: {{item.name}}
            <br>
            Emotion: {{parseFloat((item.emo * 100).toFixed(2))}}%
          </div>

          <div>
            <img 
              v-for="ig in igs" :src="'./assets/imgs/places/'+item.dict+'/'+ig+'.jpg'" 
              :key="ig"
              width="60px"
              alt="">
          </div>

          <button class="track-btn">...</button>
        </l-popup>
      </l-marker>

    </l-map>
  </div>
</template>

<script>
import L from "leaflet"
import { LMap, LTileLayer, LMarker, LPopup, LGeoJson } from "vue2-leaflet"
import { genGet } from '../../../request'

export default {
  name: "ccmap",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LGeoJson
  },
  props:{

  },
  data() {
    return {
        mapData: [],
        geojson: {},
        igs: [0,1,2,3,4,5,6,7,8,9,10],
        api_geoJson: "./assets/geojson/utla.geojson",
        zoom: 12,
        center: L.latLng(51.5079156, -0.1318353),
        //url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        url: 'https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png',
        //url: "	https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
        attribution:
            '&copy; <a href="http://osm.org/copyright">OSM</a>',
        currentZoom: 12,
        currentCenter: L.latLng(51.5079156, -0.1318353),
        showParagraph: false,
        icon: L.icon({
            iconUrl: './assets/imgs/marker.svg',
            iconSize: [50, 50],
            iconAnchor: [25, 25]
        }),
        mapOptions: {
            zoomSnap: 0.5,
            minZoom: 5,
            maxZoom: 16,
            easeLinearity: true,
            zoomAnimation: true,
            fadeAnimation: true,
            markerZoomAnimation: true
        },
        showMap: false,
        gJStyle: {
          style: {
            weight: 4,
            fillOpacity: 0.05,
            color: '#36FFAB',
            fillColor: '#000'
          }
        }
    };
  },

  created(){

    this.getGeo()

    genGet("assets/data/london.json", [], false, (res)=>{
        this.mapData = res.data
        
    })

      
  },

  methods: {

    // Get UTLA Geo Json
    getGeo(){
      genGet(this.api_geoJson, [], true, (res)=>{
        console.log(res)
        this.geojson = res.data
        this.showMap = true;
      })
    },

    zoomUpdate(zoom) {
      this.currentZoom = zoom
    },
    centerUpdate(center) {
      this.currentCenter = center
    },
    showLongText() {
      this.showParagraph = !this.showParagraph
    },
    setLatLng(lo, la){
        return L.latLng(lo, la)
    },
    setIcon(emo){
      emo = emo * 100
      let u 

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
      let s = (emo * 4)
      return L.icon({
            iconUrl: u,
            iconSize: [s, s],
            iconAnchor: [s/2, s/2]
      })
    }
  }
};
</script>


<style scoped>
.track-btn{
  height: 30px;
  padding-top: 0px;
  width: 100%;
  margin-top: 4px;
  margin-left: 0px;
  margin-right: 0px;
}
</style>