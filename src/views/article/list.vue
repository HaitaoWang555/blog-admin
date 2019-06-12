<template>
  <div class="app-container">

    <div class="filter-container">
      <el-input
        v-model="listQuery.title"
        placeholder="可搜索标题"
        prefix-icon="el-icon-search"
        clearable
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="search"
      />
      <el-select
        v-model="listQuery.status"
        placeholder="发布状态"
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
      <el-select
        v-model="metaValue"
        value-key="name"
        multiple
        collapse-tags
        filterable
        default-first-option
        class="filter-item"
        placeholder="分类/标签"
      >
        <el-option
          v-for="item in metaOptions"
          :key="item.id"
          :label="item.name"
          :value="item"
        >
          <span style="float: left">{{ item.name }}</span>
          <span style="float: right; margin-right:15px;">
            <el-tag :type="item.type | statusFilterMeta">
              {{ item.type | statusTextFilterMeta }}
            </el-tag>
          </span>
        </el-option>
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

      <el-table-column class-name="status-col" label="发布状态" width="110">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">
            {{ scope.row.status | statusTextFilter }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column min-width="300px" label="标题">
        <template slot-scope="scope">
          <router-link :to="'/article/edit/'+scope.row.id" class="link-type">
            <span>{{ scope.row.title }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column min-width="120px" label="分类">
        <template slot-scope="scope">
          <el-tag
            class="metaTag"
            type="success"
          >
            {{ scope.row.category }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column min-width="120px" label="标签">
        <template v-if="scope.row.tags" slot-scope="scope">
          <el-tag
            v-for="item in scope.row.tags"
            :key="item"
            class="metaTag"
            type="primary"
          >
            {{ item }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" sortable label="发布时间">
        <template slot-scope="scope">
          <span>{{ scope.row.created_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" sortable label="更新时间">
        <template slot-scope="scope">
          <span>{{ scope.row.updated_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="120">
        <template slot-scope="scope">
          <router-link :to="'/article/edit/'+scope.row.id">
            <el-button type="primary" size="small" icon="el-icon-edit">
              编辑
            </el-button>
          </router-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pagesize" @pagination="getList" />
  </div>
</template>

<script>
import { fetchList, delArticles } from '@/api/article'
import { fetchList as getMetas } from '@/api/metas'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'ArticleList',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        publish: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    statusTextFilter(status) {
      const statusMap = {
        publish: '已发布',
        draft: '草稿',
        deleted: '已删除'
      }
      return statusMap[status]
    },
    statusFilterMeta(status) {
      const statusMap = {
        category: 'success',
        tag: 'primary'
      }
      return statusMap[status]
    },
    statusTextFilterMeta(status) {
      const statusMap = {
        category: '分类',
        tag: '标签'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      buttonArray: [
        {
          label: '新增',
          value: 'add',
          color: '#3399ff'
        },
        // {
        //   label: '导出',
        //   value: 'export',
        //   color: '#3399ff'
        // },
        {
          label: '批量删除',
          value: 'del',
          color: '#ff7a7b'
        }
      ],
      selectArray: [
        {
          label: '已发布',
          value: 'publish'
        },
        {
          label: '已删除',
          value: 'deleted'
        },
        {
          label: '草稿',
          value: 'draft'
        }
      ],
      metaOptions: [],
      multipleSelection: null,
      list: null,
      total: 0,
      listLoading: true,
      metaValue: null,
      listQuery: {
        page: 1,
        pagesize: 20,
        title: null,
        status: null
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.getList()
      this.getMetas()
    },
    getList(sortMsg) {
      this.listLoading = true
      this.listQuery.sortBy = sortMsg || null
      fetchList(this.listQuery).then(response => {
        this.listLoading = false
        if (!response) return
        this.list = response.data.items
        this.total = response.data.total
      })
    },
    getMetas() {
      getMetas({ list: 'all' }).then(res => {
        this.metaOptions = res.data.items
      })
    },
    search() {
      if (this.metaValue && this.metaValue.length > 0) {
        this.listQuery.tags = []
        this.listQuery.category = []
        this.metaValue.map(i => {
          if (i.type === 'tag') this.listQuery.tags.push(i.name)
          if (i.type === 'category') this.listQuery.category.push(i.name)
        })
        this.listQuery.tags = this.listQuery.tags.join(',')
        this.listQuery.category = this.listQuery.category.join(',')
      } else {
        this.listQuery.tags = null
        this.listQuery.category = null
      }
      this.getList()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    btnEvent(val) {
      switch (val) {
        case 'add':
          this.add()
          break

        case 'del':
          this.del()
          break
        default:
          break
      }
    },
    add() {
      this.$router.push('/article/create')
    },
    async del() {
      const ids = this.multipleSelection.map(i => i.id).join(',')
      debugger
      if (!ids) return
      const res = await delArticles(ids)
      if (!res) return
      this.$tips(res)
      this.getList()
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
      const sortMsg = columnVal + ',' + order
      this.sortMsg = sortMsg
      this.getList(sortMsg)
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
  top: 10px;
}
.metaTag {
  width: 100%;
  text-align: center;
  margin: 5px 0;
}
</style>
