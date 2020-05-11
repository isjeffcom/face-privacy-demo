<template>
    <div id="receipt">
        <div id="receipt-inner">
            <div class="receipt-title">
                <div style="margin-bottom: 10px;">
                    <img :src="cap" alt="captured image" width="250px;" v-if="cap" style="filter: grayscale(50%);">
                </div>
                
                <div>
                    <h2>Thank you for obeying the order</h2>
                    <h3 style="font-weight: normal;">You are a happy person now</h3>
                </div>
                
            </div>

            <div class="receipt-action">
                <h3 style="line-height: 44px;text-transform:uppercase;">Certification</h3>
                <div style="width: 5%; height: 2px; border-bottom: 1px solid #fff; opacity: 0.5; margin-left: auto; margin-right: auto; margin-bottom: 40px;"></div>
                <div>
                    <button v-on:click="open">Print</button>
                    <br>
                    <a :href="fileURL" target="_blank" ref="downloadEl" download="receipt.pdf">
                        <button>Download</button>
                    </a>
                </div>
            </div>

            
        </div>
    </div>
</template>

<script>
import ls from 'local-storage'
export default {
    name: "receipt",
    components:{

    },
    data(){
        return{
            cap: "",
            fileURL: "./assets/files/receipt.pdf"
        }
    },
    created(){
        this.cap = ls.get("cap")
        console.log(this.cap)
    },
    methods:{
        open(){
            window.open(this.fileURL)
        }
    }
}
</script>

<style scoped>

button{
    width: 160px;
    height: 50px;
    background: rgba(255,255,255,0);
    padding-top: 2px;
    border-radius: 2px;
    border: 2px solid #fff;
    font-weight: bold;
    font-size: 18px;
    color: #fff;
    text-align: center;
    margin-bottom: 16px;
    cursor: pointer;
    transition: all 1s cubic-bezier(0.075, 0.82, 0.165, 1);
}

button:hover{
    background: rgba(255,255,255,1);
    color: #000;
}


#receipt{
    width: 100%;
    margin-top: 100px;
    text-align: center;
}

.receipt-title{
    line-height: 32px;
}

.receipt-action{
    margin-top: 80px;
}


</style>