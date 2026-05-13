import '@/styles/App.css'
import SimulationCanvas from '@/components/canvas/SimulationCanvas'
import Controls from '@/components/ui/Controls'

function App() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <SimulationCanvas />
      <Controls />
    </div>
  )
}

export default App
