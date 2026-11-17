'use client'

import { useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { assetUrl } from '@/lib/config'
import { ArrowRight, ArrowUp, Check, ChevronDown, Coins, Droplets, Flower2, Globe2, Leaf, LockKeyhole, Maximize2, Minimize2, Minus, Pause, Play, Plus, RotateCw, SatelliteDish, Settings2, Sparkles, Sprout, Sun, Trash2, Trees, Waves, Wind, X } from 'lucide-react'

type PieceKind = 'gate' | 'reeds' | 'turbine' | 'sensor' | 'grove'
type Piece = { id: number; kind: PieceKind; x: number; y: number; rotation: number }

const pieceCatalog: { kind: PieceKind; name: string; cost: number; points: number; icon: typeof Waves; art: string; color: string; detail: string }[] = [
  { kind: 'gate', name: 'Water gate', cost: 24, points: 18, icon: Waves, art: assetUrl('water-gate.png'), color: 'aqua', detail: 'Control the flow back into the marsh.' },
  { kind: 'reeds', name: 'Sedge patch', cost: 14, points: 14, icon: Flower2, art: assetUrl('sedge-patch.png'), color: 'lime', detail: 'Replant native wetland grasses.' },
  { kind: 'turbine', name: 'Wind turbine', cost: 20, points: 9, icon: Wind, art: assetUrl('wind-turbine.png'), color: 'blue', detail: 'Power your field equipment cleanly.' },
  { kind: 'sensor', name: 'Water sensor', cost: 18, points: 11, icon: SatelliteDish, art: assetUrl('water-sensor.png'), color: 'coral', detail: 'Track water levels and quality.' },
  { kind: 'grove', name: 'Habitat grove', cost: 22, points: 16, icon: Trees, art: assetUrl('habitat-grove.png'), color: 'green', detail: 'Give wildlife a place to return.' },
]
const startPieces: Piece[] = [
  { id: 1, kind: 'sensor', x: 40, y: 38, rotation: 0 },
  { id: 2, kind: 'turbine', x: 63, y: 54, rotation: 0 },
  { id: 3, kind: 'reeds', x: 30, y: 67, rotation: 0 },
]
type EnvironmentId = 'wetland' | 'forest' | 'grassland' | 'mountain'
type PanPoint = { x: number; y: number }
type GestureStart = { center: PanPoint; distance: number; view: { x: number; y: number; scale: number }; invertY: boolean }

const environments: Record<EnvironmentId, { name: string; region: string; dry: string; alive: string; locked?: boolean }> = {
  wetland: { name: 'Willow Fen', region: 'WETLAND', dry: assetUrl('wetland-dry.webp'), alive: assetUrl('wetland-recovering.webp') },
  forest: { name: 'Mosswood', region: 'FOREST', dry: assetUrl('forest-dry.png'), alive: assetUrl('forest-recovering.png') },
  grassland: { name: 'Sunmeadow', region: 'GRASSLAND', dry: assetUrl('grassland-dry.png'), alive: assetUrl('grassland-recovering.png') },
  mountain: { name: 'Cloudbreak Ridge', region: 'MOUNTAIN', dry: assetUrl('mountain-locked.png'), alive: assetUrl('mountain-locked.png'), locked: true },
}
const environmentOrder: EnvironmentId[] = ['wetland', 'forest', 'grassland', 'mountain']

export default function WildpatchField() {
  const [pieces, setPieces] = useState<Piece[]>(startPieces)
  const [selected, setSelected] = useState<number | null>(null)
  const [placing, setPlacing] = useState<PieceKind | null>(null)
  const [credits, setCredits] = useState(64)
  const [restoration, setRestoration] = useState(28)
  const [dragging, setDragging] = useState<number | null>(null)
  const [playing, setPlaying] = useState(true)
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 })
  const [environment, setEnvironment] = useState<EnvironmentId>('wetland')
  const [environmentMenuOpen, setEnvironmentMenuOpen] = useState(false)
  const [controlsMinimized, setControlsMinimized] = useState(false)
  const gesturePointers = useRef(new Map<number, PanPoint>())
  const gestureStart = useRef<GestureStart | null>(null)
  const lastGestureAt = useRef(0)
  const [day, setDay] = useState(4)
  const [alertVisible, setAlertVisible] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [ambientSound, setAmbientSound] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [toast, setToast] = useState('')
  const activePiece = pieces.find(piece => piece.id === selected)
  const activeMeta = activePiece ? pieceCatalog.find(item => item.kind === activePiece.kind) : null
  const aliveBlend = Math.max(0, Math.min(1, (restoration - 24) / 63))
  const activeEnvironment = environments[environment]

  const fieldWorldSize = (rect: DOMRect) => {
    const width = Math.max(rect.width, rect.height * 1.5, window.innerHeight * 2.4)
    return { width, height: width / 1.5 }
  }

  const handleFieldPointerDown = (event: PointerEvent<HTMLElement>) => {
    const target = event.target as Element
    const isControl = Boolean(target.closest('button, .environment-picker, .game-objective, .field-events, .field-zoom, .mini-map, .field-side-meter, .object-inspector, .placement-tip, .field-coordinates'))
    const isTouch = event.pointerType === 'touch'
    if (!isTouch && (event.pointerType !== 'mouse' || event.button !== 0 || isControl)) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const pointers = gesturePointers.current
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const points = Array.from(pointers.values())
    if (points.length === 2) {
      lastGestureAt.current = Date.now()
      gestureStart.current = {
        center: { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 },
        distance: Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y),
        view,
        invertY: isTouch,
      }
      setDragging(null)
    } else if (points.length === 1 && !isControl) {
      gestureStart.current = { center: points[0], distance: 0, view, invertY: isTouch }
    }
  }

  const handleFieldPointerMove = (event: PointerEvent<HTMLElement>) => {
    const pointers = gesturePointers.current
    if (!pointers.has(event.pointerId)) return
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const start = gestureStart.current
    if (!start) return
    const points = Array.from(pointers.values())
    const isPinching = points.length > 1
    const center = isPinching
      ? { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 }
      : points[0]
    const distance = isPinching ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) : 0
    const scale = isPinching
      ? Math.max(.85, Math.min(1.65, start.view.scale * distance / Math.max(1, start.distance)))
      : start.view.scale
    const rect = event.currentTarget.getBoundingClientRect()
    const world = fieldWorldSize(rect)
    const maxX = Math.max(0, (world.width * scale - rect.width) / 2) + world.width * scale * .12
    const maxY = Math.max(0, (world.height * scale - rect.height) / 2) + world.height * scale * .12
    lastGestureAt.current = Date.now()
    setView({
      x: Math.max(-maxX, Math.min(maxX, start.view.x + center.x - start.center.x)),
      y: Math.max(-maxY, Math.min(maxY, start.view.y + (center.y - start.center.y) * (start.invertY ? -1 : 1))),
      scale,
    })
  }

  const handleFieldPointerEnd = (event: PointerEvent<HTMLElement>) => {
    if (gestureStart.current) lastGestureAt.current = Date.now()
    gesturePointers.current.delete(event.pointerId)
    gestureStart.current = null
  }

  const chooseEnvironment = (next: EnvironmentId) => {
    if (environments[next].locked) return
    setEnvironment(next)
    setEnvironmentMenuOpen(false)
    setView({ x: 0, y: 0, scale: 1 })
    setSelected(null)
    setPlacing(null)
  }

  const announce = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const boardPoint = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const world = fieldWorldSize(rect)
    const left = rect.left + rect.width / 2 + view.x - world.width * view.scale / 2
    const top = rect.top + rect.height / 2 + view.y - world.height * view.scale / 2
    const x = (event.clientX - left) / view.scale
    const y = (event.clientY - top) / view.scale
    return { x: Math.max(4, Math.min(96, (x / world.width) * 100)), y: Math.max(8, Math.min(91, (y / world.height) * 100)) }
  }

  const placePiece = (event: MouseEvent<HTMLDivElement>) => {
    if (environmentMenuOpen) setEnvironmentMenuOpen(false)
    if (!placing || Date.now() - lastGestureAt.current < 400 || (event.target as HTMLElement).closest('button, .game-objective, .field-events, .environment-picker, .field-zoom, .mini-map, .field-side-meter, .object-inspector, .placement-tip, .field-coordinates')) return
    const rect = event.currentTarget.getBoundingClientRect()
    const world = fieldWorldSize(rect)
    const left = rect.left + rect.width / 2 + view.x - world.width * view.scale / 2
    const top = rect.top + rect.height / 2 + view.y - world.height * view.scale / 2
    const localX = (event.clientX - left) / view.scale
    const localY = (event.clientY - top) / view.scale
    const x = Math.max(5, Math.min(95, (localX / world.width) * 100))
    const y = Math.max(7, Math.min(92, (localY / world.height) * 100))
    const meta = pieceCatalog.find(item => item.kind === placing)
    if (!meta || credits < meta.cost) {
      announce('You need a few more field credits for that one.')
      return
    }
    const id = Date.now()
    setPieces(current => [...current, { id, kind: placing, x, y, rotation: 0 }])
    setCredits(value => value - meta.cost)
    setRestoration(value => Math.min(100, value + meta.points))
    setSelected(id)
    setPlacing(null)
    announce(`${meta.name} placed. The wetland is responding.`)
  }

  const dragPiece = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragging === null) return
    const point = boardPoint(event)
    setPieces(current => current.map(piece => piece.id === dragging ? { ...piece, x: point.x, y: point.y } : piece))
  }

  const removeSelected = () => {
    if (!activePiece || !activeMeta) return
    setPieces(current => current.filter(piece => piece.id !== activePiece.id))
    setCredits(value => value + Math.round(activeMeta.cost * .65))
    setRestoration(value => Math.max(18, value - Math.floor(activeMeta.points * .6)))
    setSelected(null)
    announce(`${activeMeta.name} returned to your toolkit.`)
  }

  const boostWater = () => {
    if (credits < 12) {
      announce('Not enough credits to redirect the water.')
      return
    }
    setCredits(value => value - 12)
    setRestoration(value => Math.min(100, value + 16))
    announce('Water is flowing back through Willow Fen.')
  }

  const selectTool = (kind: PieceKind) => {
    setPlacing(current => current === kind ? null : kind)
    setSelected(null)
  }

  return <main className={`wild-game ${controlsMinimized ? 'game-minimized' : ''}`}>
    <header className="game-hud">
      <div className="game-brand"><span className="game-brand-mark"><Sprout size={21}/></span><span><strong>WILDPATCH</strong><small>RESTORATION SIMULATOR</small></span></div>
      <div className="hud-region"><span className="live-pip"/> REGION 01 <span className="hud-slash">/</span> {activeEnvironment.name.toUpperCase()}</div>
      <div className="game-stats"><span><Coins size={15}/><b>{credits}</b><small>FIELD CREDITS</small></span><span><Leaf size={15}/><b>{restoration}%</b><small>RECOVERY</small></span><span className="weather-stat"><Sun className="weather-symbol" size={16}/><b>20°</b><small>OVERCAST</small></span></div>
      <button className="hud-icon" aria-label="Game settings" onClick={() => setSettingsOpen(true)}><Settings2 size={18}/></button>
    </header>

    <section className={`playfield ${placing ? 'field-placement' : ''}`} aria-label={`Interactive ${activeEnvironment.region.toLowerCase()} restoration field`} onClick={placePiece} onPointerDownCapture={handleFieldPointerDown} onPointerMoveCapture={handleFieldPointerMove} onPointerUpCapture={handleFieldPointerEnd} onPointerCancelCapture={handleFieldPointerEnd} onPointerMove={dragPiece} onPointerUp={() => setDragging(null)} onPointerCancel={() => setDragging(null)}>
      <div className="field-world" style={{ transform: `translate3d(calc(-50% + ${view.x}px), calc(-50% + ${view.y}px), 0) scale(${view.scale})` }}>
      <img className="field-land field-dry" src={activeEnvironment.dry} alt={`Degraded ${activeEnvironment.name} restoration region`} draggable={false}/>
      <img className="field-land field-alive" src={activeEnvironment.alive} alt={`Recovering ${activeEnvironment.name} restoration region`} draggable={false} style={{ opacity: aliveBlend }}/>
      <div className="field-vignette"/>
      <div className={`field-grid ${showGrid ? 'field-grid-visible' : ''}`} aria-hidden="true"/>
      <div className="field-buildings" aria-label="Placed restoration components">
        {pieces.map(piece => {
          const meta = pieceCatalog.find(item => item.kind === piece.kind)!
          return <button key={piece.id} className={`placed-piece piece-${piece.kind} ${selected === piece.id ? 'piece-selected' : ''}`} style={{ left: `${piece.x}%`, top: `${piece.y}%`, transform: `translate(-50%, -92%) rotate(${piece.rotation}deg)` }} aria-label={`${meta.name}, ${selected === piece.id ? 'selected' : 'select and move'}`} onPointerDown={event => { event.stopPropagation(); setSelected(piece.id); setPlacing(null); setDragging(piece.id); event.currentTarget.setPointerCapture(event.pointerId) }} onPointerUp={event => { event.stopPropagation(); setDragging(null) }} onClick={event => event.stopPropagation()}>
            <span className="piece-shadow"/><span className={`piece-art-frame art-frame-${piece.kind}`}><img className="piece-art" src={meta.art} alt="" draggable={false}/></span><span className="piece-tag">{meta.name}</span>
          </button>
        })}
      </div>
      </div>

      <button className="game-mode-toggle" aria-label={controlsMinimized ? 'Show game controls' : 'Minimize game controls'} title={controlsMinimized ? 'Show game controls' : 'Minimize game controls'} onClick={event => { event.stopPropagation(); setControlsMinimized(value => !value) }}>{controlsMinimized ? <Maximize2 size={17}/> : <Minimize2 size={17}/>}</button>
      <div className="game-objective"><span className="objective-badge"><Sparkles size={14}/></span><span><small>RESTORE THE {activeEnvironment.region}</small><strong>{restoration >= 75 ? `The ${activeEnvironment.region.toLowerCase()} is thriving!` : environment === 'wetland' ? 'Bring the water back' : 'Bring this habitat back'}</strong></span><span className="objective-progress">{restoration}/100</span></div>
      <div className="field-coordinates"><span>{activeEnvironment.name.toUpperCase()} <i>•</i> {activeEnvironment.region} 04</span><span>MAP 01:04 <i>·</i> ELEV. 18M</span></div>
      {alertVisible && <div className="field-events"><span className="event-beacon"><span/></span><span><small>FIELD ALERT</small><strong>{restoration >= 55 ? 'Wildlife is returning' : environment === 'wetland' ? 'Drainage is drying the north bank' : environment === 'forest' ? 'Canopy cover is thinning' : environment === 'grassland' ? 'Native grasses are fading' : 'High alpine habitat is at risk'}</strong></span><button aria-label="Dismiss field alert" onClick={event => { event.stopPropagation(); setAlertVisible(false) }}><X size={14}/></button></div>}
      <div className="environment-picker">
        <button className="environment-trigger" aria-expanded={environmentMenuOpen} aria-label={`Choose environment. Current region: ${activeEnvironment.name}`} onClick={event => { event.stopPropagation(); setEnvironmentMenuOpen(value => !value) }}><Globe2 size={14}/><span>{activeEnvironment.name}</span><ChevronDown size={13}/></button>
        {environmentMenuOpen && <div className="environment-menu" role="group" aria-label="Choose a restoration environment">{environmentOrder.map(id => {
          const place = environments[id]
          return <button key={id} className={`environment-option ${environment === id ? 'environment-option-active' : ''} ${place.locked ? 'environment-option-locked' : ''}`} disabled={place.locked} onClick={event => { event.stopPropagation(); chooseEnvironment(id) }}><img src={place.dry} alt=""/><span><strong>{place.name}</strong><small>{place.locked ? 'UNLOCKS AT LEVEL 8' : place.region}</small></span>{place.locked ? <LockKeyhole size={15}/> : environment === id ? <Check size={15}/> : null}</button>
        })}</div>}
      </div>

      {placing && <div className="placement-tip" aria-live="polite"><span className="placement-crosshair"><Plus size={14}/></span><span><strong>PLACE {pieceCatalog.find(item => item.kind === placing)?.name.toUpperCase()}</strong><small>Tap an open spot in the field</small></span><button onClick={event => { event.stopPropagation(); setPlacing(null) }} aria-label="Cancel placement"><X size={16}/></button></div>}
      {activePiece && activeMeta && <aside className="object-inspector" onClick={event => event.stopPropagation()}><div className="inspector-head"><span className={`inspector-icon ${activeMeta.color}`}>{(() => { const Icon = activeMeta.icon; return <Icon size={18}/> })()}</span><span><small>FIELD COMPONENT</small><strong>{activeMeta.name}</strong></span><button onClick={() => setSelected(null)} aria-label="Close component details"><X size={15}/></button></div><p>{activeMeta.detail}</p><div className="inspector-stats"><span>CONDITION <b>GOOD</b></span><span>RESTORE <b>+{activeMeta.points}%</b></span></div><div className="inspector-actions"><button onClick={() => setPieces(current => current.map(piece => piece.id === activePiece.id ? { ...piece, rotation: piece.rotation + 90 } : piece))}><RotateCw size={14}/> Rotate</button><button onClick={removeSelected}><Trash2 size={14}/> Reclaim</button></div></aside>}

      <div className="field-zoom"><button aria-label="Zoom in" onClick={event => { event.stopPropagation(); setView(value => ({ ...value, scale: Math.min(1.65, +(value.scale + .12).toFixed(2)) })) }}><Plus size={16}/></button><button aria-label="Zoom out" onClick={event => { event.stopPropagation(); setView(value => ({ ...value, scale: Math.max(.85, +(value.scale - .12).toFixed(2)) })) }}><Minus size={16}/></button><button aria-label="Center field" onClick={event => { event.stopPropagation(); setView({ x: 0, y: 0, scale: 1 }); setSelected(null) }}><Maximize2 size={15}/></button></div>
      <div className="mini-map"><div className="mini-water"/><i className="mini-marker"/><span>N</span><ArrowUp size={11}/></div>
      <div className="field-side-meter"><div className="meter-head"><span>ECOSYSTEM</span><b>{restoration}%</b></div><div className="ecosystem-meter"><i style={{ height: `${restoration}%` }}/></div><span className="meter-low">DRY</span><span className="meter-high">WILD</span></div>
    </section>

    <footer className="game-console">
      <div className="console-intro"><div><span className="console-kicker"><span className="live-pip"/> BUILD YOUR RESTORATION</span><strong>Field kit</strong></div><div className="console-controls"><button className="time-control" aria-label={playing ? 'Pause simulation' : 'Resume simulation'} onClick={() => setPlaying(value => !value)}>{playing ? <Pause size={15}/> : <Play size={15}/>} <span>{playing ? 'LIVE' : 'PAUSED'}</span></button><span className="control-divider"/><span className="day-control"><small>DAY</small><b>{String(day).padStart(2, '0')}</b><button aria-label="Advance to next day" onClick={() => setDay(value => Math.min(30, value + 1))}><ArrowRight size={13}/></button></span></div></div>
      <div className="tool-tray">{pieceCatalog.map(({ kind, name, cost, art, color }) => <button key={kind} className={`build-card ${placing === kind ? 'build-active' : ''} ${credits < cost ? 'build-locked' : ''}`} onClick={() => selectTool(kind)} aria-pressed={placing === kind} disabled={credits < cost}><span className={`build-icon ${color} build-icon-${kind}`}><img src={art} alt="" draggable={false}/>{pieces.some(piece => piece.kind === kind) && <i><Check size={8}/></i>}</span><span className="build-name">{name}<small>{kind === 'gate' ? 'FLOW CONTROL' : kind === 'reeds' ? 'NATIVE PLANTS' : kind === 'turbine' ? 'CLEAN ENERGY' : kind === 'sensor' ? 'FIELD RESEARCH' : 'WILDLIFE'}</small></span><span className="build-cost"><Coins size={12}/>{cost}</span><Plus className="build-plus" size={14}/></button>)}</div>
      <div className="console-bottom"><span className="console-instructions"><span><span className="keycap">CLICK</span><span>choose a kit</span></span><span><span className="keycap">CLICK FIELD</span><span>place it</span></span><span><span className="keycap">DRAG</span><span>move pieces</span></span><span><span className="keycap">DRAG FIELD</span><span>explore</span></span><span><span className="keycap">2 FINGERS</span><span>pan &amp; zoom</span></span></span><button onClick={boostWater} className="restore-button" disabled={restoration >= 100}><Droplets size={16}/>{restoration >= 100 ? 'WETLAND RESTORED' : 'RESTORE WATER'} <span>−12</span></button></div>
    </footer>
    {toast && <div className="game-toast" role="status"><Sparkles size={15}/>{toast}</div>}
    {settingsOpen && <div className="game-settings-shade" onClick={() => setSettingsOpen(false)}><section className="game-settings" role="dialog" aria-modal="true" aria-labelledby="game-settings-title" onClick={event => event.stopPropagation()}><button className="game-settings-close" aria-label="Close settings" onClick={() => setSettingsOpen(false)}><X size={17}/></button><span className="console-kicker">FIELD CONFIGURATION</span><h2 id="game-settings-title">Game settings</h2><p>Make your restoration field easier to read.</p><button className="game-setting-row" onClick={() => setAmbientSound(value => !value)}><span><strong>Ambient field sounds</strong><small>Gentle water and wildlife sounds</small></span><i className={ambientSound ? 'toggle-on' : ''}/></button><button className="game-setting-row" onClick={() => setShowGrid(value => !value)}><span><strong>Placement grid</strong><small>Show alignment guides on the field</small></span><i className={showGrid ? 'toggle-on' : ''}/></button><button className="game-settings-done" onClick={() => setSettingsOpen(false)}>Back to the field</button></section></div>}
    <div className="game-version">WILDPATCH <span>ALPHA 0.4</span></div>
  </main>
}
