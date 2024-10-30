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
import { reactive, onMounted, ref, nextTick } from 'vue';
import { DragDrop, ProgressBar, StatusBar } from '@uppy/vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import Uppy, { debugLogger } from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import ZhCn from '@uppy/locales/lib/zh_CN';
// 浏览器缓存 断点续传
import GoldenRetriever from '@uppy/golden-retriever';
import Tus from '@uppy/tus';

const state = reactive({
  project_id: 0,
  dialog: {
    isShowDialog: false,
    type: '',
    title: '',
    submitTxt: '',
  },
});
let uppy = reactive(null);

onMounted(() => {
  // 1mb大小
});
// const uppy = new Uppy({ logger: debugLogger, locale: ZhCn }).use(Dashboard, { inline: true, target: '#dashboard' }).use(GoldenRetriever, { serviceWorker: false });

// 打开弹窗
const openDialog = (row: ProjectType) => {
  state.dialog.isShowDialog = true;

  nextTick(() => {
    try {
      uppy = new Uppy({
        id: 'uppy',
        autoProceed: true,
        debug: true,
        locale: ZhCn,
      })
        .use(Dashboard, { target: '#dashboard', inline: true, fileManagerSelectionType: 'both' })
        .use(GoldenRetriever, { serviceWorker: true });

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js') // path to your bundled service worker with GoldenRetriever service worker
          .then((registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          })
          .catch((error) => {
            console.log(`Registration failed with ${error}`);
          });
      }
      uppy.on('complete', (result) => {
        ElMessage.success('上传成功');
      });

      uppy.on('error', (error) => {
        ElMessage.error('上传失败:' + error);
      });
      // 创建URL对象
      let urlObj = new URL(row.target_server);

      // 使用URLSearchParams对象添加查询参数
      urlObj.searchParams.append('project_id', String(row.id));

      const tusPlugin = uppy.getPlugin('tusPlugin');
      if (tusPlugin !== undefined) {
        uppy.removePlugin(tusPlugin);
      }

      uppy.use(Tus, {
        endpoint: urlObj.toString(),
        limit: 6,
        id: 'tusPlugin',
      });
    } catch (e) {
      console.log(e);
      ElMessage.error('解析目标服务器地址失败');
    }
  });
};
// 关闭弹窗
const closeDialog = () => {
  state.dialog.isShowDialog = false;
  uppy = null;
};

// 暴露变量
defineExpose({
  openDialog,
});
</script>
<style src="@uppy/core/dist/style.css"></style>
<style src="@uppy/dashboard/dist/style.css"></style>
<style src="@uppy/drag-drop/dist/style.css"></style>
<style src="@uppy/progress-bar/dist/style.css"></style>
<style src="@uppy/status-bar/dist/style.css"></style>
