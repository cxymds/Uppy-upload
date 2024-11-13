<template>
  <div class="system-user-container layout-padding">
    <el-card shadow="hover" class="layout-padding-auto">
      <el-breadcrumb class="mb-4" :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/' }">项目</el-breadcrumb-item>
        <el-breadcrumb-item>{{ project_name }}</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="system-user-search border-solid border-#ccc my-4">
        <el-form :inline="true" size="default" label-width="90px">
          <el-row class="mt-4">
            <el-col :span="20">
              <el-row>
                <el-form-item label="文件名称">
                  <el-input size="default" placeholder="请输入文件名称" clearable v-model="state.tableData.param.filename"></el-input>
                </el-form-item>
                <el-form-item label="文件大小" style="width: 590px">
                  <el-input size="default" style="width: 200px" placeholder="e.g. 10k 2m 0.3gb" clearable v-model="state.tableData.param.file_size_range.min"></el-input>
                  <span style="padding: 0 5px">-</span>
                  <el-input size="default" style="width: 200px" placeholder="e.g. 10k 2m 0.3gb" clearable v-model="state.tableData.param.file_size_range.max"></el-input>
                </el-form-item>
              </el-row>
              <el-row>
                <el-form-item label="文件后缀">
                  <el-input size="default" placeholder="请输入文件后缀" clearable v-model="state.tableData.param.file_suffix"></el-input>
                </el-form-item>
                <el-form-item label="上传时间">
                  <el-date-picker style="width: 400px" v-model="datetimerange" type="datetimerange" start-placeholder="开始时间" end-placeholder="结束时间" format="YYYY-MM-DD hh:mm:ss" />
                </el-form-item>
              </el-row>
            </el-col>
            <el-col :span="4" style="display: flex; align-items: center; justify-content: flex-end">
              <el-button :icon="Search" type="primary" class="ml10 me-4" @click="onSearch()">查询</el-button>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div class="flex justify-end mb-4 pe-4">
        <!-- <el-button type="primary" :icon="Upload" class="fileUpload" id="fileUpload">上传</el-button> -->
        <el-dropdown>
          <el-button type="primary" :icon="Upload">上传</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item class="fileUpload">上传文件</el-dropdown-item>
              <el-dropdown-item class="folderUpload">上传文件夹</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
        <el-table-column type="index" label="序号" width="90px" show-overflow-tooltip></el-table-column>
        <el-table-column prop="filename" label="文件名称" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.filename }}
            <!-- <img width="20" v-if="scope.row.is_secret === 'on'" src="../../assets/secret.jpg" alt="" /> -->
          </template>
        </el-table-column>
        <el-table-column prop="is_secret" label="密级" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.is_secret === 'on' ? '内部' : '公开' }}
          </template>
        </el-table-column>
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
    </el-card>
    <div id="flofer-box"></div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted, nextTick } from 'vue';
import { useProjectApi } from '~/api/index';
import { Search, Upload, ArrowRight } from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router';
// import UploadCom from './components/upload.vue';

import Uppy, { debugLogger } from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import ZhCn from '@uppy/locales/lib/zh_CN';
// 浏览器缓存 断点续传
import GoldenRetriever from '@uppy/golden-retriever';
import Tus from '@uppy/tus';
import uppyPlugins from '~/utils/uppyPlugin';

import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import '@uppy/drag-drop/dist/style.css';
import '@uppy/progress-bar/dist/style.css';
import '@uppy/status-bar/dist/style.css';

