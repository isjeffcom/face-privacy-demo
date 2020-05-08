<template>

    <div id="cmap">
        <div style="position:fixed;height:60px;width:100%;background:#000;color:#fff;font-weight:bold;top:0px;left:0px;padding:18px;font-size: 24px;">
            <span>Mental Health Big Data Surveillance - London</span>
        </div>

        <div id="map" style="width: 100%;height:100%;position:fixed;top:60px;left:0px;">
            <cmap></cmap>
        </div>
    </div>
    
</template>

<script>
import cmap from '../widgets/cmap'
export default {
    name: "map",
    components:{
        cmap
    }
}
</script>