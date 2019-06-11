<template>
  <div class="meta">
    <el-form
      ref="meta"
      :model="meta"
      :rules="formRules"
      label-position="right"
      label-width="100px"
      class="formWrap"
      style="max-width: 420px; margin: 0 auto"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="meta.name" />
      </el-form-item>

      <el-form-item label="选择类型" prop="type">
        <el-select v-model="meta.type" placeholder="请选择类型" style="width: 100%">
          <el-option label="标签" value="tag" />
          <el-option label="分类" value="category" />
        </el-select>
      </el-form-item>

      <el-form-item label="选择字体颜色">
        <el-color-picker v-model="meta.textColor" size="mini" />
      </el-form-item>
      <el-form-item label="选择背景颜色">
        <el-color-picker v-model="meta.color" size="mini" />
      </el-form-item>

      <el-form-item label-width="0" style="text-align: center">
        <el-button
          v-if="meta.moudle === 'add'"
          :loading="loading"
          type="primary"
          @click="submitForm('meta')"
        >提交</el-button>
        <el-button
          v-if="meta.moudle === 'edit'"
          :loading="loading"
          type="primary"
          @click="submitForm('meta')"
        >确认修改</el-button>
        <el-button @click="resetForm('meta')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { createMetas, updateMetas } from '@/api/metas'

export default {
  name: 'Meta',
  props: {
    meta: {
      type: Object,
      default: () => {
        return {}
      }
    },
    close: {
      type: Function,
      default: null
    },
    change: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      formRules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { max: 64, message: '长度必须小于64字符', trigger: 'blur' }
        ],
        type: [
          { type: 'string', required: true, message: '请选择类型', trigger: 'change' }
        ]
      },
      loading: false
    }
  },
  methods: {
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true
          switch (this.meta.moudle) {
            case 'add':
              this.add(this.meta)
              break
            case 'edit':
              this.edit(this.meta)
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
    async add(form) {
      const res = await createMetas(form)
      if (!res) {
        this.loading = false
        return
      }
      this.$tips(res)
      this.loading = false
      this.close()
      this.change(res.data || form)
    },
    async edit(form) {
      const res = await updateMetas(form)
      if (!res) {
        this.loading = false
        return
      }
      this.$tips(res)
      this.loading = false
      this.close()
      this.change(res.data || form)
    }
  }
}
</script>
