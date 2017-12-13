import fetch from '../config/fetch'
import {getStore} from '../config/mUtils'


/**
 * 获取首页测试信息
 */

export const getHelloWorld = () => fetch('/index', {
	
});
/**
 * 获取热销列表信息
 */

export const getHotSaleList = () => fetch('/index/getHotSaleList', {
	
});



export const getHotSwiper = () => fetch('/index/getHotSwiper', {
	
});
