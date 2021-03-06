<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">
      <sticky :z-index="10" :class-name="'sub-navbar '+postForm.status">
        <CommentDropdown v-model="postForm.comment_disabled" />
        <el-button :loading="loading" style="margin-left: 10px;" type="success" @click="submitForm">
          发布
        </el-button>
        <el-button :loading="loading" type="warning" @click="draftForm">
          草稿
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-row>

          <el-col :span="24">
            <el-form-item style="margin-bottom: 10px;" prop="title">
              <MDinput v-model="postForm.title" :maxlength="100" name="name" required>
                标题
              </MDinput>
            </el-form-item>

            <div class="postInfo-container">
              <div style="width: 270px" class="postInfo-container-item">
                <el-form-item style="margin-bottom: 0;" label-width="80px" label="标签&分类">
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
                </el-form-item>
              </div>
              <div style="width: 110px" class="text-center postInfo-container-item">
                <el-button type="primary" @click="createMeta">
                  创建新标签
                </el-button>
              </div>
              <div style="width: 110px" class="text-center postInfo-container-item">
                <el-button type="primary" @click="upload">
                  上传文章
                </el-button>
              </div>
              <div style="width: 220px" class="text-center postInfo-container-item">
                <el-select v-model="editorModel" placeholder="请选择" @change="changeEditorModel">
                  <el-option label="MarkDown编辑器" value="markdownEditor" />
                  <el-option label="富文本编辑器" value="tinymceEditor" />
                </el-select>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-form-item v-if="showEditor" prop="content">
          <template v-if="editorModel === 'markdownEditor'">
            <Screenfull class="screenfull" screenfull-name="markdown-editor" />
            <markdown-editor
              ref="markdownEditor"
              class="markdown-editor"
              height="calc(100vh - 238px)"
              :value="postForm.content"
            />
          </template>
          <Tinymce
            v-else
            ref="markdownEditor"
            class="markdown-editor"
            height="calc(100vh - 397px)"
            :value="postForm.content"
          />
        </el-form-item>

      </div>
    </el-form>
    <el-dialog :visible="dialog" title="新增" append-to-body @close="closeDialog">
      <Meta v-if="dialog && dialogMeta" :meta="metaData" :change="changeList" :close="closeDialog" />
      <Upload
        v-if="dialog && dialogUpload"
        :editor-model="editorModel"
        :article="uploadData"
        :change="completeUpload"
        :close="closeDialog"
      />
    </el-dialog>
  </div>
</template>

<script>
import MarkdownEditor from './MarkdownEditor'
import Tinymce from './Tinymce'
import MDinput from '@/components/MDinput'
import Screenfull from '@/components/Screenfull'
import Sticky from '@/components/Sticky' // 粘性header组件
import { fetchArticle, createArticle, updateArticle } from '@/api/article'
import { fetchList } from '@/api/metas'
import { validStrLen } from '@/utils/validate'
import { CommentDropdown } from './Dropdown'
import Meta from '../../metas/meta'
import Upload from './upload'
import { getSetting, setSetting } from '@/utils/auth'

const defaultForm = {
  status: 'draft',
  type: getSetting() || 'markdownEditor', // 使用编辑器类型
  title: '', // 文章题目
  content: '', // 文章内容
  id: undefined,
  comment_disabled: false
}

