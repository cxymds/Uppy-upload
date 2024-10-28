<template>
	<div class="layout-padding">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="960px">
        <DragDrop
            :uppy="uppy"
        />

        <h2>上传进度</h2>
        <StatusBar
        :uppy="uppy"
        />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue';
import { DragDrop, ProgressBar, StatusBar } from '@uppy/vue'
import { ElMessageBox, ElMessage } from 'element-plus';
import Uppy, { debugLogger } from '@uppy/core';
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

const uppy = new Uppy({ logger: debugLogger });

// 打开弹窗
const openDialog = (row: ProjectType) => {
    try {
        // 创建URL对象
        let urlObj = new URL(row.target_server);
        
        // 使用URLSearchParams对象添加查询参数
        urlObj.searchParams.append('project_id', String(row.id));

        const tusPlugin = uppy.getPlugin('tusPlugin');
        if (tusPlugin !== undefined) {
            uppy.removePlugin(tusPlugin)
        }

        uppy.use(Tus, {
            endpoint: urlObj.toString(),
            limit: 6,
            id: "tusPlugin"
        });
        
        state.dialog.isShowDialog = true;
    } catch (e) {
        console.log(e)
        ElMessage.error("解析目标服务器地址失败");
    }
};
// 关闭弹窗
const closeDialog = () => {
	state.dialog.isShowDialog = false;
};

uppy.on('complete', (result) => {
    ElMessage.success('上传成功');
});

uppy.on('error', (error) => {
    ElMessage.error('上传失败:' + error)
})


// 暴露变量
defineExpose({
	openDialog,
});
</script>

<style src="@uppy/core/dist/style.css"></style>
<style src="@uppy/drag-drop/dist/style.css"></style>
<style src="@uppy/status-bar/dist/style.css"></style>
