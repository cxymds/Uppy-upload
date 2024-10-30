const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/home/index.vue'),
  },
  {
    path: '/project',
    name: 'project',
    component: () => import('../views/project/index.vue'),
  },
];

export default routes;
