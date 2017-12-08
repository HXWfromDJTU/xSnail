<template>
  	<div>
        <div>
    	<head-top signin-up='msite'>
			<router-link to="/home" slot="msite-title" class="msite_title">
				<span class="title_text ellipsis"></span>
			</router-link>
    	</head-top>
    	<nav class="msite_nav">
    		
    	</nav>
    	<div class="shop_list_container">
	    	<header class="shop_header">
	    		
	    		<span class="shop_header_title">附近商家</span>
	    	</header>
    	</div>
        <foot-guide>
        </foot-guide>
    	
    </div>    
    </div>
</template>

<script>
import headTop from '../../components/header/head'
import footGuide from '../../components/footer/footGuide'
//getData.js统一管理app的请求
import {getDouban} from '../../service/getData'

export default {
    data(){
        return{
            summary: ''
        }
    },

	mounted(){
        getDouban().then(res => {
                 console.log(res)
        })
    },

    components:{
        headTop,
        footGuide
    },

    computed:{
        
    },

    methods:{
       
    },
}

</script>

<style lang="scss" scoped>
    @import '../../style/mixin';
    .head_logo{
        left: 0.4rem;
        font-weight: 400;
        @include sc(0.7rem, #fff);
        @include wh(2.3rem, 0.7rem);
        @include ct;
    }

</style>
