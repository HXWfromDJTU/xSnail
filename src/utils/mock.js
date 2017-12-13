import Mock from 'mockjs'

export default Mock.mock('http://localhost:9527/index','get',function(){
    return Mock.mock({
        "user|1-3": [{
            'name': '@cname',
            'id': 88
        }]
    })
})