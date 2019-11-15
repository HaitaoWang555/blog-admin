<template>
  <div class="userForm">
    <el-form ref="user" :model="user" label-width="80px" label-position="left" :rules="formRules">
      <el-form-item label="用户姓名" prop="username">
        <el-input v-model="user.username" placeholder="输入用户姓名" />
      </el-form-item>
      <el-form-item label="用户邮箱" prop="email">
        <el-input v-model="user.email" placeholder="输入用户邮箱" />
      </el-form-item>
      <el-form-item v-if="user.type === 'add'" label="初始密码" prop="password">
        <el-input v-model="user.password" type="password" placeholder="输入初始密码" />
      </el-form-item>
      <el-form-item label="用户类型">
        <el-select v-model="user.status" placeholder="选择用户类型">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="isAdmin" label="权限" prop="permission">
        <el-input v-model="user.permission" type="hidden" style="display: none" />
        <el-tree
          ref="tree"
          :check-strictly="checkStrictly"
          :data="routesData"
          :props="defaultProps"
          show-checkbox
          node-key="url"
          class="permission-tree"
          @check="checkTree"
        />
      </el-form-item>

      <el-form-item label-width="0" style="text-align: center">
        <el-button
          v-if="user.type === 'add'"
          :loading="loading"
          type="primary"
          @click="submitForm('user')"
        >提交</el-button>
        <el-button
          v-if="user.type === 'edit'"
          :loading="loading"
          type="primary"
          @click="submitForm('user')"
        >确认修改</el-button>
        <el-button @click="resetForm('user')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import path from 'path'
import { constantRoutes } from '@/router'

import { addUser, updateUser, haveUserName } from '@/api/user'

const formRules = {
  email: '用户邮箱',
  username: '用户姓名',
  permission: '权限',
  password: '初始密码'
}
const validateRequire = (rule, value, callback) => {
  if (!value) {
    callback(new Error(formRules[rule.field] + '为必传项'))
  } else {
    callback()
  }
}
const validateUsername = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入用户姓名'))
  } else {
    const data = {}
    data.username = value
    haveUserName(data).then(res => {
      if (res.msg) {
        callback(new Error(res.msg))
      } else {
        callback()
      }
    })
  }
}
export default {
  name: 'UserForm',
  props: {
    user: {
      type: Object,
      default: () => {
        return {}
      }
    },
    close: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      routes: [],
      serviceRoutes: [],
      formRules: {},
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      statusOptions: [
        {
          label: '禁止使用',
          value: 0
        },
        {
          label: '管理人员',
          value: 1
        },
        {
          label: '前台用户',
          value: 2
        }
      ],
      checkStrictly: false,
      loading: false
    }
  },
  computed: {
    routesData() {
      return this.routes
    },
    isAdmin() { // 是否为管理人员
      return this.user.status === 1
    }
  },
  created() {
    this.initRoutes()
    this.initFormRules()
  },
  methods: {
    async initRoutes() {
      const routes = JSON.parse(JSON.stringify(constantRoutes))
      this.serviceRoutes = routes
      this.routes = this.generateRoutes(routes)
      this.initPermission()
    },
    initPermission() {
      if (this.user.type === 'edit' && this.isAdmin) {
        const arr = this.user.permission ? this.user.permission.split(',') : []
        this.$refs.tree.setCheckedKeys(arr)
      }
    },
    initFormRules() {
      for (const key in formRules) {
        if (formRules.hasOwnProperty(key)) {
          this.formRules[key] = []
          if (key === 'permission') {
            this.formRules[key].push({
              required: true, validator: validateRequire, trigger: 'change'
            })
          } else if (key === 'username') {
            this.formRules[key].push({
              required: true, validator: validateUsername, trigger: 'blur'
            })
          } else {
            this.formRules[key].push({
              required: true, validator: validateRequire, trigger: 'blur'
            })
          }
        }
      }
    },
    generateRoutes(routes, basePath = '/') {
      const res = []

      for (let route of routes) {
        // skip some route
        if (route.hidden) { continue }

        const onlyOneShowingChild = this.onlyOneShowingChild(route.children, route)

        if (route.children && onlyOneShowingChild && !route.alwaysShow) {
          route = onlyOneShowingChild
        }

        const data = {
          path: path.resolve(basePath, route.path),
          title: route.meta && route.meta.title,
          url: route.meta && route.meta.url
        }

        // recursive child routes
        if (route.children) {
          data.children = this.generateRoutes(route.children, data.path)
        }
        res.push(data)
      }
      return res
    },
    onlyOneShowingChild(children = [], parent) {
      let onlyOneChild = null
      const showingChildren = children.filter(item => !item.hidden)

      // When there is only one child route, the child route is displayed by default
      if (showingChildren.length === 1) {
        onlyOneChild = showingChildren[0]
        onlyOneChild.path = path.resolve(parent.path, onlyOneChild.path)
        return onlyOneChild
      }

      // Show parent if there are no child route to display
      if (showingChildren.length === 0) {
        onlyOneChild = { ... parent, path: '', noShowingChildren: true }
        return onlyOneChild
      }
      return false
    },
    checkTree(data, obj) {
      if (obj.checkedKeys.length > 0) {
        this.user.permission = 'ok'
      } else {
        this.user.permission = null
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true
          switch (this.user.type) {
            case 'add':
              this.add()
              break
            case 'edit':
              this.edit()
              break
            default:
              break
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
      this.$refs.tree.setCheckedKeys([])
    },
    initParams() {
      const obj = Object.assign({}, this.user)
      if (this.isAdmin) {
        const checkedKeys = this.$refs.tree.getCheckedKeys()
        const halfCheckedKeys = this.$refs.tree.getHalfCheckedKeys()

        obj.permission = checkedKeys.join(',')
        obj.operation_permission = halfCheckedKeys.concat(checkedKeys).join(',')
      }
      return obj
    },

    async add() {
      const params = this.initParams()
      const res = await addUser(params)
      this.fnThen(res)
    },
    async edit(data) {
      const params = this.initParams()
      const res = await updateUser(params)
      this.fnThen(res)
    },
    fnThen(res) {
      this.loading = false
      if (!res) return
      this.$tips(res)
      this.close()
    }
  }
}
</script>
