<template>
  <div>
    <el-button type="primary" v-if="$hasBp('bt-add')" >添加</el-button>
    <el-button type="warning" v-if="$hasBp('bt-update')">修改</el-button>
    <el-button type="danger" v-if="$hasBp('bt-delete')">删除</el-button>
  </div>
</template>
<script>
export default {
  name: 'Test111',
  data() {
    return {
      
    };
  },
}
</script>

<style scoped>

</style>
