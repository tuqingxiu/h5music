<template>
    <img :src="zans[index]" />
</template>
<script>
import { mapMutations, mapState } from "vuex";
import store from '../store';

export default {
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
        setTimer: function(){
            this.clearTimer()
            const self = this;
            this.timer = setInterval(()=>{
                if(self.index===this.zans.length-1){
                    self.clearTimer();
                }else{
                    self.index++;
                }
            },150)
        },
        clearTimer: function(){
            if(this.timer){
                clearInterval(this.timer)
            }
        }
    },
    computed: {
        ...mapState({
            zans: ({imgs1}) => imgs1.zans
        })
    },
}
</script>
