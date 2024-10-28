<template>
  <div class="system-user-container layout-padding">
    <el-card shadow="hover" class="layout-padding-auto">
      <div class="system-user-search mb15">
        <el-form :inline="true" :model="searchForm" label-position="right">
          <el-form-item label="项目名称">
            <el-input size="default" placeholder="请输入项目名称" clearable v-model="searchForm.project_name"></el-input>
          </el-form-item>
          <el-form-item label="文件名称">
            <el-input size="default" placeholder="请输入文件名称" clearable v-model="searchForm.file_name"></el-input>
          </el-form-item>
          <el-form-item label="文件大小">
            <el-input size="default" placeholder="0M" clearable style="width: 90px" v-model="searchForm.min_size"></el-input>
            <span style="padding: 0 10px">-</span>
            <el-input size="default" placeholder="50M" clearable style="width: 90px" v-model="searchForm.max_size"></el-input>
          </el-form-item>

          <el-form-item label="时间">
            <el-date-picker style="width: 180px" v-model="searchForm.date" type="daterange" range-separator="至" start-placeholder="开启时间" end-placeholder="结束时间" />
          </el-form-item>
          <el-form-item label="文件后缀名">
            <el-input size="default" placeholder="请输入文件后缀名" clearable v-model="searchForm.ext_name"></el-input>
          </el-form-item>
          <el-form-item label=" ">
            <el-button type="primary" :icon="Search" @click="onSearch()">查询</el-button>
            <el-button type="success" :icon="Plus" @click="onOpenProjectCreate()">新增项目</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
        <el-table-column prop="id" label="id" width="60" />
        <el-table-column prop="project_name" label="项目名称" show-overflow-tooltip></el-table-column>
        <el-table-column prop="file_count" label="文件数量" show-overflow-tooltip></el-table-column>
        <!-- <el-table-column prop="current_status_desc" label="上传状态" show-overflow-tooltip></el-table-column> -->
        <el-table-column prop="project_description" label="任务描述" show-overflow-tooltip></el-table-column>
        <el-table-column prop="target_server" label="目标服务器" show-overflow-tooltip></el-table-column>
        <el-table-column prop="created_at" label="上传时间" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" text type="primary" @click="onOpenProjectUpload(scope.row)">上传</el-button>
            <el-button size="small" text type="primary" @click="onOpenDetailUpload(scope.row)">查看</el-button>
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
        v-model:current-page="state.tableData.param.pageNum"
        background
        v-model:page-size="state.tableData.param.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="state.tableData.total"></el-pagination>
    </el-card>
    <ProjectUploadList ref="projectUploadListDialogRef" @refresh="getTableData()" />
    <ProjectCreate ref="projectCreateDialogRef" @refresh="getTableData()" />
    <ProjectUpload ref="projectUploadDialogRef" @refresh="getTableData()" />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { useProjectApi } from '~/api/index';
import { Search, Plus } from '@element-plus/icons-vue';
// import { ElMessageBox, ElMessage } from 'element-plus';

const projectUploadListDialogRef = ref();
const projectCreateDialogRef = ref();
const projectUploadDialogRef = ref();

// 搜索框
const searchForm = reactive({
  project_name: '',
  file_name: '',
  date: [],
  min_size: '',
  max_size: '',
  ext_name: '',
});

const state = reactive<ProjectState>({
  tableData: {
    data: [],
    total: 0,
    loading: false,
    param: {
      page: 1,
      page_size: 10,
    },
  },
});

// 引入 api 请求接口
const projectApi = useProjectApi();

// 初始化表格数据
const getTableData = async () => {
  state.tableData.loading = true;

  const res = await projectApi.projectList({ ...searchForm, ...state.tableData.param });

  state.tableData.data = res.data.list;
  state.tableData.total = res.data.page_info.total;
  setTimeout(() => {
    state.tableData.loading = false;
  }, 500);
};

// 分页改变
const onHandleSizeChange = (val: number) => {
  state.tableData.param.pageSize = val;
  getTableData();
};
// 分页改变
const onHandleCurrentChange = (val: number) => {
  state.tableData.param.pageNum = val;
  getTableData();
};

// 搜索功能
const onSearch = () => {
  getTableData();
};

// 打开查看上传的文件列表弹窗
const onOpenDetailUpload = (row: ProjectType) => {
  projectUploadListDialogRef.value.openDialog(row);
};

// 打开创建项目的弹窗
const onOpenProjectCreate = () => {
  projectCreateDialogRef.value.openDialog();
};

// 打开上传文件的弹窗
const onOpenProjectUpload = (row: ProjectType) => {
  projectUploadDialogRef.value.openDialog(row);
};

// 删除记录
const onRowDel = (row: ProjectType) => {
  ElMessageBox.confirm(`此操作将永久删除文件：“${row.project_name}”，是否继续?`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      projectApi
        .projectUploadDelete({ project_id: row.id })
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

// 页面加载时
onMounted(() => {
  getTableData();
});
</script>

<style scoped lang="scss">
:deep(.ep-form-item__label) {
  width: 100px;
}
:deep(.ep-form-item__content) {
  width: 220px;
}
:deep(.ep-button) {
  width: 0;
}
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