export default {
  name: 'ArticleDetail',
  components: { MarkdownEditor, MDinput, Sticky, CommentDropdown, Meta, Upload, Screenfull, Tinymce },
  filters: {
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
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateObj = {
      title: '文章标题',
      content: '文章内容'
    }
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: validateObj[rule.field] + '为必传项',
          type: 'error'
        })
        callback(new Error(validateObj[rule.field] + '为必传项'))
      } else {
        if (rule.field === 'title' && !validStrLen(value)) {
          this.$message({
            message: validateObj[rule.field] + '长度不能超过64',
            type: 'error'
          })
          callback(new Error(validateObj[rule.field] + '长度不能超过64'))
        }
        callback()
      }
    }
    return {
      postForm: Object.assign({}, defaultForm),
      loading: false,
      userListOptions: [],
      rules: {
        title: [{ validator: validateRequire }],
        content: [{ validator: validateRequire }]
      },
      tempRoute: {},
      metaValue: null,
      metaOptions: null, // 标签、分类
      dialog: false,
      dialogMeta: false,
      dialogUpload: false,
      metaData: {},
      uploadData: {},
      showEditor: false, // 编辑器根据文章类型展示
      editorModel: 'markdownEditor'
    }
  },
  created() {
    this.editorModel = getSetting() || 'markdownEditor'
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    } else {
      this.postForm = Object.assign({}, defaultForm)
      this.showEditor = true
      this.initMetas()
    }

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    fetchData(id) {
      fetchArticle(id).then(response => {
        this.postForm = response.data
        this.postForm.comment_disabled = !this.postForm.allow_comment
        this.editorModel = this.postForm.type
        this.showEditor = true
        this.initMetas()
      }).catch(err => {
        console.log(err)
      })
    },
    async initMetas() {
      const res = await fetchList({ list: 'all' })
      if (res) this.metaOptions = res.data.items
      if (this.isEdit) this.findMetaId()
    },
    getContent() {
      return this.$refs.markdownEditor.getHtml()
    },
    submitForm() {
      this.initMetaId()
      const newContent = this.getContent()
      this.postForm.content = newContent !== this.postForm.content
        ? newContent
        : null
      this.postForm.allow_comment = !this.postForm.comment_disabled
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.postForm.status = 'publish'
          this.postForm.type = getSetting()
          if (!this.isEdit) {
            this.createArticle()
          } else {
            this.updateArticle()
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    draftForm() {
      this.postForm.content = this.getContent()
      if (this.postForm.content.length === 0 || this.postForm.title.length === 0) {
        this.$message({
          message: '请填写必要的标题和内容',
          type: 'warning'
        })
        return
      }
      this.postForm.status = 'draft'
      this.postForm.type = getSetting()
      this.initMetaId()
      this.postForm.allow_comment = !this.postForm.comment_disabled
      this.loading = true
      if (!this.isEdit) {
        this.createArticle()
      } else {
        this.updateArticle()
      }
    },
    async createArticle() {
      const res = await createArticle(this.postForm)
      if (res) {
        this.$tips(res)
      } else {
        this.postForm.status = 'error'
      }
      this.loading = false
    },
    async updateArticle() {
      const res = await updateArticle(this.postForm)
      if (res) {
        this.$tips(res)
      } else {
        this.postForm.status = 'error'
      }
      this.loading = false
    },
    findMetaId() {
      this.postForm.tags = this.postForm.tags ? this.postForm.tags : []
      this.postForm.category = this.postForm.category ? this.postForm.category : []
      const arr = this.postForm.tags.concat(this.postForm.category)

      if (this.metaOptions) {
        this.metaValue = this.metaOptions.filter(i => {
          return arr.includes(i.name)
        })
      }
    },
    initMetaId() {
      if (this.metaValue && this.metaValue.length > 0) {
        this.postForm.tags = []
        this.postForm.category = []
        this.metaValue.map(i => {
          if (i.type === 'tag') this.postForm.tags.push(i.name)
          if (i.type === 'category') this.postForm.category.push(i.name)
        })
        this.postForm.tags = this.postForm.tags.join(',')
        this.postForm.category = this.postForm.category.join(',')
      } else {
        this.postForm.tags = null
        this.postForm.category = null
      }
    },
    // 创建标签相关
    createMeta() {
      const defaultMeta = {
        name: '',
        type: 'tag',
        textColor: '#ffffff',
        color: '#409EFF'
      }
      this.dialog = true
      this.dialogMeta = true
      this.metaData = defaultMeta
      this.metaData.moudle = 'add'
    },
    closeDialog() {
      this.dialog = false
      this.dialogMeta = false
      this.dialogUpload = false
    },
    changeList() {
      this.initMetas()
    },
    // 上传文章
    upload() {
      const defaultMeta = {
        file: null
      }
      this.dialog = true
      this.dialogUpload = true
      this.uploadData = defaultMeta
    },
    completeUpload(res) {
      let value = res.data
      if (!value) return
      value = value.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, (match, capture) => {
        const string = capture.slice(0, 1)
        const start = capture.lastIndexOf(string) + 1
        let newSrc = capture.slice(0, start) + 'thumbnail/' + capture.slice(start)
        newSrc = newSrc.replace('.png', '.png.jpg')
        if (this.isImgType(capture)) {
          return match.replace(capture, newSrc)
        } else {
          return match
        }
      })
      this.$refs.markdownEditor.setValue(value)
    },
    isImgType(url) {
      const imgType = ['.png', '.jpg', '.jpeg']
      for (let index = 0; index < imgType.length; index++) {
        const element = imgType[index]
        return url.indexOf(element) > -1
      }
    },
    changeEditorModel(val) {
      this.postForm.content = this.getContent()
      setSetting(val)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";
.createPost-container {
  position: relative;
  .createPost-main-container {
    padding: 10px 45px;
    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;
      .postInfo-container-item {
        float: left;
      }
    }
  }
  .screenfull {
    position: absolute;
    right: 20px;
    top: 0;
    z-index: 100;
  }
  .markdown-editor {
    position: relative;
    background-color: white;
  }
}
</style>
