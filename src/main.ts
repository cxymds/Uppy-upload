import { createApp } from 'vue';
import App from './App.vue';

import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

// import "~/styles/element/index.scss";

import '~/styles/index.scss';
import 'uno.css';

// If you want to use ElMessage, import it.
import 'element-plus/theme-chalk/src/message.scss';
import 'element-plus/theme-chalk/src/message-box.scss';

const app = createApp(App);
app.use(ElementPlus, {
  locale: zhCn,
});
app.mount('#app');
