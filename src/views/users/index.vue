<template>
  <div class="userContent">
    <Tabs value="name1">
        <TabPane label="商城用户" name="name1">
          <tabledata
          ref = 'table'
          page-position="center" 
          border 
          :columns="tableColumns"
          :queryUrl="queryUrl"
          :queryData="queryData"
          :type="type"
          :current="page"
          :pageSize="num"
          >
        </tabledata>
        </TabPane>
        <TabPane label="公众号关注者" name="name2">
          <tabledata
          ref = 'table'
          page-position="center"
          border 
          :columns="tableColumnsWx"
          :queryUrl="querUrlWx"
          :queryData="queryDataWx"
          :type="type"
          :current="page"
          :pageSize="num"
          >
        </tabledata>
        </TabPane>
    </Tabs>
  </div>
</template>
<style lang="less" scoped>
@import 'index.less';
</style>
<script>
import tabledata from '@/components/tabledata'
import { GETUSER, GETWXUSER } from '@/api'
export default {
  components: {
    tabledata
  },
  data () {
    return {
      queryUrl: GETUSER,
      querUrlWx: GETWXUSER,
      type: 'params',
      queryData: {
        eId: JSON.parse(this.$cookies.get('userInfo')).id
      },
      queryDataWx: {
        enterpriseid: -JSON.parse(this.$cookies.get('userInfo')).id
      },
      page: 1,
      num: 20,
      tableColumns: [
         {
          title: '头像',
          // key: 'nickname',
          align: 'center',
          // width: 120,
          render: (h, params) => {
            return h('img', {
              attrs: {
                src: params.row.headimgurl ? params.row.headimgurl : '--'
              },
              style: {
                'width': '50px',
                'display': 'inline-block',
                'margin': '10px'
              }
            })
          }
        },
         {
          title: '昵称',
          key: 'nickname',
          align: 'center'
        },
        {
          title: '性别',
          align: 'center',
          render: (h, params) => {
            if (params.row.sex === 1) {
              return '男'
            } else if(params.row.sex === 2){
              return '女'
            } else {
              return '--'
            }
          }
        }, {
          title: '用户地址',
          width: 400,
          align: 'center',
          render: (h, params) => {
              return params.row.address ? params.row.address : '--'
          }
        }, 
        {
          title: '是否注册',
          align: 'center',
          render: (h, params) => {
            let registered = ''
            if (params.row.userid === '-1') {
              registered = '未注册'
            } else {
              registered = '已注册'
            }
            return registered
          }
        },
        {
          title: '注册时间',
          align: 'center',
          render: (h, params) => {
            return params.row.createdate ? this.utils.timeFormat(params.row.createdate) : '--'
          }
        }
      ],
      tableColumnsWx: [
         {
          title: '头像',
          // key: 'nickname',
          align: 'center',
          // width: 120,
          render: (h, params) => {
            return h('img', {
              attrs: {
                src: params.row.headImgurl ? params.row.headImgurl : '--'
              },
              style: {
                'width': '50px',
                'display': 'inline-block',
                'margin': '10px'
              }
            })
          }
        },
         {
          title: '昵称',
          key: 'nickName',
          align: 'center'
        },
        {
          title: '性别',
          align: 'center',
          render: (h, params) => {
            if (params.row.sex === 1) {
              return '男'
            } else if(params.row.sex === 2){
              return '女'
            } else {
              return '--'
            }
          }
        }, {
          title: '关注地址',
          width: 400,
          align: 'center',
          render: (h, params) => {
              return params.row.address ? params.row.address : '--'
          }
        }, 
        {
          title: '微信地址',
          align: 'center',
          render: (h, params) => {
            return (
              <span>{ params.row.wxAddress || '--' }</span>
            )
          }
        },
        {
          title: '最后一次扫码时间',
          align: 'center',
          render: (h, params) => {
            return params.row.lastScanTime ? this.utils.timeFormat(params.row.lastScanTime) : '--'
          }
        }
      ]
    }
  }
}
</script>

