import React from 'react';
import SimulationCanvas from '@/components/canvas/SimulationCanvas';
import Controls from '@/components/ui/Controls';

const Home: React.FC = () => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <SimulationCanvas />
      <Controls />
    </div>
  );
};

export default Home;
