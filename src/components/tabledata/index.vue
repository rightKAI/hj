<style lang="less" scoped>
@import './index.less';
</style>

<template>
  <div class="tabledata">
    <Table
      ref="tabledata"
      :columns="columns"
      :data="tableData"
      :stripe="stripe"
      :border="border"
      :show-header="showHeader"
      :width="width"
      :height="height"
      :loading="loading"
      :disabled-hover="disabledHover"
      :highlight-row="highlightRow"
      :row-class-name="rowClassName"
      :size="size"
      :no-data-text="noDataText"
      :no-filtered-data-text="noFilteredDataText"
      @on-current-change="onCurrentChange"
      @on-select="onSelect"
      @on-select-cancel="onSelectCancel"
      @on-select-all="onSelectAll"
      @on-selection-change="onSelectionChange"
      @on-sort-change="onSortChange"
      @on-filter-change="onFilterChange"
      @on-row-click="onRowClick"
      @on-row-dblclick="onRowDblclick"
      @on-expand="onExpand">
      <slot name="header" slot="header"></slot>
      <slot name="footer" slot="footer"></slot>
      <slot name="loading" slot="loading"></slot>
    </Table>
    <Page
      class="tabledata-page"
      :style="{
        textAlign: pagePosition
      }"
      v-if="showPage"
      :current="current ? current : currentNum"
      :total="total ? total : totalNum"
      :page-size="pageSize"
      :page-size-opts="pageSizeOpts"
      :placement="placement"
      :size="sizeOfPage"
      :simple="simple"
      :show-total="showTotal"
      :show-elevator="showElevator"
      :show-sizer="showSizer"
      :class-name="className"
      @on-change="onChange"
      @on-page-size-change="onPageSizeChange">
      <slot name="page"></slot>
    </Page>
  </div>
</template>

<script>
import Http from '@/api'

export default {
  props: {
    queryUrl: {
      type: String
    },
    queryData: {
      type: Object
    },
    columns: {
      type: Array,
      default () {
        return []
      }
    },
    data: {
      type: Array,
      default () {
        return []
      }
    },
    type: {
      type: String,
      validator: function (value) {
        return [
          'json',
          'params'
        ].indexOf(value) > -1
      }
    },
    stripe: {
      type: Boolean,
      default: false
    },
    border: {
      type: Boolean,
      default: false
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    width: {
      type: [Number, String]
    },
    height: {
      type: [Number, String]
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabledHover: {
      type: Boolean,
      default: false
    },
    highlightRow: {
      type: Boolean,
      default: false
    },
    rowClassName: {
      type: Function
    },
    size: {
      type: String
    },
    noDataText: {
      type: String
    },
    noFilteredDataText: {
      type: String
    },
    showPage: {
      type: Boolean,
      default: true
    },
    current: {
      type: Number
    },
    total: {
      type: Number
    },
    pageSize: {
      type: Number,
      default: 10
    },
    pageSizeOpts: {
      type: Array,
      default () {
        return [10, 20, 30, 40]
      }
    },
    placement: {
      type: String,
      default () {
        return 'bottom'
      }
    },
    sizeOfPage: {
      type: String
    },
    simple: {
      type: Boolean,
      default: false
    },
    showTotal: {
      type: Boolean,
      default: false
    },
    showElevator: {
      type: Boolean,
      default: false
    },
    showSizer: {
      type: Boolean,
      default: false
    },
    className: {
      type: String
    },
    pagePosition: {
      type: String
    }
  },
  data () {
    return {
      totalNum: 0,
      currentNum: 1,
      resultData: []
    }
  },
  computed: {
    tableData () {
      if (this.data.length > 0) {
        return this.data
      } else {
        return this.resultData
      }
    }
  },
  methods: {
    onCurrentChange (currentRow, oldCurrentRow) {
      this.$emit('on-current-change', currentRow, oldCurrentRow)
    },
    onSelect (selection, row) {
      this.$emit('on-select', selection, row)
    },
    onSelectCancel (selection, row) {
      this.$emit('on-select-cancel', selection, row)
    },
    onSelectAll (selection) {
      this.$emit('on-select-all', selection)
    },
    onSelectionChange (selection) {
      this.$emit('on-selection-change', selection)
    },
    onSortChange (column, key, order) {
      this.$emit('on-sort-change', column, key, order)
    },
    onFilterChange (colData) {
      this.$emit('on-filter-change', colData)
    },
    onRowClick (rowData, index) {
      this.$emit('on-row-click', rowData, index)
    },
    onRowDblclick (rowData, index) {
      this.$emit('on-row-dblclick', rowData, index)
    },
    onExpand (rowData, status) {
      this.$emit('on-expand', rowData, status)
    },
    exportCsv (params) {
      return this.$refs.tabledata.exportCsv(params)
    },
    clearCurrentRow () {
      return this.$refs.tabledata.clearCurrentRow()
    },
    onChange (page) {
      this.$emit('on-change', page)
      this.currentNum = page
      this.autoAjaxForTable(page)
      this.$parent.page = page
      this.utils.scrollTo(document.getElementsByClassName('main-content')[0], 0)
    },
    onPageSizeChange (size) {
      this.$emit('on-page-size-change', size)
    },
    // 自动处理请求数据
    async autoAjaxForTable (page) {
      const loading = this.$Message.loading({
        content: '加载中...',
        duration: 0
      })
      const url = this.queryUrl
      const data = this.queryData
      let result
      if (this.type === 'json') {
        result = await Http.post(url, data, {params: {page, num: this.pageSize}})
      } else {
        data.num = this.pageSize
        data.page = page
        result = await Http.post(url, require('qs').stringify(data))
      }      
      setTimeout(loading, 500)
      if (result.errorCode > 0 ){
        this.resultData = result.data
        this.totalNum = +result.msg
        this.$router.push({query: {...this.$route.query, page}})
      } else {
        this.$Message.warning('获取列表失败')
      }
    },
    /**
    * 父组件调用更新表格
    */
    updateData () {
      this.autoAjaxForTable(this.current ? this.current : this.currentNum)
    }
  },
  mounted () {
    if (this.queryUrl && this.data.length === 0) {
      this.autoAjaxForTable(this.current ? this.current : this.currentNum)
    }
  }
}
</script>
