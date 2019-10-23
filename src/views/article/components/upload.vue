<template>
  <div class="article">
    <el-form
      ref="article"
      :model="article"
      :rules="formRules"
      label-position="right"
      label-width="100px"
      class="formWrap"
      style="max-width: 420px; margin: 0 auto"
    >

      <el-form-item label-width="0" prop="file" class="upload-container">
        <el-input v-model="article.file" type="hidden" />
        <el-upload
          ref="upload"
          drag
          :on-success="handleSuccess"
          :on-change="handleChange"
          :auto-upload="false"
          action="/api/manage/article/upload"
          multiple
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div slot="tip" class="el-upload__tip">文件不能超过2M</div>
          <div slot="tip" class="el-upload__tip">{{ text }}</div>
        </el-upload>
      </el-form-item>
      <el-form-item label-width="0" style="text-align: center">
        <el-button
          :loading="loading"
          type="primary"
          @click="submitForm('article')"
        >确认导入</el-button>
        <el-button @click="resetForm('article')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'Article',
  props: {
    article: {
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
    },
    editorModel: {
      type: String,
      default: 'markdownEditor'
    }
  },
  data() {
    return {
      formRules: {
        file: [
          { type: 'string', required: true, message: '请上传文件', trigger: 'change' }
        ]
      },
      loading: false
    }
  },
  computed: {
    text() {
      return this.editorModel === 'markdownEditor' ? '仅支持Markdown格式' : '支持.doc .doxc格式文件'
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
          this.import()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    import() {
      this.$refs.upload.submit()
    },
    handleChange(file, fileList) {
      if (file) {
        if (file.status === 'ready') {
          this.article.file = 'ready'
        } else if (file.status === 'fail') {
          this.loading = false
          this.$message({
            message: '上传失败',
            type: 'warning'
          })
        }
      }
    },
    handleSuccess(res, file) {
      this.loading = false
      if (res.success) {
        this.$tips(res)
        this.close()
        this.change(res)
      } else {
        this.$tips(res)
      }
    }
  }
}
</script>
