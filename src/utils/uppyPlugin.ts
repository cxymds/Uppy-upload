import { UIPlugin, Uppy, type UIPluginOptions } from '@uppy/core';
import type { Body, Meta } from '@uppy/utils/lib/UppyFile';
import '../styles/uppyplugin.css';
// import '@uppy/core/dist/style.min.css'; // 引入Uppy的样式
// import type { DefinePluginOpts } from '@uppy/core/lib/BasePlugin.js';

// 定义下拉框插件选项接口
interface DropdownPluginOptions extends UIPluginOptions {
  options: string[];
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void; // 新增 onChange 回调
}

// 创建下拉框插件类
export default class DropdownPlugin<M extends Meta, B extends Body> extends UIPlugin<DropdownPluginOptions, M, B> {
  opts: DropdownPluginOptions;
  dropdownElement: HTMLDivElement;
  constructor(uppy: Uppy<M, B>, opts: DropdownPluginOptions) {
    super(uppy, opts);
    this.opts = this.defaultOptions(opts);
    this.id = this.opts.id || 'dropdownPlugin';
    this.type = 'dropdownPlugin';

    this.install = this.install.bind(this);
    this.uninstall = this.uninstall.bind(this);
    this.dropdownElement = document.createElement('div');
  }

  // 设置默认选项
  defaultOptions(opts: DropdownPluginOptions): DropdownPluginOptions {
    return {
      target: undefined,
      defaultValue: '',
      onChange: () => {}, // 默认的 onChange 回调
      ...opts,
    };
  }

  // 插件安装方法
  install() {
    const { target, options, defaultValue, placeholder, onChange } = this.opts;

    // 创建下拉框元素
    this.dropdownElement = document.createElement('div');
    this.dropdownElement.className = 'select-secret';
    this.dropdownElement.innerHTML = '密级';

    let ele = document.createElement('select');
    ele.className = 'uppy-select';
    options.forEach((option) => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = option;
      ele.appendChild(optionElement);
    });

    // 设置默认值
    if (defaultValue && options.includes(defaultValue)) {
      ele.value = defaultValue;
    }

    // 绑定 change 事件
    ele.addEventListener('change', () => {
      const selectedValue = ele.value;
      onChange(selectedValue);
    });

    // 将下拉框添加到目标元素
    if (target) {
      const targetElement = document.querySelector(target);
      if (targetElement) {
        this.dropdownElement.appendChild(ele);
        targetElement.insertBefore(this.dropdownElement, targetElement.firstChild);
      }
    }
  }

  // 插件卸载方法
  uninstall() {
    if (this.dropdownElement && this.dropdownElement.parentNode) {
      this.dropdownElement.parentNode.removeChild(this.dropdownElement);
    }
  }
}

// // 注册插件
// Uppy.use(DropdownPlugin, {
//   id: 'Dropdown',
//   target: '#dropdown-container',
//   options: ['Option 1', 'Option 2', 'Option 3'],
//   defaultValue: 'Option 1',
//   onChange: (value) => {
//     console.log('Selected value:', value);
//   },
// });

// // 初始化Uppy实例
// const uppy = new Uppy();
// uppy.use(DropdownPlugin, {
//   id: 'Dropdown',
//   target: '#dropdown-container',
//   options: ['Option 1', 'Option 2', 'Option 3'],
//   defaultValue: 'Option 1',
//   onChange: (value) => {
//     console.log('Selected value:', value);
//   },
// });
