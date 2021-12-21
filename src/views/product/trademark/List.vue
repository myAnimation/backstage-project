<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAddDiglog"
      >添加</el-button
    >
    <el-table
      :data="trademarkList"
      border
      style="width: 100%; margin: 20px 0px"
    >
      <el-table-column
        label="序号"
        width="80"
        align="center"
        type="index"
      ></el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="width">
      </el-table-column>
      <el-table-column label="品牌LOGO" width="width">
        <template slot-scope="{ row, $index }">
          <img :src="row.logoUrl" alt=" " style="width: 80px; height: 60px" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="width">
        <template slot-scope="{ row, $index }">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="showUpdateDialog(row)"
            >修改</el-button
          >
          <el-button type="danger" icon="el-icon-delete" size="mini"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- @size-change="handleSizeChange"
       @current-change="handleCurrentChange" -->
    <el-pagination
      @current-change="getTrademarkList"
      @size-change="handleSizeChange"
      style="text-align: center"
      :current-page="page"
      :page-sizes="[3, 5, 10]"
      :page-size="limit"
      layout=" prev, pager, next, jumper,->,sizes,total"
      :total="total"
    >
    </el-pagination>

    <el-dialog
      :title="tmForm.id ? '添加品牌': '修改品牌'"
      :visible.sync="dialogFormVisible"
    >
      <el-form>
        <el-form-item label="品牌名称" label-width="100px">
          <el-input autocomplete="off" v-model="tmForm.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="100px">
          <el-upload
            class="avatar-uploader"
            action="/dev-api//admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
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
    return {
      page: 1,
      limit: 3,
      total: 0,
      trademarkList: [],
      dialogFormVisible: false,
      imageUrl: "",
      tmForm: {
        tmName: "",
        logoUrl: "",
      },
      // 收集数据的时候，要先明白自己要收集成什么东西，我们需要从接口文档上去查看发请求的额参数是啥
      // 下面这个对象就是添加品牌所要收集的对象
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
        if (result.code === 200 || result.code === 20000) {
          this.total = result.data.total;
          this.trademarkList = result.data.records;
        } else {
          alert("获取品牌列表失败");
        }
      } catch (error) {
        alert("请求获取品牌列表失败", error);
      }
    },
    // 修改跳转到别的页重新发送请求
    /*   handleCurrentChange(page){
       this.page = page
       this.getTrademarkList()
    }, */
    //  修改每页显示条数
    handleSizeChange(limit) {
      this.limit = limit;
      this.getTrademarkList();
    },
    //  保存路径
    handleAvatarSuccess(res, file) {
      this.tmForm.logoUrl = res.data || file.response.data;
    },
    //  判断图片符合不符合条件
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
    //  点击添加按钮弹出添加的dialog页面
    showAddDiglog() {
      this.dialogFormVisible = true;
      // 每次点击添加都要清空之前的数据
      this.tmForm = {
        tmName: "",
        logoUrl: "",
      };
    },
    // 点击修改 弹出弹框
    showUpdateDialog(row) {
      // 不能直接赋值 不然会导致请求没有发送且改变了页面
      // console.log(row)
      this.dialogFormVisible = true;
      this.tmForm = { ...row };
    },
    // 点击确定按钮，添加或者修改品牌
    async addOrUpdateTrademark() {
      let trademark = this.tmForm;
      try {
        const result = await this.$API.trademark.addOrUpdate(trademark);
        
       if (result.code === 200 || result.code === 20000) {
          // 提示
          this.$message.success(trademark.id ? "修改商品成功" : "添加商品成功");
          //   关闭dialog
         this.dialogFormVisible = false
          // 根据是添加还是修改，返回列表页，重新获取数据页码是不同的
          this.getTrademarkList(trademark.id ? this.page : 1);
        } else {
          alert(trademark.id ? "修改品牌失败" : "添加品牌成功");
        }
      } catch (error) {
        alert(trademark.id ? "请求修改品牌失败" : "请求添加品牌失败",error);
    
      }
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