import { ComputedRef, CSSProperties, ToRefs } from 'vue'
import { Dimensions, Elements, FlowElements, FlowInstance, FlowOptions, Rect, SnapGrid, Transform, XYPosition } from './flow'
import { EdgeComponent, NodeComponent, DefaultNodeTypes, DefaultEdgeTypes } from './components'
import { Connection, ConnectionLineType, ConnectionMode } from './connection'
import { DefaultEdgeOptions, Edge, GraphEdge } from './edge'
import { GraphNode, CoordinateExtent, Node } from './node'
import { D3Selection, D3Zoom, D3ZoomHandler, KeyCode, PanOnScrollMode } from './zoom'
import { FlowHooks, FlowHooksOn } from './hooks'
import { NodeChange, EdgeChange } from './changes'
import { StartHandle, HandleType } from './handle'

export interface State<N = any, E = N> extends Omit<FlowOptions<N, E>, 'id' | 'modelValue'> {
  /** Event hooks, you can manipulate the triggers on your own peril */
  hooks: FlowHooks<N, E>
  instance: FlowInstance<N, E> | null

  /** all stored nodes */
  nodes: GraphNode<N>[]
  /** all stored edges */
  edges: GraphEdge<E>[]

  d3Zoom: D3Zoom | null
  d3Selection: D3Selection | null
  d3ZoomHandler: D3ZoomHandler | null
  minZoom: number
  maxZoom: number
  defaultZoom: number
  translateExtent: CoordinateExtent
  nodeExtent: CoordinateExtent
  /** zoom pane dimensions */
  dimensions: Dimensions
  /** transform x, y, z */
  transform: Transform
  onlyRenderVisibleElements: boolean
  defaultPosition: [number, number]

  selectedNodesBbox: Rect
  nodesSelectionActive: boolean
  userSelectionActive: boolean
  multiSelectionActive: boolean
  deleteKeyCode: KeyCode
  selectionKeyCode: KeyCode
  multiSelectionKeyCode: KeyCode
  zoomActivationKeyCode: KeyCode

  connectionNodeId: string | null
  connectionHandleId: string | null
  connectionHandleType: HandleType | null
  connectionPosition: XYPosition
  connectionMode: ConnectionMode
  connectionLineType: ConnectionLineType
  connectionLineStyle: CSSProperties | null
  connectionStartHandle: StartHandle | null
  connectOnClick: boolean
  edgeUpdaterRadius: number

  snapToGrid: boolean
  snapGrid: SnapGrid
  defaultMarkerColor: string

  edgesUpdatable: boolean
  nodesDraggable: boolean
  nodesConnectable: boolean
  elementsSelectable: boolean
  selectNodesOnDrag: boolean
  panOnDrag: boolean
  zoomOnScroll: boolean
  zoomOnPinch: boolean
  panOnScroll: boolean
  panOnScrollSpeed: number
  panOnScrollMode: PanOnScrollMode
  zoomOnDoubleClick: boolean
  preventScrolling: boolean

  paneReady: boolean
  initialized: boolean
  applyDefault: boolean

  fitViewOnInit?: boolean
  noDragClassName?: string
  noWheelClassName?: string
  noPanClassName?: string
  defaultEdgeOptions?: DefaultEdgeOptions

  vueFlowVersion: string
}

export interface Actions<N = any, E = N> {
  /** @deprecated use setNodes / setEdges instead */
  setElements: (elements: Elements<N, E>, extent?: CoordinateExtent) => void
  /** parses nodes and re-sets the state */
  setNodes: (nodes: Node<N>[], extent?: CoordinateExtent) => void
  /** parses edges and re-sets the state */
  setEdges: (edges: Edge<E>[]) => void
  /** parses nodes and adds to state */
  addNodes: <NA = N>(nodes: Node<NA>[], extent?: CoordinateExtent) => void
  /** parses edges and adds to state */
  addEdges: <EA = E>(edgesOrConnections: (Edge<EA> | Connection)[]) => void
  /** updates an edge */
  updateEdge: <EU = E>(oldEdge: GraphEdge<EU>, newConnection: Connection) => boolean
  applyEdgeChanges: <ED = E>(changes: EdgeChange[]) => GraphEdge<ED>[]
  applyNodeChanges: <ND = N>(changes: NodeChange[]) => GraphNode<ND>[]
  addSelectedElements: (elements: FlowElements<N, E>) => void
  addSelectedEdges: (edges: GraphEdge<E>[]) => void
  addSelectedNodes: (nodes: GraphNode<N>[]) => void
  setMinZoom: (zoom: number) => void
  setMaxZoom: (zoom: number) => void
  setTranslateExtent: (translateExtent: CoordinateExtent) => void
  resetSelectedElements: () => void
  setInteractive: (isInteractive: boolean) => void
  setState: (state: Partial<FlowOptions<N, E> & Omit<State, 'nodes' | 'edges' | 'modelValue'>>) => void
  updateNodePosition: ({ id, diff, dragging }: { id?: string; diff?: XYPosition; dragging?: boolean }) => void
  updateNodeDimensions: (
    updates: {
      id: string
      nodeElement: HTMLDivElement
      forceUpdate?: boolean
    }[],
  ) => void
  $reset: () => void
}

export interface Getters<N = any, E = N> {
  getEdgeTypes: Record<keyof DefaultEdgeTypes | string, EdgeComponent>
  getNodeTypes: Record<keyof DefaultNodeTypes | string, NodeComponent>
  /** filters hidden nodes */
  getNodes: GraphNode<N>[]
  /** filters hidden edges */
  getEdges: GraphEdge<E>[]
  getNode: (id: string) => GraphNode<N> | undefined
  getEdge: (id: string) => GraphEdge<E> | undefined
  getSelectedElements: FlowElements<N, E>
  getSelectedNodes: GraphNode<N>[]
  getSelectedEdges: GraphEdge<E>[]
}

export type ComputedGetters<N = any, E = N> = { [key in keyof Getters<N, E>]: ComputedRef<Getters<N, E>[key]> }

interface StoreBase<N = any, E = N> {
  state: State<N, E>
}

export type Store<N = any, E = N> = StoreBase<N, E> & State<N, E> & Actions<N, E> & Getters<N, E>

export type UseVueFlow<N = any, E = N> = {
  id: string
  store: Store<N, E>
} & FlowHooksOn<N, E> &
  ToRefs<State<N, E>> &
  ComputedGetters<N, E> &
  Actions<N, E>