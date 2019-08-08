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
            <el-form-item style="margin-bottom: 40px;" prop="title">
              <MDinput v-model="postForm.title" :maxlength="100" name="name" required>
                标题
              </MDinput>
            </el-form-item>

            <div class="postInfo-container">
              <el-row>
                <el-col :span="6">
                  <el-form-item label-width="80px" label="标签&分类" class="postInfo-container-item">
                    <el-select
                      v-model="metaValue"
                      value-key="name"
                      multiple
                      collapse-tags
                      filterable
                      default-first-option
                      class="filter-item"
                      placeholder="分类/标签"
                      @change="metasChange"
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
                </el-col>
                <el-col :span="2">
                  <el-button type="primary" @click="createMeta">
                    创建新标签
                  </el-button>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>

        <el-form-item prop="content">
          <Screenfull class="screenfull" screenfull-name="markdown-editor" />
          <markdown-editor
            ref="markdownEditor"
            class="markdown-editor"
            height="calc(100vh - 320px)"
            :value="postForm.content"
          />
        </el-form-item>

      </div>
    </el-form>
    <el-dialog :visible="dialog" title="新增" append-to-body @close="closeDialog">
      <Meta v-if="dialog" :meta="metaData" :change="changeList" :close="closeDialog" />
    </el-dialog>
  </div>
</template>

<script>
import MarkdownEditor from './MarkdownEditor'
import MDinput from '@/components/MDinput'
import Screenfull from '@/components/Screenfull'
import Sticky from '@/components/Sticky' // 粘性header组件
import { fetchArticle, createArticle, updateArticle } from '@/api/article'
import { fetchList } from '@/api/metas'
import { validStrLen } from '@/utils/validate'
import { CommentDropdown } from './Dropdown'
import Meta from '../../metas/meta'

const defaultForm = {
  status: 'draft',
  title: '', // 文章题目
  content: '', // 文章内容
  id: undefined,
  comment_disabled: false
}

export default {
  name: 'ArticleDetail',
  components: { MarkdownEditor, MDinput, Sticky, CommentDropdown, Meta, Screenfull },
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
      metaData: {}
    }
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    } else {
      this.postForm = Object.assign({}, defaultForm)
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
    metasChange(val) {
      const num = val.filter(i => i.type === 'category')
      if (num.length > 1) {
        this.$message({ message: '只能选择一个分类', type: 'error' })
        return true
      }
    },
    getContent() {
      return this.$refs.markdownEditor.getHtml()
    },
    submitForm() {
      if (this.metasChange(this.metaValue)) return
      this.initMetaId()
      const newContent = this.getContent()
      if (newContent !== this.postForm.content) {
        this.postForm.content = this.getContent()
        this.postForm.isUpdateContent = 1
      }
      this.postForm.allow_comment = !this.postForm.comment_disabled
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.postForm.status = 'publish'
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
      if (this.postForm.content.length === 0 || this.postForm.title.length === 0) {
        this.$message({
          message: '请填写必要的标题和内容',
          type: 'warning'
        })
        return
      }
      this.postForm.status = 'draft'
      if (this.metasChange(this.metaValue)) return
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
      this.metaData = defaultMeta
      this.metaData.moudle = 'add'
    },
    closeDialog() {
      this.dialog = false
    },
    changeList() {
      this.initMetas()
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";
.createPost-container {
  position: relative;
  .createPost-main-container {
    padding: 40px 45px 20px 50px;
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