const route = useRoute();
const router = useRouter();
const datetimerange = ref('');
const project_name = ref('');
const state = reactive({
  tableData: {
    data: [],
    total: 0,
    loading: false,
    param: {
      target_server: '',
      project_id: 0,
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

// 搜索功能
const onSearch = () => {
  getTableData();
};

// 文件是否加密
const isSectret = ref('off');
let files_uppy: any = null;
let folder_uppy: any = null;
// 页面加载时
onMounted(() => {
  if (!route.query.project_id || !route.query.server) {
    ElMessage.error('项目参数有误，请重新选择项目');
    router.push('/');
    return;
  }
  project_name.value = String(route.query.project_name);
  state.tableData.param.target_server = String(route.query.server);
  state.tableData.param.project_id = Number(route.query.project_id);
  getTableData();

  files_uppy = new Uppy({
    //   autoProceed: true,
    debug: true,
    locale: ZhCn,
  })
    .use(Dashboard, {
      trigger: '.fileUpload',
      //   inline: true,
      //  'files', 'folders', or 'both'
      proudlyDisplayPoweredByUppy: false,
      fileManagerSelectionType: 'files',
      // metaFields: [
      //   {
      //     id: 'isSecret',
      //     name: '是否加密',
      //     render({ value, onChange, required, form }, h) {
      //       return h('input', {
      //         type: 'checkbox',
      //         style: { 'vertical-align': 'middle' },
      //         required,
      //         form,
      //         onChange: (ev) => onChange(ev.target.checked ? 'on' : 'off'),
      //         // defaultChecked: value === 'on',
      //       });
      //     },
      //   },
      // ],
    })
    .use(uppyPlugins, {
      id: 'Dropdown',
      target: '.uppy-Dashboard-innerWrap',
      options: ['公开', '内部'],
      defaultValue: '公开',
      onChange: (value: any) => {
        if (value === '内部') {
          isSectret.value = 'on';
        } else {
          isSectret.value = 'off';
        }
      },
    })
    .use(GoldenRetriever, { serviceWorker: true });

  folder_uppy = new Uppy({
    //   autoProceed: true,
    debug: true,
  })
    .use(Dashboard, {
      target: '#flofer-box',
      trigger: '.folderUpload',
      //   inline: true,
      //  'files', 'folders', or 'both'
      proudlyDisplayPoweredByUppy: false,
      fileManagerSelectionType: 'folders',
      // metaFields: [
      //   {
      //     id: 'isSecret',
      //     name: '是否加密',
      //     render({ value, onChange, required, form }, h) {
      //       return h('input', {
      //         type: 'checkbox',
      //         style: { 'vertical-align': 'middle' },
      //         required,
      //         form,
      //         onChange: (ev) => onChange(ev.target.checked ? 'on' : 'off'),
      //         // defaultChecked: value === 'on',
      //       });
      //     },
      //   },
      // ],
      // locale: ZhCn,
    })
    .use(uppyPlugins, {
      id: 'sDropdown',
      target: '#flofer-box .uppy-Dashboard-innerWrap',
      options: ['公开', '内部'],
      defaultValue: '公开',
      onChange: (value: any) => {
        if (value === '内部') {
          isSectret.value = 'on';
        } else {
          isSectret.value = 'off';
        }
      },
    })
    .use(GoldenRetriever, { serviceWorker: true });

  files_uppy.on('dashboard:modal-closed', () => {
    console.log('Modal is close');
    getTableData();
  });
  // 添加文件
  files_uppy.on('file-added', (file) => {
    console.log('Added file', file);
    file.meta.isSecret = isSectret.value;
  });

  folder_uppy.on('dashboard:modal-closed', () => {
    console.log('Modal is close');
    getTableData();
  });
  folder_uppy.on('file-added', (file) => {
    console.log('Added file', file);
    file.meta.isSecret = isSectret.value;
  });

  try {
    // 创建URL对象
    let urlObj = new URL(route.query.server);
    // 使用URLSearchParams对象添加查询参数
    urlObj.searchParams.append('project_id', String(route.query.project_id));

    // const tusPlugin = uppy.getPlugin('tusPlugin' + String(route.query.project_id));

    files_uppy.use(Tus, {
      endpoint: urlObj.toString(),
      limit: 6,
      id: 'tusPlugin' + String(route.query.project_id),
    });
    folder_uppy.use(Tus, {
      endpoint: urlObj.toString(),
      limit: 6,
      id: 'tusPlugin' + String(route.query.project_id),
    });
  } catch (e) {
    ElMessage.error('解析目标服务器地址失败');
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      for (let reg of regs) {
        reg.unregister();
      }
      navigator.serviceWorker
        .register('/sw.js') // path to your bundled service worker with GoldenRetriever service worker
        .then((registration) => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch((error) => {
          console.log(`Registration failed with ${error}`);
        });
    });
  }
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
.icon-item {
  margin-top: 10px;
  margin-left: 30px;
}
:deep(.ep-badge__content) {
  transform: translateY(-50%) translateX(calc(100% + 10px));
  font-size: 10px;
}
::deep(.uppy-select) {
  height: 30px;
}
</style>
