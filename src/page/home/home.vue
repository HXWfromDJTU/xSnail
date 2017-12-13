<template>
    <div>
        <div>
            <!-- 顶部导航栏 -->
            <head-top signin-up='msite'>
                <router-link to="/home" slot="msite-title" class="msite_title">
                    <span class="title_text ellipsis"></span>
                </router-link>   
            </head-top> 
            <div class="content_container">
               <van-button type="default">默认按钮</van-button>
             <hotSwiper></hotSwiper>
               <van-card v-for="item in hotSaleList"
  :title="item.title"
  :desc="item.desc"
  :num="item.num"
  :price="item.price"
  :thumb="item.imageUrl"
>
  <div slot="footer">
    <van-button size="mini">按钮</van-button>
    <van-button size="mini">按钮</van-button>
  </div>
</van-card>
            </div>
            <!-- 底部导航栏 -->
            <foot-guide>
            </foot-guide>
        </div>
    
    </div>
</template>

<script>
import headTop from "../../components/header/head";
import footGuide from "../../components/footer/footGuide";
import hotSwiper from './hotSwiper'
//getData.js统一管理app的请求
import { getHelloWorld,getHotSaleList } from "../../service/getData";

export default {
  data() {
    return {
      helloWord: "",
      hotSaleList:[]
    };
  },
 
  mounted() {
    //获取 招呼语
    getHelloWorld().then(res => {
      this.helloWord = res.msg;
    });
    //获取热销列表
     getHotSaleList().then(res => {
      this.hotSaleList = res;
    });
  },
//需要引入的组件列表
  components: {
    headTop,
    footGuide,
    hotSwiper
  },

  computed: {},

  methods: {}
};
</script>

<style lang="scss" scoped>
@import "../../style/mixin";

.head_logo {
  left: 0.4rem;

  font-weight: 400;

  @include sc(0.7rem, #fff);

  @include wh(2.3rem, 0.7rem);

  @include ct;
}
.content_container{
  margin-top:0.4rem;
}
</style>
