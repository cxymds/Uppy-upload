<template>
  <div class="layout-padding">
    <el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="960px" :before-close="closeDialog">
      <div id="dashboard"></div>

      <!-- <DragDrop :uppy="uppy" />

      <h2>上传进度</h2>
      <StatusBar :uppy="uppy" /> -->
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, defineProps, onBeforeUnmount, watch, ref, nextTick } from 'vue';
import { DragDrop, ProgressBar, StatusBar } from '@uppy/vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import Uppy, { debugLogger } from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import ZhCn from '@uppy/locales/lib/zh_CN';
// 浏览器缓存 断点续传
import GoldenRetriever from '@uppy/golden-retriever';
import Tus from '@uppy/tus';
import { useRoute } from 'vue-router';

import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import '@uppy/drag-drop/dist/style.css';
import '@uppy/progress-bar/dist/style.css';
import '@uppy/status-bar/dist/style.css';

const route = useRoute();

const state = reactive({
  dialog: {
    isShowDialog: false,
    title: '文件上传',
  },
});
let uppy = null;

onMounted(() => {
  uppy = new Uppy({
    autoProceed: true,
    debug: true,
    locale: ZhCn,
  });

  uppy
    .use(Dashboard, {
      target: '#dashboard',
      inline: true,
      fileManagerSelectionType: 'both',
    })
    .use(GoldenRetriever, { serviceWorker: true });
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

  uppy.on('error', (error) => {
    ElMessage.error('上传失败:' + error);
  });
});
const initializeUppy = () => {
  try {
    // 创建URL对象
    let urlObj = new URL(route.query.server);

    // 使用URLSearchParams对象添加查询参数
    urlObj.searchParams.append('project_id', String(route.query.project_id));

    const tusPlugin = uppy.getPlugin('tusPlugin' + String(route.query.project_id));
    if (tusPlugin !== undefined) {
      //   uppy.removePlugin(tusPlugin);
      console.log(tusPlugin);
      uppy.use(Tus, tusPlugin.options);
    } else {
      uppy.use(Tus, {
        endpoint: urlObj.toString(),
        limit: 6,
        id: 'tusPlugin' + String(route.query.project_id),
      });
    }
  } catch (e) {
    console.log(e);
    ElMessage.error('解析目标服务器地址失败');
  }
};

const destroyUppy = () => {
  uppy && uppy.close();
};

watch(
  () => state.dialog.isShowDialog,
  (newVal) => {
    nextTick(() => {
      if (newVal) {
        initializeUppy();
      } else {
        destroyUppy();
      }
    });
  }
);

onMounted(() => {
  if (state.dialog.isShowDialog) {
    initializeUppy();
  }
});

onBeforeUnmount(() => {
  destroyUppy();
});
// 打开弹窗
const openDialog = (row: ProjectType) => {
  state.dialog.isShowDialog = true;
};
// 关闭弹窗
const closeDialog = () => {
  state.dialog.isShowDialog = false;
  destroyUppy();
};

// 暴露变量
defineExpose({
  openDialog,
});
</script>
