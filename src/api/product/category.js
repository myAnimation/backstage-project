import request  from '@/utils/request'
// 写的就是和请求平台品牌逻辑相关的请求函数
/* 
/admin/product/getCategory1
getCategory1

GET /admin/product/getCategory2/{category1Id}
getCategory2

GET /admin/product/getCategory3/{category2Id}
getCategory3 */


export default {
    getCategory1(){
        return request.get('/admin/product/getCategory1')
    },
    getCategory2(category1Id){
         return request.get(`/admin/product/getCategory2/${category1Id}`)
    },
    getCategory3(category2Id){
         return request.get(`/admin/product/getCategory3/${category2Id}`)
    }
}
//  默认暴露出去的是 default为属性 以default后面的值为值
// {
//     default:{}
// }
/* 
引入
import  {default as xxx} from './xxxx'
import xxx from './xxx'
 */