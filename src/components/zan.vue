<template>
    <img :src="zans[index]" />
</template>
<script>
import { mapMutations, mapState } from "vuex";
import store from '../store';

export default {
    props: {
        playing: {
            type: Boolean,
            playing: false,
            imgUrl: ''
        }
    },
    data(){
        return{
            index: 0
        }
    },
    mounted(){
        // if(this.playing){
        //     this.setTimer()
        // }
        this.setTimer()
    },
    destroyed(){
        if(this.timer){
            clearInterval(this.timer)
        }
    },
    watch: {
        playing: function(val){
            // if(this.playing){
            //     this.setTimer()
            // }else{
            //     this.clearTimer()
            // }
        }
    },
    methods: {
        setTimer: function(){
            this.clearTimer()
            const self = this;
            this.timer = setInterval(()=>{
                // console.log(self.index)
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
<style lang="less" scoped>

</style>
