<template>
  <el-config-provider namespace="ep">
    <!-- <BaseHeader /> -->
    <div class="flex main-container">
      <!-- <BaseSide /> -->
      <div w="full">
        <router-view></router-view>
      </div>
    </div>
  </el-config-provider>
</template>

<style>
#app {
  color: var(--ep-text-color-primary);
}

.main-container {
  height: calc(100vh - var(--ep-menu-item-height) - 3px);
}
</style>
