import request from '@/utils/request'
export default {
/*     / admin / product / baseTrademark / remove / { id }
删除BaseTrademark

POST / admin / product / baseTrademark / save
新增BaseTrademark

PUT / admin / product / baseTrademark / update
修改BaseTrademark

GET / admin / product / baseTrademark / { page } / { limit }
分页列表
 */
// 删除BaseTrademark
    remove(id){
      return   request.delete(`/admin/product/baseTrademark/remove/${ id }`)
    },
// 新增BaseTrademark 修改BaseTrademark
    addOrUpdate(trademark){
        if(trademark.id){
        return request.put(`/admin/product/baseTrademark/update`,trademark)
        }else{
         return request.post(`/admin/product/baseTrademark/save`,trademark)
        }
    },
    // 分页列表
    getPageList(page,limit){
     return request.get(`/admin/product/baseTrademark/${page} /${limit}`)
    }
}