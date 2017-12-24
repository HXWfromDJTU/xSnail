<template>
      <van-swipe :autoplay="3000">
                       <van-swipe-item v-for="image in swiperImages"><img :src="image.imageUrl"></van-swipe-item>
       </van-swipe>
</template>

<script>
import {getHotSwiper} from  "../../service/getData";
export default {
name:'hotSwiper',

  data() {
    return {
        swiperImages:[]
    };
  },

  mounted() {
      getHotSwiper().then(res=>{
           this.swiperImages = res;
      })
  }
};
</script>
<style scoped lang="scss">
     .van-swipe{
       height:200px;
     }
      .van-swipe img{
        width:100%;
       height:200px;
     }
</style>
