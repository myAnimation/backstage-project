<template>
  <div>
    <el-form :model="cForm" :inline="true" :disabled='!isShowList' class="demo-form-inline">
      <el-form-item label="一级分类">
        <!-- select v-model收集的是选择的option的value值 -->
        <el-select
          v-model="cForm.category1Id"
          placeholder="请选择"
          @change="handlerCategory1"
        >
          <el-option
            :label="c1.name"
            :value="c1.id"
            v-for="(c1, index) in category1List"
            :key="c1.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="二级分类">
        <!-- select v-model收集的是选择的option的value值 -->
        <el-select
          v-model="cForm.category2Id"
          placeholder="请选择"
          @change="handlerCategory2"
        >
          <el-option
            :label="c2.name"
            :value="c2.id"
            v-for="(c2, index) in category2List"
            :key="c2.id"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="三级分类">
        <!-- select v-model收集的是选择的option的value值 -->
        <el-select
          @change="handlerCategory3"
          v-model="cForm.category3Id"
          placeholder="请选择"
        >
          <el-option
            :label="c3.name"
            :value="c3.id"
            v-for="(c3, index) in category3List"
            :key="c3.id"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "CategorySelector",
  props:['isShowList'],
  data() {
    return {
      category1List: [],
      category2List: [],
      category3List: [],
      cForm: {
        category1Id: "",
        category2Id: "",
        category3Id: "",
      },
    };
  },
  mounted() {
    this.getCategory1List();
  },
  methods: {
    //   获取一级分类
    async getCategory1List() {
      try {
        const result = await this.$API.category.getCategory1();
        if (result.code === 200 || result.code === 20000) {
          this.category1List = result.data;
        } else {
          alert("获取一级分类失败");
        }
      } catch (error) {
        alert("请求获取一级分类失败");
      }
    },
    //获取二级分类
    async handlerCategory1(category1Id) {
      // 请求之前把23级清空
      this.category2List = [];
      this.category3List = [];
      this.category2Id = "";
      this.category3Id = "";
      //   无论选择几极分类都要向父组件通信
      this.$emit("changeCategory", {categoryId:category1Id,level:1});

      try {
        const result = await this.$API.category.getCategory2(category1Id);

        if (result.code === 200 || result.code === 20000) {
          //    console.log(result.data)
          this.category2List = result.data;
        } else {
          alert("获取二级分类失败");
        }
      } catch (error) {
        alert("请求获取二级分类失败");
      }
    },
    //获取三级级分类
    async handlerCategory2(category2Id) {
      this.category3List = [];
      this.category3Id = "";
      this.$emit("changeCategory", {categoryId:category2Id,level:2});
      try {
        const result = await this.$API.category.getCategory3(category2Id);

        if (result.code === 200 || result.code === 20000) {
          //    console.log(result.data)
          this.category3List = result.data;
        } else {
          alert("获取三级分类失败");
        }
      } catch (error) {
        alert("请求获取三级分类失败");
      }
    },
    handlerCategory3(category3Id) {
        this.$emit('changeCategory',{categoryId:category3Id,level:3})
    },
  },
};
</script>

<style>
</style>