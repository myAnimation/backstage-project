<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAddDialog"
      >添加</el-button
    >

    <!-- table组件必须动态数据的时候，依赖的是data属性
  data属性值必须是一个数组，表格组件才能展示
  这个data会默认给每个列传一份，每个列的内部是在展示我们传递进行的数据
  列的内部展示数据的时候，如果需要额外的结构 那么需要父组件决定
  -->
    <!-- 每个列有个prop属性 专门用于指定显示 -->
    <!-- 向用table必须给个数组 -->
    <el-table :data="trademarkList" border style="width: 100%; margin: 20px 0">
      <el-table-column
        type="index"
        align="center"
        prop="prop"
        label="序号"
        width="80"
      >
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="width">
      </el-table-column>
      <el-table-column prop="prop" label="品牌LOGO" width="width">
        <template slot-scope="{ row, $index }">
          <img :src="row.logoUrl" alt=" " style="width: 80px; height: 60px" />
        </template>
      </el-table-column>
      <el-table-column prop="prop" label="操作" width="width">
        <template slot-scope="{ row, $index }">
          <el-button
            type="warning"
            icon="el-icon-edit"
            @click="showUpdateDialog(row)"
            size="mini"
            >修改</el-button
          >
          <el-button
            type="danger"
            @click="deleteTrademark(row)"
            icon="el-icon-delete"
            size="mini"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="text-align: center"
      layout=" prev, pager, next, jumper,->,sizes,total"
      @current-change="getTrademarkList"
      @size-change="handleSizeChange"
      :current-page="page"
      :pager-count="5"  
      :page-sizes="[3, 5, 10]"
      :page-size="limit"
      :total="total"
    >
    </el-pagination>
    <el-dialog
      :title="tmForm.id ? '修改品牌' : '添加品牌'"
      :visible.sync="dialogFormVisible"
    >
      <el-form style="width: 80%" :model="tmForm" :rules="rules" ref="tmForm">
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input v-model="tmForm.tmName" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">
              只能上传jpg/png文件，且不超过500kb
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTrademark"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Trademark",
  data() {
    var validateTmName = (rule, value, callback) => {
      // callback这个函数代表验证通过还是不通过
      // 调用函数的时候传递参数，代表不通过，一般传递的都是错误对象
      // na调用函数的时候不传递参数代表通过
      // console.log(value)
      if(value.length < 2 || value.length > 10){
        callback(new Error('必须在2到10之间'))
      }else{
        callback()
      }
    };
    return {
      page: 1,
      limit: 3,
      total: 0,
      trademarkList: [],
      dialogFormVisible: false,

      // 收集数据的时候，要先明白组件要手机什么东西，我们需要从接口文档上去查看发送请求需要什么
      // 下面这个对象就是添加品牌所要收集的对象
      tmForm: {
        tmName: "",
        logoUrl: "",
      },
      // rules对象和手机数据的对象tmForm内部属性名是一样的
      // 每个属性的数据是一个数组，代表着这个字段的校验规则数组
      // 数组内部是一个一个的对象，每个对象代表着一个校验规则
      rules: {
        tmName: [
          { required: true, message: "请输入品牌名称", trigger: "blur" },
          // { min: 2, max: 10, message: '长度在2到10个字符串', trigger: 'change' },
          {validator: validateTmName, trigger: "change" },
        ],
        logoUrl: [{ required: true, message: "请上传图片", trigger: "change" }],
      },
    };
  },
  mounted() {
    this.getTrademarkList();
  },
  methods: {
    async getTrademarkList(page = 1) {
      this.page = page;
      try {
        const result = await this.$API.trademark.getPageList(
          this.page,
          this.limit
        );
        //   console.log(result);
        if (result.code === 200 || result.code === 20000) {
          this.trademarkList = result.data.records;
          this.total = result.data.total;
        } else {
          alert("获取商品列表失败");
        }
      } catch (error) {
        alert("请求获取商品列表失败" + error);
      }
    },
    /*    handleCurrentChange(page){
      this.page = page 
      this.getTrademarkList()
   } */
    handleSizeChange(limit) {
      this.limit = limit;
      this.getTrademarkList();
    },
    handleAvatarSuccess(res, file) {
      this.tmForm.logoUrl = res.data || file.response.data;
      console.log("res", res);
      console.log("file", file);

      //  下面拿的是本地的图片路径
      // this.imageUrl = URL.createObjectURL(file.raw);
    },
    //  上传之前 检查图片大小及格式符合不符合需求
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    //  1.弹出框的显示
    showAddDialog() {
      this.dialogFormVisible = true;
      //  解决添加之后曲调先，再次点击添加，数据还存在的问题
      // 每次点击添加按钮 清空数据
      this.tmForm = {
        tmName: "",
        logoUrl: "",
      };
    },
    //  点击修改按钮，弹出dialog
    showUpdateDialog(row) {
      //   把要修改的品牌对象地址赋值给tmForm，那么tmForm当中就自动有了tmName 和logoUrl 还多了个id
      console.log(row);
      this.dialogFormVisible = true;
      this.tmForm = { ...row };
      //  Object.assign(this.tmForm,row)
      //  要想明白深浅拷贝，先要明白啥是拷贝
      // 拷贝叫数据拷贝，拷贝的特点，内存当中必须出现新的内存（新的地址）才叫拷贝

      /* 
        首先会出现新定制，也就说对象必须是新对象
        我们所说的深浅，说的对象的内部
        如果拷贝出来的对象，内部的对象和原对象内部的对象地址一样，就是浅拷贝，反之就是深拷贝
      对象内部的基本数据，不存在拷贝
*/
    },
    // 点击确定按钮，添加或修改品牌
    addOrUpdateTrademark() {
      this.$refs['tmForm'].validate(async (valid) => {
        if (valid) {
          let trademark = this.tmForm;
          // 整理参数(需要整理再整理)
          // 发请求
          try {
            // 成功干啥
            const result = await this.$API.trademark.addOrUpdate(trademark);
            if (result.code === 200 || result.code === 20000) {
              //   提示
              this.$message.success(
                trademark.id ? "修改品牌成功" : "添加品牌成功"
              );
              //   关闭对话框
              this.dialogFormVisible = false;
              //  根据是添加还是修改，返回列表页的时候，重新获取数据的页码是不同的
              this.getTrademarkList(trademark.id ? this.page : 1);
            } else {
              // 失败干啥
              alert(trademark.id ? "修改品牌失败" : "添加品牌失败");
            }
          } catch (error) {
            // 失败干啥
            alert(trademark.id ? "请求修改品牌失败" : "请求添加品牌失败");
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    // 点击删除某一项
    deleteTrademark(row) {
      let { id } = row;
      // confirm  cancel
      this.$confirm(`此操作将永久删除${row.tmName}品牌吗, 是否继续?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            const result = await this.$API.trademark.remove(id);
            if (result.code === 200 || result.code === 20000) {
              //  弹框
              this.$message({
                type: "success",
                message: "删除成功!",
              });
              // 关闭弹框

              this.getTrademarkList(
                this.trademarkList.length > 1 ? this.page : this.page - 1
              );
            } else {
              alert("删除失败");
            }
          } catch (error) {
            this.$message({
              type: "info",
              message: "请求删除失败",
            });
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
  },
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>