<script lang="ts" setup>
import { NodeWrapper } from '../../components'
import type { GraphNode, HandleConnectable, NodeComponent } from '../../types'

const slots = inject(Slots)

const {
  nodesDraggable,
  nodesFocusable,
  elementsSelectable,
  nodesConnectable,
  nodes,
  getNodes,
  getNodesInitialized,
  getNodeTypes,
  updateNodeDimensions,
  emits,
} = $(useVueFlow())

const draggable = (d?: boolean) => (typeof d === 'undefined' ? nodesDraggable : d)
const selectable = (s?: boolean) => (typeof s === 'undefined' ? elementsSelectable : s)
const connectable = (c?: HandleConnectable) => (typeof c === 'undefined' ? nodesConnectable : c)
const focusable = (f?: boolean) => (typeof f === 'undefined' ? nodesFocusable : f)

let resizeObserver = $ref<ResizeObserver>()

until(() => nodes.length > 0 && getNodesInitialized.length === nodes.length)
  .toBe(true)
  .then(() => {
    nextTick(() => {
      emits.nodesInitialized(getNodesInitialized)
    })
  })

onMounted(() => {
  resizeObserver = new ResizeObserver((entries) => {
    const updates = entries.map((entry: ResizeObserverEntry) => {
      const id = entry.target.getAttribute('data-id') as string

      return {
        id,
        nodeElement: entry.target as HTMLDivElement,
      }
    })

    updateNodeDimensions(updates)
  })
})

onBeforeUnmount(() => resizeObserver?.disconnect())

const getType = (type?: string, template?: GraphNode['template']) => {
  const name = type || 'default'
  let nodeType = template ?? getNodeTypes[name]
  const instance = getCurrentInstance()

  if (typeof nodeType === 'string') {
    if (instance) {
      const components = Object.keys(instance.appContext.components)
      if (components && components.includes(name)) {
        nodeType = resolveComponent(name, false) as NodeComponent
      }
    }
  }
  if (typeof nodeType !== 'string') return nodeType

  const slot = slots?.[`node-${name}`]
  if (!slot) {
    warn(`Node type "${type}" not found and no node-slot detected. Using fallback type "default".`)
    return false
  }

  return slot
}
</script>

<script lang="ts">
export default {
  name: 'Nodes',
}
</script>

<template>
  <div class="vue-flow__nodes vue-flow__container">
    <template v-if="resizeObserver">
      <NodeWrapper
        v-for="node of getNodes"
        :id="node.id"
        :key="node.id"
        :resize-observer="resizeObserver"
        :type="getType(node.type, node.template)"
        :name="node.type || 'default'"
        :draggable="draggable(node.draggable)"
        :selectable="selectable(node.selectable)"
        :connectable="connectable(node.connectable)"
        :focusable="focusable(node.focusable)"
        :node="node"
      />
    </template>
  </div>
</template>
