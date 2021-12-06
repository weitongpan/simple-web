<template>
  <div id="app" class="app">
    <div class="data-switch-box">
      <el-button  :type="isManual? 'primary': ''" ref="manual" @click="dataSwitch(true)">手动输入</el-button>
      <el-button :type="!isManual? 'primary': ''" ref="automatic" @click="dataSwitch(false)">导入表格</el-button>
    </div>
    <el-form v-if="isManual" :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="ruleForm.name"></el-input>
      </el-form-item>
      <el-form-item label="学号" prop="number">
        <el-input v-model="ruleForm.number"></el-input>
      </el-form-item>
      <el-form-item label="回答文本" prop="desc">
        <el-input type="textarea" v-model="ruleForm.desc"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
        <el-button @click="resetForm('ruleForm')">重置</el-button>
      </el-form-item>
    </el-form>
    <div v-else class="file-box">
      <el-upload
          class="upload-demo"
          action="/api/upload"
          :on-success="onSuccess"
          :on-remove="onRemove"
          multiple
          accept=".xlsx, .xls"
          :limit="1"
          :on-exceed="handleExceed"
          :file-list="fileList">
        <el-button size="small" type="primary">点击上传</el-button>
        <div slot="tip" class="el-upload__tip">只能上传表格文件</div>
      </el-upload>
    </div>
    <div class="table-box">
      <div class="btn-box">
        <div class="key-box">
          <el-input v-model="keyValue" placeholder="请输入关键字"></el-input>
          <el-button @click="statistics">统计</el-button>
        </div>
        <div>
          <el-button @click="viewCloud">查看云词图</el-button>
        </div>
      </div>
      <div class="table">
        <el-table
            :data="getTableData"
            stripe
            style="width: 100%">
          <el-table-column
              prop="number"
              label="学号"
              width="180">
          </el-table-column>
          <el-table-column
              prop="name"
              label="姓名"
              width="180">
          </el-table-column>
          <el-table-column
              prop="question"
              label="原回答">
          </el-table-column>
          <el-table-column
              prop="answer"
              label="现回答">
            <template slot-scope="scope">
              <div v-html="scope.row.answer"></div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="paging">
        <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            @current-change="cChange"
        >
        </el-pagination>
      </div>
    </div>
    <el-dialog  :visible.sync="dialogTableVisible">
      <div class="" v-html="statisticsData"></div>
      <div class="">
        <img :src="imgData" alt="">
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { insert, wordcloud, count, list } from './api/modules/pyApi'
export default {
  name: 'app',
  data() {
    return {
      keyValue: '',
      cpage: 1,
      statisticsData: '',
      imgData: '',
      dialogTableVisible: false,
      tableData: [],
      total: 0,
      isManual: true,
      ruleForm: {
        name: '',
        number: '',
        desc: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 1, max: 8, message: '长度 不能超过 8 个字符', trigger: 'blur' }
        ],
        number: [
          { required: true, message: '请输入学号', trigger: 'blur' }
        ],
        desc: [
          { required: true, message: '请填写回答文本', trigger: 'blur' }
        ]
      },
      fileList: []
    }
  },
  created () {
    this.packingList()
  },
  computed: {
    getTableData() {
      return this.tableData.slice((this.cpage - 1)*15,this.cpage*15)
    }
  },
  methods: {
    packingList() {
      this.cpage = 1
      list().then(res => {
        this.tableData = res.data.data
        this.total = this.tableData.length

      })
    },
    statistics() {
      if (this.keyValue === '') {
        this.$message.warning('请输入关键字')
        return null
      }
      count({
        keys: this.keyValue
      }).then((res) => {
        this.cpage = 1
        this.tableData = res.data.data
      })
    },
    viewCloud() {
      this.dialogTableVisible = true
      wordcloud().then(res=> {
        this.imgData = 'data:image/jpeg;base64,'+res.data
        console.log(this.imgData)
      })
    },
    cChange(res) {
      this.cpage = res
    },
    onRemove(file) {
      const index = this.fileList.findIndex(item => item.uid === file.uid)
      if (index !== -1) {
        this.fileList.splice(index, 1)
      }
    },
    onSuccess(res, file) {
      this.fileList.push(file)
      this.packingList()
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    dataSwitch(isPrimary) {
      this.isManual = isPrimary
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const n = parseInt(this.ruleForm.number)
          if (n === NaN || n.toString().length !== this.ruleForm.number.length) {
            this.$message.warning("学号必需为数字")
            return
          }
          const data = {
            name: this.ruleForm.name,
            number: n,
            question: this.ruleForm.desc,

          }
          insert(data).then(res => {
            if (res.data.code === 200) {
              this.$message.success('请求成功')
              this.packingList()
            } else {
              this.$message.error('请求错误')
            }
          }).catch(() => {
            this.$message.error('请求错误')
          })

        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  },
  watch: {
    dialogTableVisible() {
      if (!this.dialogTableVisible) {
        this.imgData = ''
        this.statisticsData = ''
      }
    }
  }
}
</script>

<style lang="scss">
.app{
  .data-switch-box{
    padding: 30px 0 30px 100px;
  }
  .demo-ruleForm{
    width: 500px;
  }
  .file-box{
    padding: 0 0 30px 100px;
  }
  .table-box{
    .btn-box{
      padding: 30px 0 0 100px;
      .key-box{
        display: flex;
        width: 300px;
        margin-bottom: 10px;
      }
    }
    .paging{
      text-align: center;
    }
    .table{
      width: 80%;
      margin: 20px auto 10px;
    }
  }
}
</style>
