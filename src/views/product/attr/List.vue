<template>
  <div>
    <el-card>
      <CategorySelector :isShowList='isShowList' @changeCategory="changeCategory"></CategorySelector>
    </el-card>
    <el-card style="margin-top: 20px">
      <!-- 这个是列表界面 -->
      <div v-show="isShowList">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="showAddDiv"
          >添加属性</el-button
        >
        <el-table :data="attrList" border style="width: 100%">
          <el-table-column type="index" label="序号" width="80">
          </el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="150">
          </el-table-column>
          <el-table-column label="属性列表" width="width">
            <template slot-scope="{ row, $index }">
              <el-tag
                type="success"
                v-for="(attrValue, index) in row.attrValueList"
                :key="attrValue.id"
              >
                {{ attrValue.valueName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150">
            <template slot-scope="{ row, $index }">
              <HintButton
                type="warning"
                icon="el-icon-edit"
                size="mini"
                title="修改"
                style="margin: 0 10px"
                @click="showAddUpdate(row)"
              ></HintButton>
            
              
              <el-popconfirm
                :title="`你确定删除${row.attrName}吗？`"
                @onConfirm="deleteAttr(row)"
              >
                <HintButton
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  title="删除"
                  size="mini"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 这是添加和修改 -->
      <div v-show="!isShowList">
        <el-form :inline="true" :model="attrForm">
          <el-form-item label="属性名">
            <el-input
              v-model="attrForm.attrName"
              placeholder="请输入属性名"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button :disabled='!attrForm.attrName' type="primary" icon="el-icon-plus" @click="addAttrValue"
          >添加属性值</el-button
        >
        <el-button @click="isShowList = true">取消</el-button>
        <el-table
          border
          :data="attrForm.attrValueList"
          style="width: 100%; margin: 20px 0"
        >
          <el-table-column type="index" label="序号" width="80">
          </el-table-column>
          <el-table-column prop="prop" label="属性值名称" width="width">
            <template slot-scope="{ row, $index }">
              <el-input
                :ref="$index"
                @blur="toLook(row)"
                size="mini"
                @keyup.enter.native="toLook(row)"
                v-if="row.isEdit"
                v-model="row.valueName"
                placeholder="请输入属性值名称"
              ></el-input>
              <span
                v-else
                style="display: block; width: 100%"
                @click="toEdit(row, $index)"
                >{{ row.valueName }}</span
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <el-popconfirm
                :title="`确定删除${row.valueName}吗？`"
                @onConfirm="attrForm.attrValueList.splice($index, 1)"
              >
                <HintButton
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  title="删除"
                  size="mini"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" @click="save" :disabled='!attrForm.attrValueList.length'>保存</el-button>
        <el-button @click="isShowList = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "Attr",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      attrList: [],
      isShowList: true,
      attrForm: {
        attrName: "",
        /* 第一步：先让table去展示这个属性值数组 
           第二步：点击添加属性值按钮，往属性值数组当中添加一个数据
           这个数据的格式是一个对象，对象里面的属性包含 attrId valueName
           添加这个对象的时候，valueName是空的，留着后期让用户输入的
           第三部：数据添加会造成table表格会展示一行，我们可以在这行当中显示一个input框
           让用户去输入想要的属性值名称
           attrId的值，是当前这个属性值所属性属性的id
        */
        attrValueList: [
          //  {
          //    "attrId": 0,
          //    "valueName": "string"
          //  }
        ],
        categoryId: "",
        categoryLevel: 3,
      },
    };
  },
  methods: {
    changeCategory({ categoryId, level }) {
      if (level === 1) {
        this.attrList = [];
        this.category2Id = "";
        this.category3Id = "";

        this.category1Id = categoryId;
      } else if (level === 2) {
        this.attrList = [];
        this.category3Id = "";

        this.category2Id = categoryId;
      } else {
        this.category3Id = categoryId;
        //   发送请求获取函数列表
        this.getAttrList();
      }
    },
    async getAttrList() {
      try {
        let { category1Id, category2Id, category3Id } = this;
        const result = await this.$API.attr.getList(
          category1Id,
          category2Id,
          category3Id
        );
        if (result.code === 200 || result.code === 20000) {
          //  console.log(result.data)
          this.attrList = result.data;
        } else {
          this.$message.error("获取属性列表失败");
        }
      } catch (error) {
        this.$message.error("请求获取属性列表失败");
      }
    },
    //  这是点击添加属性按钮显示添加属性界面
    showAddDiv() {
      this.isShowList = false;
      this.attrForm = {
        attrName: "",
        attrValueList: [
          //  {
          //    "attrId": 0,
          //    "valueName": "string"
          //  }
        ],
        categoryId: this.category3Id, //
        categoryLevel: 3,
      };
    },
    //  点击添加属性值按钮
    addAttrValue() {
      this.attrForm.attrValueList.push({
        attrId: this.attrForm.id,
        //添加属性是可以添加属性值的 ，此时这个id是undefined，因为添加属性的时候属性是没有id的
        // 修改属性也是可以添加属性值的，修改属性，属性当中是有id的
        valueName: "",
        isEdit: true,
      });
      this.$nextTick(() => {
        this.$refs[this.attrForm.attrValueList.length - 1].focus();
      });
    },
    //  点击修改按钮
    showAddUpdate(row) {
      this.isShowList = false;
      // this.attrForm= {...row}
      //  this.attrForm= {...row} 因为里面有数组所以要深拷贝
      this.attrForm = cloneDeep(row);
      // this.attrForm.attrValueList.forEach(item => item.isEdit = false) 不能写 因为后期isEdit不是响应式
      this.attrForm.attrValueList.forEach((item) =>
        this.$set(item, "isEdit", false)
      );
    },
    // 添加模式标识数据 每个属性值无论是新添加的还是老的都有自己的添加模式和查看模式
    // 对应先添加的属性值，一上来显示的就是input 老的一上来就是span
    // 说白了就是给每个属性值添加标识数据
    toEdit(row, index) {
      row.isEdit = true;
      // 自动获取焦点
      this.$nextTick(() => {
        this.$refs[index].focus();
      });

      // this.$refs[index].focus()
    },
    // 判断
    toLook(row) {
      let valueName = row.valueName;
      if (valueName.trim() === "") {
        // this.$message.error("输入的属性值名称不能为空白");
        row.valueName = "";
        return;
      }
      let isRepeat = this.attrForm.attrValueList.some((item) => {
        if (item !== row) {
          return item.valueName === valueName;
        }
      });
      if (isRepeat) {
        this.$message.error("输入的属性值名称不能重复");
        row.valueName = "";
        return;
      }

      row.isEdit = false;
    },
    // 保存attr 发送请求
    async save() {
      // 获取请求参数
      let attr = this.attrForm;
      // 整理参数
      /* 
          1.属性值名称如果为空串，从属性值列表当中去掉
          2.属性值当中去除isEdit属性
          3.属性值列表如果没有属性值，不发请求
        */
      attr.attrValueList = attr.attrValueList.filter((item) => {
        if (item.valueName.trim() !== "") {
          delete item.isEdit;
          return true;
        }
      });
      // attr.attrValueList.forEach(item => delete item.isEdit)
      if (!attr.attrValueList.length) return;

      // 发请求
      try {
        // 成功干了啥
        const result = await this.$API.attr.addOrUpdate(attr);
       console.log(result)
     if (result.code === 200 || result.code === 20000) {
          this.$message.success("保存属性成功");
          //  返回属性列表页
          this.isShowList = true;
          // 重新获取属性列表数据
          this.getAttrList()
        } else {
          this.$message.error(`保存属性失败`);
        }
        
      } catch (error) {

        this.$message.error(`请求保存属性失败`);
      }
    },
    // 删除属性的逻辑
    async deleteAttr(row){
      try{
       const result = await this.$API.attr.remove(row.id)
       if(result.code === 200 || result.code === 20000){
           this.$message.success('删除属性成功')
           this.getAttrList()
       }else{
          this.$message.error('删除属性失败')
       }
      }catch(error){
        this.$message.error('请求删除属性失败')

      }
    }
  },
};
</script>

<style>
</style>