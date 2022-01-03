<template>
  <div>
    <el-form label-width="100px">
      <el-form-item label="SPU名称">
        <el-input placeholder="SPU名称" v-model="spuInfo.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select v-model="spuInfo.tmId" placeholder="请选择品牌">
          <el-option
            :label="tm.tmName"
            :value="tm.id"
            v-for="(tm, index) in trademarkList"
            :key="tm.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input
          v-model="spuInfo.description"
          type="textarea"
          rows="4"
          placeholder="SPU描述"
        ></el-input>
      </el-form-item>
      <el-form-item label="SPU图片">
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :file-list="spuImageList"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-select
          v-model="unUsedSaleAttrIdName"
          :placeholder="
            unUsedSaleAttrList
              ? `还有${unUsedSaleAttrList.length}未选择`
              : '没有啦！！'
          "
        >
          <el-option
            :label="unUsedSaleAttr.name"
            :value="`${unUsedSaleAttr.id}:${unUsedSaleAttr.name}`"
            v-for="(unUsedSaleAttr, index) in unUsedSaleAttrList"
            :key="unUsedSaleAttr.id"
          ></el-option>
        </el-select>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!unUsedSaleAttrIdName"
          @click="addSaleAttr"
          >添加销售属性</el-button
        >
        <el-table :data="spuInfo.spuSaleAttrList" border style="width: 100%">
          <el-table-column type="index" label="序号" align="center" width="80">
          </el-table-column>
          <el-table-column prop="saleAttrName" label="属性名" width="150">
          </el-table-column>
          <el-table-column prop="prop" label="属性值名称列表" width="width">
            <template slot-scope="{ row, $index }">
              <!--   @close="handleClose(tag)" -->
              <el-tag
                closable
                :disable-transitions="false"
                v-for="(saleAttrValue, index) in row.spuSaleAttrValueList"
                :key="saleAttrValue.id"
                @close="row.spuSaleAttrValueList.splice($index, 1)"
              >
                {{ saleAttrValue.saleAttrValueName }}
              </el-tag>
              <!--  @keyup.enter.native="handleInputConfirm"
                @blur="handleInputConfirm" -->
              <!-- v-model收集数据在一个本来不存在的属性里面
              1.v-model必须是输入只会，此会在row身上出现新的属性
              2.如果用户根本没有输入东西，row身上是不会出现新的属性saleAttrValueName
              3.如果通过v-model输入新添加的属性，这个属性也是响应式的
              -->
              <el-input
                @keyup.enter.native="handleInputConfirm(row)"
                @blur="handleInputConfirm(row)"
                v-model="row.saleAttrValueName"
                v-if="row.isEdit"
                class="input-new-tag"
                ref="saveTagInput"
                size="small"
              >
              </el-input>
              <!--  @click="showInput" -->
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="showInput(row)"
                >+添加</el-button
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150">
            <template slot-scope="{ row, $index }">
              <HintButton
                type="danger"
                icon="el-icon-delete"
                title="删除销售属性"
                size="mini"
                @click="spuInfo.spuSaleAttrList.splice($index, 1)"
              ></HintButton>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancleBack">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "SpuForm",
  //   props:['isShowSpuForm'],
  data() {
    return {
      category3Id: "",
      // 选中未使用的销售属性，收集选中的销售属性的id和name
      unUsedSaleAttrIdName: "",
      dialogImageUrl: "",
      dialogVisible: false,
      // 下面这个对象是为了添加收集数据使用的
      // 修改的时候下面这个对象就被请求回来的数据对象给覆盖了
      // 添加和修改用的不是一个对象
      spuInfo: {
        category3Id: "",
        description: "",
        spuName: "",
        tmId: "",
        // 收集图片列表的时候并没有收集到这个列表当中
        // 因为后期我们需要整理图片格式，如果收集在这整理起来麻烦
        spuImageList: [
          /*   {
            id: 0,
            imgName: "string",
            imgUrl: "string",
            spuId: 0,
          }, */
        ],
        spuSaleAttrList: [
          /*     {
            baseSaleAttrId: 0,
            id: 0,
            saleAttrName: "string",
            spuId: 0,
            spuSaleAttrValueList: [
              {
                baseSaleAttrId: 0,
                id: 0,
                isChecked: "string",
                saleAttrName: "string",
                saleAttrValueName: "string",
                spuId: 0,
              },
            ],
          }, */
        ],
      },
      // 图片列表手机在这个列表当中，后期整理完成 之后再放到spuInfo里面
      spuImageList: [],
      baseSaleAttrList: [],
      trademarkList: [],
    };
  },
  methods: {
    // 添加图片完成之后会调这个函数
    // 添加一张图片，在这里去收集最新的图片列表
    handleSuccess(res, file, fileList) {
      this.spuImageList = fileList;
    },
    // 当删除一个图片会调这个函数
    // 删除一张图片，就在这个函数当中收集最新的图片列表
    handleRemove(file, fileList) {
      // console.log(file, fileList);
      this.spuImageList = fileList;
    },
    // 这是点击图片的放大镜，预览大图
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    // 点击添加
    async getInitAddSpuFormData(category3Id) {
      this.category3Id = category3Id;
      const result2 = await this.$API.trademark.getList();
      if (result2.code === 200 || result2.code === 20000) {
        this.trademarkList = result2.data;
      }
      const result3 = await this.$API.spu.getSaleAttrList();
      if (result3.code === 200 || result3.code === 20000) {
        this.baseSaleAttrList = result3.data;
      }
    },

    // 点击修改
    async getInitUpdateSpuFormData(spu, category3Id) {
      this.category3Id = category3Id;
      // 这里面就是写四个请求
      const result = await this.$API.spu.get(spu.id);
      if (result.code === 200 || result.code === 20000) {
        this.spuInfo = result.data;
      }
      const result1 = await this.$API.sku.getSpuImageList(spu.id);
      if (result1.code === 200 || result1.code === 20000) {
        const spuImageList = result1.data;
        //    往每个图片对象当中添加name和url
        spuImageList.forEach((item) => {
          item.name = item.imgName;
          item.url = item.imgUrl;
        });

        this.spuImageList = spuImageList;
      }
      const result2 = await this.$API.trademark.getList();
      if (result2.code === 200 || result2.code === 20000) {
        this.trademarkList = result2.data;
      }
      const result3 = await this.$API.spu.getSaleAttrList();
      if (result3.code === 200 || result3.code === 20000) {
        this.baseSaleAttrList = result3.data;
        //  console.log('baseSaleAttrList', result3.data)
      }
    },
    //点击添加销售属性按钮
    addSaleAttr() {
      //  1.把收集的数据变为一个对象
      let [baseSaleAttrId, saleAttrName] = this.unUsedSaleAttrIdName.split(":");
      // console.log(baseSaleAttrId, saleAttrName);
      // 2.把对象添加到指定的数组当中
      let obj = {
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: [],
      };
      this.spuInfo.spuSaleAttrList.push(obj);
      //  清空选中的项
      this.unUsedSaleAttrIdName = "";
    },
    // 点击添加按钮（添加属性row）
    showInput(row) {
      this.$set(row, "isEdit", true);
      this.$set(row, "saleAttrValueName", "");
      this.$nextTick(() => {
        this.$refs.saveTagInput.focus();
      });
    },
    // 用户输入玩数据只会回车或者失去焦点
    // 回车事件触发完成之后会默认再次触发失去焦点事件
    // 第一遍回车事件先触发，我们添加的值会添加进去没问问题
    // 第二遍再次我们的
    handleInputConfirm(row) {
      // console.log(row.spuSaleAttrValueList)
      let { baseSaleAttrId, saleAttrValueName } = row;
      //  console.log(baseSaleAttrId,saleAttrValueName,'baseSaleAttrId,saleAttrValueName')
      //  判断输入的属性值是不是空白
      if (saleAttrValueName.trim() === "") {
        row.saleAttrValueName = "";
        row.isEdit = false;
        //  this.$message.error('输入的属性值不能是空白')
        return;
      }
      //  判断输入的属性值是不是重复
      let isRepeat = row.spuSaleAttrValueList.some(
        (item) => item.saleAttrValueName === saleAttrValueName
      );
      if (isRepeat) {
        row.saleAttrValueName = "";
        row.isEdit = false;
        this.$message.error("输入的属性不能重复");
        return;
      }

      let obj = { baseSaleAttrId, saleAttrValueName };
      row.spuSaleAttrValueList.push(obj);
      row.saleAttrValueName = "";
      row.isEdit = false;
    },
    // 保存操作
    async save() {
      let { category3Id, spuInfo, spuImageList } = this;
      // 整理参数
      // 1.整理图片数据结构
      // 2.整理category3Id
      // 3.去掉所有的销售属性身上不需要的属性
      spuInfo.category3Id = category3Id;
      // 我们最终图片的格式是
      /* 
         id:0
         imgName:'string',
         imgUrl:'string,
         spuId:0
      */
      //  我们的图片有老的有新的
      // 新的图片内部没有imgName 和 imgUrl 但是name和url 只是url是本地路径，错的
      // 老的图片内部既有imgName 和 imgUrl 也有name和rul都是对的
      spuInfo.spuImageList = spuImageList.map((item) => {
        return {
          imgName: item.name,
          imgUrl: item.imgUrl || item.response.data,
        };
      });
      spuInfo.spuSaleAttrList.forEach((item) => {
        delete item.isEdit;
        delete item.saleAttrValueName;
      });

      try {
        const result = await this.$API.spu.addUpdate(spuInfo);
        if (result.code === 200 || result.code === 20000) {
          this.$message.success("保存spu成功");
          this.$emit("update:isShowSpuForm", false);
          //  重新发送请求 更新页面
          this.$emit("successBack", spuInfo.id);
          // 清空子组件当中data的数据
          this.resetData();
        } else {
          this.$message.error("保存spu失败");
        }
      } catch (error) {
        // this.$message.error("请求保存spu失败");
      }
    },
    resetData() {
      // this.unUsedSaleAttrIdName = "";
      // this.category3Id = "";
      // this.dialogImageUrl = "";
      // this.dialogVisible = false;
      // this.spuInfo = {
      //   category3Id: "",
      //   description: "",
      //   spuName: "",
      //   tmId: "",
      //   spuImageList: [],
      //   spuSaleAttrList: [],
      // };
      // this.spuImageList = [];
      // this.trademarkList = [];
      // this.baseSaleAttrList = [];

      Object.assign(this._data, this.$options.data());
    },
    cancleBack() {
      this.$emit("update:isShowSpuForm", false);
      this.resetData()
    },
  },
  computed: {
    unUsedSaleAttrList() {
      //   根据所有的销售属性列表 和spu自己的销售属性列表计算剩余的销售属性列表
      return this.baseSaleAttrList.filter((item) => {
        //    拿一项进来之后，我们要判断这一项的名字是不是和spu自己的销售属性列表当中所有项的名字都不一样
        // 如果是，就要了
        return this.spuInfo.spuSaleAttrList.every((item1) => {
          return item1.saleAttrName !== item.name;
        });
      });
    },
  },
};
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>