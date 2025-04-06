
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NodeData } from '@/data/simulationData';

interface GradientVisualizerProps {
  nodes: NodeData[];
  isTraining: boolean;
  strategy: 'data_parallel' | 'model_parallel';
}

const GradientVisualizer: React.FC<GradientVisualizerProps> = ({ 
  nodes, 
  isTraining,
  strategy
}) => {
  const [triggerSync, setTriggerSync] = useState(0);

  useEffect(() => {
    if (isTraining && strategy === 'data_parallel') {
      // Trigger gradient sync animation periodically
      const interval = setInterval(() => {
        setTriggerSync(prev => prev + 1);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isTraining, strategy]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">
          {strategy === 'data_parallel' ? 'Gradient Synchronization' : 'Model Partitioning'}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative min-h-[180px]">
        {strategy === 'data_parallel' ? (
          <div className="relative w-full h-[150px]">
            {/* Central aggregator */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-accent rounded-full flex items-center justify-center z-10">
              <span className="text-white text-xs font-medium">Agg</span>
            </div>
            
            {/* Nodes */}
            {nodes.slice(0, 4).map((node, idx) => {
              // Position nodes in a circle around the aggregator
              const angle = (idx * Math.PI * 2) / Math.min(4, nodes.length);
              const radius = 70; // Distance from center
              const x = Math.cos(angle) * radius + 50; // % position from center
              const y = Math.sin(angle) * radius + 50;
              
              return (
                <React.Fragment key={node.id}>
                  <div 
                    className={`absolute w-8 h-8 rounded-md flex items-center justify-center ${
                      node.status === 'failed' ? 'bg-red-400' : 'bg-primary'
                    }`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <span className="text-white text-xs">{node.id}</span>
                  </div>
                  
                  {/* Gradient sync animation lines */}
                  {isTraining && node.status === 'healthy' && (
                    <div 
                      key={`line-${node.id}-${triggerSync}`}
                      className="gradient-sync"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        width: `${radius}px`,
                        transformOrigin: 'left center',
                        transform: `translate(-50%, -50%) rotate(${angle}rad)`,
                        animationDelay: `${idx * 0.2}s`
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
            
            {isTraining && (
              <div className="absolute bottom-0 left-0 right-0 text-center text-sm text-muted-foreground">
                {strategy === 'data_parallel' ? 
                  "Gradients are being synchronized across nodes" : 
                  "Model layers are distributed across nodes"}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Model parallelism visualization */}
            <div className="flex w-full h-[150px] items-center justify-center">
              {nodes.slice(0, 4).map((node, idx) => (
                <div 
                  key={node.id} 
                  className={`h-24 flex-1 mx-1 rounded-md flex flex-col items-center justify-center border-2 ${
                    node.status === 'failed' ? 'border-red-400 bg-red-50' : 'border-primary bg-primary/10'
                  }`}
                >
                  <div className="text-xs font-medium mb-1">Node {node.id}</div>
                  <div className="text-xs text-muted-foreground">
                    {idx === 0 ? "Input Layers" : 
                     idx === nodes.length - 1 ? "Output Layers" : 
                     `Hidden Layers ${idx}`}
                  </div>
                </div>
              ))}
            </div>
            
            {isTraining && (
              <div className="text-center text-sm text-muted-foreground">
                Data flows through model layers distributed across nodes
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GradientVisualizer;
