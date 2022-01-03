<template>
  <el-card class="sku-list">
    <el-table border v-loading="loading" :data="skuList" style="width: 100%">
      <el-table-column
        type="index"
        label="序号"
        width="80"
        align="center"
        row-key="id"
      >
      </el-table-column>
      <el-table-column prop="skuName" label="名称"> </el-table-column>
      <el-table-column prop="skuDesc" label="描述"> </el-table-column>
      <el-table-column prop="prop" width="150" label="默认图片">
        <template v-slot="{ row, $index }">
          <img :src="row.skuDefaultImg" alt="" style="width: 80px" />
        </template>
      </el-table-column>
      <el-table-column prop="weight" label="重量(KG)"> </el-table-column>
      <el-table-column prop="price" label="价格(元)" width="80">
      </el-table-column>
      <el-table-column width="250" align="center" prop="prop" label="操作">
        <template slot-scope="{ row, $index }">
          <HintButton
            @click="getCancelAndSale(row, row.isSale)"
            type="info"
            style="margin: 0 10px"
            v-if="row.isSale == 0"
            title="上架"
            size="mini"
            icon="el-icon-top"
          ></HintButton>
          <HintButton
            @click="getCancelAndSale(row, row.isSale)"
            type="success"
            style="margin: 0 10px"
            v-if="row.isSale == 1"
            title="下架"
            size="mini"
            icon="el-icon-bottom"
          ></HintButton>

          <HintButton
          @click="toUpdateSku"
            slot="reference"
            type="primary"
            title="修改"
            size="mini"
            icon="el-icon-edit"
          ></HintButton>
          <HintButton
            type="info"
            style="margin: 0 10px"
            title="查看详情"
            @click="getSkuDrawer(row)"
            size="mini"
            icon="el-icon-info"
          ></HintButton>
          <el-popconfirm title="这是一段内容确定删除吗？" @onConfirm='remove(row.id)'>
            <HintButton
              slot="reference"
              type="danger"
              title="删除"
              size="mini"
              icon="el-icon-delete"
            ></HintButton>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      :current-page="page"
      :page-sizes="[5, 10, 20, 30, 40, 50]"
      @current-change="getSkuList"
      @size-change="handleSizeChange"
      :page-size="limit"
      align="center"
      layout=" prev, pager, next, jumper,->,sizes,total"
      :total="total"
    >
    </el-pagination>

    <el-drawer
      size="50%"
      title="我是标题"
      :visible.sync="drawer"
      :with-header="false"
      :direction="direction"
    >
      <el-row>
        <el-col :span="5">名称</el-col>
        <el-col :span="16">{{ skuInfo.skuName }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">描述</el-col>
        <el-col :span="16">{{ skuInfo.skuDesc }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">价格</el-col>
        <el-col :span="16">{{ skuInfo.price }}元</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">平台属性</el-col>
        <el-col :span="18">
          <el-tag
            type="success"
            style="margin-right: 5px"
            v-for="(attr, index) in skuInfo.skuAttrValueList"
            :key="attr.id"
          >
            {{ attr.attrId + "-" + attr.valueId }}
          </el-tag>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="5">商品图片</el-col>
        <el-col :span="18">
          <el-carousel trigger="click" height="400px">
            <el-carousel-item
              v-for="item in skuInfo.skuImageList"
              :key="item.id"
            >
              <img
                :src="item.imgUrl"
                alt=" "
                style="width: 100%; height: 100%"
              />
            </el-carousel-item>
          </el-carousel>
        </el-col>
      </el-row>
    </el-drawer>
  </el-card>
</template>

<script>
export default {
  name: "Sku",
  data() {
    return {
      total: 0,
      page: 1,
      limit: 10,
      skuList: [],
      drawer: false,
      direction: "rtl",
      skuInfo: {},
      loading: false,
    };
  },
  mounted() {
    
    this.getSkuList();
  },
  methods: {
    //修改sku 没有接口没法做
    toUpdateSku() {
      this.$message.info("正在开发中...");
    },
    async getSkuList(page = 1) {
      this.page = page;
      this.loading = true;
      try {
        const result = await this.$API.sku.getList(this.page, this.limit);
        if (result.code === 200 || result.code === 20000) {
          // console.log(result);
          this.skuList = result.data.records;
          this.total = result.data.total;
        } else {
          this.$message.error("获取sku列表失败");
        }
      } catch (error) {
        this.$message.error("请求获取sku列表失败");
      }
      this.loading = false;
    },
    // 更改出现条数
    handleSizeChange(size) {
      this.limit = size;
      this.getSkuList();
    },
    // APIget
    async getSkuDrawer(sku) {
      this.skuInfo = {};
      let id = sku.id;
      this.drawer = true;
      try {
        const result = await this.$API.sku.get(id);
        if (result.code === 200 || result.code === 20000) {
          console.log(result);
          this.skuInfo = result.data;
        } else {
          this.$message.error("获取到抽屉数据失败");
        }
      } catch (error) {
        this.$message.error("请求获取到抽屉数据失败");
      }
    },
    // 上架and下架
    async getCancelAndSale({ id }, flag) {
      console.log(flag);
      if (!flag) {
        //  上架
        try {
          const result = await this.$API.sku.onSale(id);
          if (result.code === 200 || result.code === 20000) {
            this.$message.success("上架成功");
            this.getSkuList(this.page);
          } else {
            this.$message.error("上架失败");
          }
        } catch {
          this.$message.error("请求上架失败");
        }
      } else {
        // 下架
        try {
          const result1 = await this.$API.sku.cancelSale(id);
          if (result1.code === 200 || result1.code === 20000) {
            this.$message.success("下架成功");
            this.getSkuList(this.page);
          } else {
            this.$message.error("下架失败");
          }
        } catch {
          this.$message.error("请求下架失败");
        }
      }
    },
    // 删除
    async remove(id) {
      // console.log(id)
      try {
        await this.$API.sku.remove(id);
        this.$message.success("删除SKU成功");
        this.getSkuList(this.page);
      } catch (error) {
        this.$message({
          message: error.message || "删除SKU失败",
          type: "error",
        });
      }
    },
  },
};
</script>
<style lang="scss" >
//  .el-carousel__indicator{
//   button{
//     display: inline-block;
//     width: 30px;
//     height: 30px;
//     border-radius: 50%;
//     background-color: red;
//   }
//    &.is-active {
//     button {
//       background-color: purple;
//     }
//    }
// }
</style>
 
<style lang='scss' scoped >
.sku-list {
  .el-row {
    height: 40px;
    .el-col {
      line-height: 40px;
      &.el-col-5 {
        font-size: 18px;
        font-weight: bold;
        text-align: right;
        margin-right: 20px;
      }
    }
  }
  ::v-deep .el-carousel__indicator {
    button {
      display: inline-block;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: red;
    }
    &.is-active {
      button {
        background-color: purple;
      }
    }
  }
}
</style>