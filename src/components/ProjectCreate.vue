<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="769px">
			<el-form ref="projectDialogFormRef" :model="state.formData" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="项目名称">
							<el-input v-model="state.formData.project_name" placeholder="请输入项目名称" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="项目描述">
							<el-input v-model="state.formData.project_description" type="textarea" placeholder="请输入项目描述" maxlength="150"></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="目标服务器">
							<el-select v-model="state.formData.target_server" placeholder="请选择" clearable class="w100">
								<el-option label="Minio" value="http://8000.proxy.vstarsky.com/remote"></el-option>
								<el-option label="Local" value="http://8000.proxy.vstarsky.com/local"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel" size="default">取 消</el-button>
					<el-button type="primary" @click="onSubmit" size="default">{{ state.dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useProjectApi } from '~/api/index';
import { ElMessageBox, ElMessage } from 'element-plus';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const projectDialogFormRef = ref();
const state = reactive({
    formData: {
		project_name: '',
		project_description: '',
		target_server: '',
	},
	target_servers: [],
    dialog: {
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '提交',
	},
});

// 引入 api 请求接口
const projectApi = useProjectApi();

// 打开弹窗
const openDialog = () => {
	state.dialog.isShowDialog = true;
};
// 关闭弹窗
const closeDialog = () => {
	state.dialog.isShowDialog = false;
};
// 取消
const onCancel = () => {
	closeDialog();
};
// 提交
const onSubmit = () => {
	projectApi.projectCreate(state.formData).then((res) => {
		ElMessage.success('操作成功');
		closeDialog();
		emit('refresh');
	});
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>
