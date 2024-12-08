<template>
  <div class="system-user-container layout-padding">
    <el-card shadow="hover" class="layout-padding-auto">
      <el-breadcrumb class="mb-4">
        <el-breadcrumb-item :to="{ path: '/' }">项目</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="system-user-search">
        <el-form :inline="true" class="flex" :model="searchForm" label-position="right">
          <el-form-item label="项目名称">
            <el-input size="default" @keydown.enter.prevent="onSearch" placeholder="请输入项目名称" clearable v-model="searchForm.project_name"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :icon="Search" @click="onSearch()">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="flex justify-end">
        <el-button type="primary" :icon="Plus" @click="onOpenProjectCreate()">新增项目</el-button>
      </div>
      <el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="project_name" label="项目名称" show-overflow-tooltip></el-table-column>
        <el-table-column prop="file_count" label="文件数量" show-overflow-tooltip></el-table-column>
        <!-- <el-table-column prop="current_status_desc" label="上传状态" show-overflow-tooltip></el-table-column> -->
        <el-table-column prop="project_description" label="任务描述" show-overflow-tooltip></el-table-column>
        <el-table-column prop="target_server" label="目标服务器" show-overflow-tooltip></el-table-column>
        <el-table-column prop="project_path" label="路径" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.target_type === 'local' ? scope.row.project_path : '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="上传时间" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
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
        v-model:current-page="state.tableData.param.page"
        background
        v-model:page-size="state.tableData.param.page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="state.tableData.total"></el-pagination>
    </el-card>
    <EditItem ref="projectCreateDialogRef" @refresh="getTableData()"></EditItem>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { useProjectApi } from '~/api/index';
import { Search, Plus } from '@element-plus/icons-vue';
import EditItem from './components/EditItem.vue';
import { useRouter } from 'vue-router';

const projectCreateDialogRef = ref();
const router = useRouter();

// 搜索框
const searchForm = reactive({
  project_name: '',
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

const enterSearch = (e: Event) => {
  console.log(1111);
  e.preventDefault();
  e.stopPropagation();
  onSearch();
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

// 搜索功能
const onSearch = () => {
  getTableData();
};

// 打开查看上传的文件列表弹窗
const onOpenDetailUpload = (row: ProjectType) => {
  router.push({ name: 'project', query: { project_id: row.id, server: row.target_server, project_name: row.project_name } });
};

// 打开创建项目的弹窗
const onOpenProjectCreate = () => {
  projectCreateDialogRef.value.openDialog();
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
        .projectDelete({ project_id: row.id })
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
.system-user-search {
  border: 1px solid #ccc;
  padding-top: 20px;
  margin-bottom: 30px;
}
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
