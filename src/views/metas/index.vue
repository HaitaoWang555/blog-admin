<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="searchValue"
        placeholder="可搜索名称"
        prefix-icon="el-icon-search"
        clearable
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="search"
      />
      <el-select
        v-model="selectValue"
        placeholder="选择类型"
        clearable
        style="width: 140px"
        class="filter-item"
      >
        <el-option
          v-for="item in selectArray"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="search"
      >
        搜索
      </el-button>
      <el-button
        v-for="(item, index) in buttonArray"
        :key="index"
        :style="{background: item.color,color: 'white'}"
        class="filter-item"
        @click="btnEvent(item.value)"
      >
        {{ item.label }}
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      height="calc(100vh - 230px)"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >

      <el-table-column type="selection" align="center" fixed />

      <el-table-column width="100px" align="center" label="背景色">
        <template slot-scope="scope">
          <span>{{ scope.row.color }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" width="100px" label="颜色">
        <template slot-scope="scope">
          <span>
            {{ scope.row.textColor }}
          </span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="属性" width="110">
        <template slot-scope="scope">
          <el-tag :type="scope.row.type | statusFilter">
            {{ scope.row.type | statusTextFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column min-width="200px" label="名称">
        <template slot-scope="scope">
          <span>
            {{ scope.row.name }}
          </span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" sortable label="发布时间">
        <template slot-scope="scope">
          <span>{{ scope.row.createdAt | parseTime() }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" sortable label="更新时间">
        <template slot-scope="scope">
          <span>{{ scope.row.updatedAt | parseTime() }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="180">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" @click="edit(scope.row, scope.$index)">
            修改
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"
    />
    <el-dialog :visible="dialog" :title="dialogTitle" append-to-body @close="closeDialog">
      <Meta v-if="dialog" :meta="metaData" :close="closeDialog" :change="changeList" />
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, delMetas, downloadList, downloadTemplate } from '@/api/metas'
import Pagination from '@/components/Pagination'
import Meta from './meta'

export default {
  name: 'MetasList',
  components: {
    Pagination,
    Meta
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        category: 'success',
        tag: 'primary'
      }
      return statusMap[status]
    },
    statusTextFilter(status) {
      const statusMap = {
        category: '分类',
        tag: '标签'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      searchValue: null,
      selectValue: null,
      buttonArray: [
        {
          label: '新增',
          value: 'add',
          color: '#3399ff'
        },
        {
          label: '批量导入',
          value: 'import',
          color: '#33b66a'
        },
        {
          label: '导出',
          value: 'export',
          color: '#337df6'
        },
        {
          label: '下载模板',
          value: 'download',
          color: '#337af2'
        },
        {
          label: '批量删除',
          value: 'del',
          color: '#ff7a7b'
        }
      ],
      selectArray: [
        {
          label: '标签',
          value: 'tag'
        },
        {
          label: '分类',
          value: 'category'
        }
      ],
      multipleSelection: [],
      list: null,
      listLoading: true,
      total: 0,
      listQuery: {
        page: 1,
        pageSize: 10
      },
      dialog: false,
      dialogTitle: '',
      metaData: {},
      changeIndex: 0
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList(query, sortBy) {
      this.listLoading = true
      this.listQuery.sortBy = sortBy || null
      const res = await fetchList(this.listQuery)
      if (!res) {
        this.listLoading = false
        return
      }
      const data = res.data
      const items = data.items
      this.list = items
      this.total = data.total
      this.listLoading = false
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    btnEvent(val) {
      const defaultMeta = {
        name: '',
        type: 'tag',
        textColor: '#ffffff',
        color: '#409EFF',
        excel: null
      }
      switch (val) {
        case 'add':
          this.dialog = true
          this.dialogTitle = '新增'
          this.metaData = defaultMeta
          this.metaData.moudle = 'add'
          break
        case 'import':
          this.dialog = true
          this.dialogTitle = '批量导入'
          this.metaData = defaultMeta
          this.metaData.moudle = 'import'
          this.metaData.excel = null
          break
        case 'export':
          this.export()
          break
        case 'download':
          this.download()
          break
        case 'del':
          (async() => {
            const ids = this.multipleSelection.map(i => i.id).join(',')
            if (!ids) return
            const res = await delMetas(ids)
            if (!res) return
            this.$tips(res)
            this.getList()
          })()
          break
        default:
          break
      }
    },
    search() {
      this.listQuery.name = this.searchValue
      this.listQuery.type = this.selectValue
      this.listQuery.page = 1
      this.getList()
    },
    edit(row, index) {
      const editMeta = row

      this.changeIndex = index
      this.dialog = true
      this.dialogTitle = '修改'
      this.metaData = editMeta
      this.metaData.moudle = 'edit'
    },
    closeDialog() {
      this.dialog = false
    },
    changeList(data) {
      if (this.metaData.moudle === 'import') {
        this.getList()
        return
      }
      if (this.changeIndex === 0 && this.metaData.moudle === 'add') this.list.unshift(data)
      this.$set(this.list, this.changeIndex, data || null)
      this.changeIndex = 0
    },
    sortChange(column) { // 排序方法
      if (!column.column) return
      const columnName = column.column.label
      const dir = {
        '发布时间': 'created_at',
        '更新时间': 'updated_at'
      }
      const columnVal = dir[columnName]
      const order = column.order.includes('desc') ? 'desc' : 'asc'
      const sortBy = columnVal + ' ' + order
      this.sortBy = sortBy
      this.getList(null, sortBy)
    },
    async export() {
      const ids = this.multipleSelection.map(i => i.id).join(',')

      const response = await downloadList(ids)
      this.downloadFile(response)
    },
    async download() {
      const response = await downloadTemplate()
      this.downloadFile(response)
    },
    downloadFile(response) {
      if (!response) return
      const fileName = response.headers['content-disposition'].split(';')[1].split('filename=')[1]
      const data = response.data
      const objectURL = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = objectURL
      link.setAttribute('download', decodeURIComponent(fileName))
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(objectURL)
    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 7px;
}
</style>
