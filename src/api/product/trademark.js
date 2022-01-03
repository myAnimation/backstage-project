import request from '@/utils/request'
/*
/admin/product/baseTrademark/remove/{id}
删除BaseTrademark

POST /admin/product/baseTrademark/save
新增BaseTrademark

PUT /admin/product/baseTrademark/update
修改BaseTrademark

GET /admin/product/baseTrademark/{page}/{limit} 
 */
// 对象的用法，是把request当对象去用 对象内部根据请求方式有对应的方法
// 这个方法内部无论是什么请求，第一个参数都代表路径（有可能带query和params参数）
// 方法当中第二个阐述，是什么不是固定的，要根据请求方式不同而不同
// get和delete 第二个参数是配置对象(属性名固定，属性值可改) 没有第三个参数
// post和post 第二个参数是data，请求体参数，第三个参数才是配置对象
export default {
    // 删除BaseTrademark
    remove(id) {
        return request.delete(`/admin/product/baseTrademark/remove/${id}`,)
    },
    // 新增品牌，没有id   数据在后端数据库当中存在之前是没有id的
    // 修改品牌  有    数据只要是从后端获取到一定是有id的
    addOrUpdate(trademark) {
        if (trademark.id) {
            // 修改
            return request.put('/admin/product/baseTrademark/update', trademark)
        } else {
            // 添加
            return request.post('/admin/product/baseTrademark/save', trademark)
        }
    },
    // 分页列表
    getPageList(page, limit) {
        return request.get(`/admin/product/baseTrademark/${page}/${limit}`)
    },
    // GET /admin/product/baseTrademark/getTrademarkList
    //    获取所有的品牌列表
    getList() {
        return request.get('/admin/product/baseTrademark/getTrademarkList')
    }

}