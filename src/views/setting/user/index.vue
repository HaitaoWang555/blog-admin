<template>
  <div class="app-container">
    <div class="filter-container">

      <el-button
        v-for="(item, index) in buttonArray"
        :key="index"
        v-waves
        :style="{background: item.color,color: 'white'}"
        class="filter-item"
        @click="btnEvent(item.value)"
      >{{ item.label }}</el-button>

    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      height="calc(100vh - 230px)"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" align="center" fixed />
      <el-table-column label="序号" align="center" type="index" />
      <el-table-column label="用户姓名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户邮箱" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.created | parseTime() }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后登陆时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.logged | parseTime() }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户类型" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status | typeFilter }}
          </el-tag>
        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible" :title="user.type==='edit'?'编辑用户':'新增用户'" @close="closeDialog">
      <UserForm v-if="dialogVisible" :user="user" :close="closeDialogInit" />
    </el-dialog>

  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import UserForm from './components/form'

import { getUserList, deleteUser } from '@/api/user'

const defaultUser = {
  email: '',
  permission: '',
  status: 0,
  password: ''
}

export default {
  name: 'User',
  components: {
    Pagination, UserForm
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        '0': 'danger',
        '1': 'primary',
        '2': 'success'
      }
      return statusMap[status]
    },
    typeFilter(status) {
      const statusMap = {
        '0': '禁止使用',
        '1': '管理人员',
        '2': '前台用户'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: false,
      buttonArray: [
        {
          label: '添加成员',
          value: 'addUser',
          color: '#169bd5'
        },
        {
          label: '删除',
          value: 'delUser',
          color: '#67ceef'
        },
        {
          label: '编辑',
          value: 'editUser',
          color: '#337df6'
        },
        {
          label: '禁用',
          value: 'disable',
          color: '#ff7a7b'
        }
      ],
      listQuery: {
        page: 1,
        pageSize: 15
      },
      multipleSelection: [],
      dialogVisible: false,
      user: {}
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.getList()
    },
    async getList() {
      const params = {}
      params.pageNum = this.listQuery.page
      params.pageSize = this.listQuery.pageSize
      this.listLoading = true
      const res = await getUserList(params)
      this.listLoading = false
      if (!res) return
      const data = res.data
      const { items } = data
      if (!items) {
        this.list = null
        return
      }
      this.total = data.total ? data.total : 0
      this.list = items
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    btnEvent(val) {
      if (val === 'addUser') { // 添加成员
        this.addUser()
      } else if (val === 'editUser') { // 编辑成员
        this.editUser()
      } else if (val === 'disable') { // 禁用
        this.setUserDisable(val)
      } else if (val === 'delUser') { // 批量删除
        this.delUser()
      }
    },
    addUser() {
      this.user = JSON.parse(JSON.stringify(defaultUser))
      this.user.type = 'add'
      this.dialogVisible = true
    },
    editUser() {
      if (this.notOnlyOneTips()) return
      const data = this.multipleSelection[0]
      this.user = Object.assign({}, data)
      this.user.type = 'edit'
      this.user.permission = 'ok'
      this.dialogVisible = true
    },
    async setUserDisable(val) {

    },
    async delUser() {
      const userIdArr = this.multipleSelection.map(i => i.id).join(',')
      if (userIdArr.length < 1) {
        this.$message({ message: '请选择用户', type: 'error' })
        return
      }
      const params = {}
      params.ids = userIdArr
      const res = await deleteUser(params)
      if (!res) return
      this.getList()
      this.$tips(res)
    },
    closeDialogInit() {
      this.closeDialog()
      this.getList()
    },
    closeDialog() {
      this.dialogVisible = false
    },
    notOnlyOneTips() {
      if (this.multipleSelection.length === 1) {
        return false
      } else if (this.multipleSelection.length > 1) {
        this.$message({ message: '只能选择一个用户', type: 'error' })
        return true
      } else {
        this.$message({ message: '请选择用户', type: 'error' })
        return true
      }
    }
  }
}
</script>
