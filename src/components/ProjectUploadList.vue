<template>
  <div class="system-user-container layout-padding">
    <el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="1080px">
      <div class="system-user-search">
        <el-form :inline="true" size="default" label-width="90px">
          <el-form-item label="文件名称">
            <el-input size="default" placeholder="请输入文件名称" clearable v-model="state.tableData.param.filename"></el-input>
          </el-form-item>
          <el-form-item label="文件后缀">
            <el-input size="default" placeholder="请输入文件后缀" clearable v-model="state.tableData.param.file_suffix"></el-input>
          </el-form-item>
          <el-form-item label="文件大小">
            <el-input size="default" placeholder="e.g. 10k 2m 0.3gb" clearable v-model="state.tableData.param.file_size_range.min" style="width: 100px"></el-input>
            <span style="padding: 0 5px">-</span>
            <el-input size="default" style="width: 100px" placeholder="e.g. 10k 2m 0.3gb" clearable v-model="state.tableData.param.file_size_range.max"></el-input>
          </el-form-item>
          <el-form-item label="上传时间">
            <el-date-picker v-model="datetimerange" type="datetimerange" start-placeholder="开始时间" end-placeholder="结束时间" format="YYYY-MM-DD HH:mm:ss" />
          </el-form-item>
          <el-form-item label=" ">
            <el-button :icon="Search" type="primary" class="ml10" @click="onSearch()">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
        <el-table-column prop="file_id" label="序号" show-overflow-tooltip></el-table-column>
        <el-table-column prop="filename" label="文件名称" show-overflow-tooltip></el-table-column>
        <el-table-column prop="upload_status_desc" label="上传状态" show-overflow-tooltip></el-table-column>
        <el-table-column prop="file_size_desc" label="文件大小" show-overflow-tooltip></el-table-column>
        <el-table-column prop="created_at" label="上传时间" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button size="small" text type="primary" @click="onRowDel(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="onHandleSizeChange"
        @current-change="onHandleCurrentChange"
        class="mt15"
        :pager-count="5"
        :page-sizes="[10, 20, 30]"
        v-model:current-page="state.tableData.param.page"
        background
        v-model:page-size="state.tableData.param.page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="state.tableData.total"></el-pagination>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useProjectApi } from '~/api/index';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';

const datetimerange = ref('');
const state = reactive<FileUploadListState>({
  tableData: {
    data: [],
    total: 0,
    loading: false,
    param: {
      page: 1,
      page_size: 10,
      filename: '',
      file_suffix: '',
      file_size_range: {
        min: '',
        max: '',
      },
      upload_time_range: {
        start_time: 0,
        end_time: 0,
      },
    },
  },
  dialog: {
    isShowDialog: false,
    type: '',
    title: '',
    submitTxt: '',
  },
});

watch(datetimerange, (newVal) => {
  if (!newVal) {
    state.tableData.param.upload_time_range.start_time = 0;
    state.tableData.param.upload_time_range.end_time = 0;
    return;
  }

  const startTime = new Date(newVal[0]);
  const endTime = new Date(newVal[1]);

  state.tableData.param.upload_time_range.start_time = Math.floor(startTime.getTime() / 1000);
  state.tableData.param.upload_time_range.end_time = Math.floor(endTime.getTime() / 1000);
});

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 引入 api 请求接口
const projectApi = useProjectApi();

// 初始化表格数据
const getTableData = async () => {
  state.tableData.loading = true;

  const res = await projectApi.projectUploadList(state.tableData.param);

  state.tableData.data = res.data.list;
  state.tableData.total = res.data.page_info.total;
  setTimeout(() => {
    state.tableData.loading = false;
  }, 500);
};

// 分页改变
const onHandleSizeChange = (val: number) => {
  state.tableData.param.page_size = val;
  getTableData();
};
// 分页改变
const onHandleCurrentChange = (val: number) => {
  state.tableData.param.page = val;
  getTableData();
};

// 删除记录
const onRowDel = (row: ProjectUploadType) => {
  ElMessageBox.confirm(`此操作将永久删除文件：“${row.filename}”，是否继续?`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      projectApi
        .projectUploadDelete({ file_id: row.file_id })
        .then(() => {
          getTableData();
          ElMessage.success('删除成功');
        })
        .catch(() => {
          ElMessage.error('删除失败');
        });
    })
    .catch(() => {});
};

// 打开弹窗
const openDialog = (row: ProjectType) => {
  state.tableData.param.project_id = row.id;
  state.dialog.isShowDialog = true;
  getTableData();
};
// 关闭弹窗
const closeDialog = () => {
  state.dialog.isShowDialog = false;
};

// 搜索功能
const onSearch = () => {
  getTableData();
};

// 取消
const onCancel = () => {
  closeDialog();
};

// 页面加载时
// onMounted(() => {
// 	getTableData();
// });

// 暴露变量
defineExpose({
  openDialog,
});
</script>

<style scoped lang="scss">
.system-user-container {
  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: auto;
    .el-table {
      flex: 1;
    }
  }
}
</style>
