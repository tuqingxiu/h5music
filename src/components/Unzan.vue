<template>
    <img :src="unzans[index]" @click="goZan" />
</template>
<script>
import { mapMutations, mapState } from "vuex";
import store from '../store';

export default {
    props: {
        clickZan: {
            type: Function,
            default: ()=>{}
        }
    },
    data(){
        return{
            index: 0
        }
    },
    mounted(){
        this.setTimer()
    },
    destroyed(){
        if(this.timer){
            clearInterval(this.timer)
        }
    },
    methods: {
        goZan: function(){
            this.clickZan('1006')
        },
        setTimer: function(){
            this.clearTimer()
            const self = this;
            this.timer = setInterval(()=>{
                if(self.index===this.unzans.length-1){
                    self.clearTimer();
                    setTimeout(()=>{
                        self.index = 0;
                        self.setTimer();
                    },3000)
                }else{
                    self.index++;
                }
            },100)
        },
        clearTimer: function(){
            if(this.timer){
                clearInterval(this.timer)
            }
        }
    },
    computed: {
        ...mapState({
            unzans: ({imgs1}) => imgs1.unzans
        })
    },
}
</script>
