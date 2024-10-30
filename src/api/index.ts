import request from '~/utils/request';

export function useProjectApi() {
  return {
    projectList: (data?: object) => {
      return request({
        url: '/project/list',
        method: 'post',
        data,
      });
    },
    projectCreate: (data?: object) => {
      return request({
        url: '/project/create',
        method: 'post',
        data,
      });
    },
    projectDelete: (data?: object) => {
      return request({
        url: '/project/delete',
        method: 'post',
        data,
      });
    },
    projectUploadList: (data?: object) => {
      return request({
        url: '/project/upload/list',
        method: 'post',
        data,
      });
    },
    projectUploadDelete: (data?: object) => {
      return request({
        url: '/project/upload/delete',
        method: 'post',
        data,
      });
    },
    listProjectServers: (data?: object) => {
      return request({
        url: '/project/target-servers',
        method: 'post',
        data,
      });
    },
  };
}
