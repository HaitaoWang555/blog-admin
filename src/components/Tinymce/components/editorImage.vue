<template>
  <div class="upload-container">
    <el-button :style="{background:color,borderColor:color}" icon="el-icon-upload" size="mini" type="primary" @click=" dialogVisible=true">
      上传图片
    </el-button>
    <el-dialog :visible.sync="dialogVisible">
      <el-upload
        :multiple="true"
        :file-list="fileList"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
        :before-upload="beforeUpload"
        :on-change="handleChange"
        class="editor-slide-upload"
        action="xx"
        list-type="picture-card"
        :http-request="handleUpload"
      >
        <el-button size="small" type="primary">
          点击上传
        </el-button>
      </el-upload>
      <el-button @click="dialogVisible = false">
        取 消
      </el-button>
      <el-button type="primary" @click="handleSubmit">
        确 定
      </el-button>
    </el-dialog>
  </div>
</template>

<script>
import { upload } from '@/api/public'

export default {
  name: 'EditorSlideUpload',
  props: {
    color: {
      type: String,
      default: '#1890ff'
    }
  },
  data() {
    return {
      dialogVisible: false,
      listArr: [],
      unUpload: false, // 不符合后台格式判断,true: 没上传成功
      fileList: []
    }
  },
  methods: {
    handleSubmit() {
      const arr = this.listArr.map(i => i.url)
      this.$emit('successCBK', arr)
      this.listArr = []
      this.fileList = []
      this.dialogVisible = false
    },
    handleSuccess(response, uid) {
      if (response && response.data) {
        this.listArr.push({ url: response.data, uid })
      }
    },
    handleUpload(option) {
      const formData = new FormData()

      if (option.data) {
        Object.keys(option.data).forEach(function(key) {
          formData.append(key, option.data[key])
        })
      }
      const uid = option.file.uid
      formData.append(option.filename, option.file, option.file.name)
      return upload(formData, option).then(res => {
        if (!res) this.unUpload = true
        this.handleSuccess(res, uid)
      })
    },
    handleChange(file, fileList) {
      if (this.unUpload && fileList) {
        fileList.pop()
      }
      this.fileList = fileList
    },
    handleRemove(file) {
      const uid = file.uid
      this.listArr = this.listArr.filter(i => i.uid !== uid)
    },
    beforeUpload(file) {
      this.unUpload = false
      const type = ['image/jpeg', 'image/png']
      const isJPG = type.includes(file.type)
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传图片只能是 JPG 或 PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    }
  }
}
</script>

<style lang="scss" scoped>
.editor-slide-upload {
  margin-bottom: 20px;
  /deep/ .el-upload--picture-card {
    width: 100%;
  }
}
</style>
