<template>
    <img :src="icons[index]" />
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
        if(this.playing){
            this.setTimer()
        }
    },
    destroyed(){
        if(this.timer){
            clearInterval(this.timer)
        }
    },
    watch: {
        playing: function(val){
            if(this.playing){
                this.setTimer()
            }else{
                this.clearTimer()
            }
        }
    },
    methods: {
        setTimer: function(){
            this.clearTimer()
            const self= this;
            this.timer = setInterval(()=>{
                if(self.index===this.icons.length-1){
                    self.index = 0;
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
            icons: ({imgs1}) => imgs1.icons
        })
    },
}
</script>
<style lang="less" scoped>

</style>
