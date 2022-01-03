<template>
  <div>
    <el-form label-width="100px" :model="skuInfo">
      <el-form-item label="SPU名称"> spu的名称 </el-form-item>
      <el-form-item label="SkU名称">
        <el-input placeholder="SKU名称" v-model="skuInfo.skuName"></el-input>
      </el-form-item>
      <el-form-item label="价格(元)">
        <el-input
          placeholder="价格(元)"
          type="number"
          v-model="skuInfo.price"
        ></el-input>
      </el-form-item>
      <el-form-item label="重量(千克)">
        <el-input
          placeholder="重量(千克)"
          type="number"
          v-model="skuInfo.weight"
        ></el-input>
      </el-form-item>
      <el-form-item label="规格描述">
        <el-input
          placeholder="规格描述"
          rows="4"
          type="textarea"
          v-model="skuInfo.skuDesc"
        ></el-input>
      </el-form-item>
      <el-form-item label="平台属性">
        <el-form :inline="true" label-width="100px">
          <el-form-item
            :label="attr.attrName"
            v-for="(attr, index) in attrList"
            :key="attr.id"
          >
            <el-select v-model="attr.attrIdValueId" placeholder="请选择">
              <el-option
                :label="attrValue.valueName"
                :value="`${attr.id}:${attrValue.id}`"
                v-for="attrValue in attr.attrValueList"
                :key="attrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-form
          :inline="true"
          label-width="100px"
          v-for="(spuSaleAttr, index) in spuSaleAttrList"
          :key="spuSaleAttr.id"
        >
          <el-form-item :label="spuSaleAttr.saleAttrName">
            <el-select v-model="spuSaleAttr.saleAttrIdValueId" placeholder="">
              <el-option
                :label="spuSaleAttrValue.saleAttrValueName"
                :value="`${spuSaleAttr.id}:${spuSaleAttrValue.id}`"
                v-for="spuSaleAttrValue in spuSaleAttr.spuSaleAttrValueList"
                :key="spuSaleAttrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="图片列表">
        <el-table
          style="width: 100%"
          border
          :data="spuImageList"
          @selection-change="handleSeleCtionChange"
        >
          <el-table-column type="selection" width="55"> </el-table-column>
          <el-table-column label="图片" width="width">
            <template v-slot="{ row, $index }">
              <img
                style="width: 100px; height: 100px"
                :src="row.imgUrl"
                alt=""
              />
            </template>
          </el-table-column>
          <el-table-column prop="imgName" label="名称" width="width">
          </el-table-column>
          <el-table-column label="操作" width="width">
            <template v-slot="{ row, $index }">
              <el-button
                v-if="row.isDefault === '0'"
                type="primary"
                size="mini"
                @click="changeDefault(spuImageList, row)"
                >设为默认</el-button
              >
              <el-tag v-else type="success">默认</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancleback"
          >取消</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "SkuForm",
  data() {
    return {
      spu: {},
      attrList: [],
      spuSaleAttrList: [], //
      spuImageList: [],
      skuImageList: [], //这个是专门用来收集选择的sku图片列表，后期保存的时候整理完成再去放到skuinfo里
      skuInfo: {
        // 父组件传递过来的
        category3Id: "",
        spuId: "",
        tmId: "",
        skuDefaultImg: "",
        // v-model直接收集
        price: "",
        weight: "",
        skuDesc: "",
        skuName: "",
        // 通过js代码收集
        skuAttrValueList: [
          /*  {
            attrId: 0,
            attrName: "string",
            id: 0,
            skuId: 0,
            valueId: 0,
            valueName: "string",
          }, */
        ],
        skuImageList: [
          /* {
            id: 0,
            imgName: "string",
            imgUrl: "string",
            isDefault: "string",
            skuId: 0,
            spuImgId: 0,
          }, */
        ],
        skuSaleAttrValueList: [
          /*   {
            id: 0,
            saleAttrId: 0,
            saleAttrName: "string",
            saleAttrValueId: 0,
            saleAttrValueName: "string",
            skuId: 0,
            spuId: 0,
          }, */
        ],
      },
    };
  },
  methods: {
    async getInitAddSkuFormData(spu, category1Id, category2Id) {
      this.spu = spu;
      let promise1 = this.$API.attr.getList(
        category1Id,
        category2Id,
        spu.category3Id
      );

      let promise2 = this.$API.sku.getSpuSaleAttrList(spu.id);
      let promise3 = this.$API.sku.getSpuImageList(spu.id);

      /* Promise.all()
       功能：同时处理多个promise对象
       参数：多个promise对象组成的数组 对象的数组
       返回值:返回一个新的promise对象
       返回的promise成功还是失败就看数组当中所有promise对象的处理结果
 
 */
      try {
        const result = await Promise.all([promise1, promise2, promise3]);
        this.attrList = result[0].data;
        this.spuSaleAttrList = result[1].data;

        let spuImageList = result[2].data;

        spuImageList.forEach((item) => (item.isDefault = "0"));

        this.spuImageList = spuImageList;
      } catch (error) {
        this.$message.error("获取初始化数据失败" + error.message);
      }
    },
    handleSeleCtionChange(val) {
      // console.log(val)
      this.skuImageList = val;
    },
    changeDefault(spuImageList, row) {
      spuImageList.forEach((item) => (item.isDefault = "0"));
      row.isDefault = "1";
      // 收集默认图片的路径
      this.skuInfo.skuDefaultImg = row.imgUrl;
    },
    // 保存操作
    async save() {
      let { spu, attrList, spuSaleAttrList, skuImageList, skuInfo } = this;
      skuInfo.category3Id = spu.category3Id;
      skuInfo.spuId = spu.id;
      skuInfo.tmId = spu.tmId;
      // 整理sku的图片列表
      skuInfo.skuImageList = skuImageList.map((item) => ({
        imgName: item.imgName,
        imgUrl: item.imgUrl,
        isDefault: item.isDefault,
        spuImgId: item.id,
      }));
      // 整理sku的平台属性值列表和销售属性值列表
      skuInfo.skuAttrValueList = attrList.reduce((prev, item) => {
        if (item.attrIdValueId) {
          let [attrId, valueId] = item.attrIdValueId.split(":");
          let obj = { attrId, valueId };
          prev.push(obj);
        }
        return prev;
      }, []);

      skuInfo.skuSaleAttrValueList = spuSaleAttrList.reduce((prev, item) => {
        if (item.saleAttrIdValueId) {
          let [saleAttrId, saleAttrValueId] = item.saleAttrIdValueId;
          let obj = { saleAttrId, saleAttrValueId };
          prev.push(obj);
        }
        return prev;
      }, []);
      try {
        const result = await this.$API.sku.addUpdate(skuInfo);
        if (result.code === 200 || result.code === 20000) {
          this.$message.success("保存sku成功");
          this.$emit("update:isShowSkuForm", false);
          this.resetData()
          // 不需要重新让父组件发送请求
        } else {
          this.$message.error("保存数据失败");
        }
      } catch (error) {
        this.$message.error("请求保存数据失败");
      }
    },
    resetData(){
      Object.assign(this._data,this.$options.data())
    },
    // 点击取消
    cancleback(){
      this.resetData()
      this.$emit('update:isShowSkuForm', false)
    }
    /* 
      for for...in for..of forEach
      // for循环是js当中最基础的 通常用来遍历数据组，它的效率一般，但是可以使用breack和continue
      for...in 循环遍历对象的包含数组，它效率最低，除了遍历自身还好遍历原型（属性必须是可迭代属性）
      for...of循环 循环专门遍历可迭代对象的，对象数据必须包含iterator方法，就可以使用for...of效率仅次于forEach
      forEach 是数组的一个方法效率是最高的，遍历数组，不能使用breack和continue
      for...in以后禁用，以后遍历对象先转数组在forEach Object.keys()
    */
  },
};
</script>

<style>
</style>