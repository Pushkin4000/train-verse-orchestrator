
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NodeData } from '@/data/simulationData';
import { Badge } from "@/components/ui/badge";

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
  const [syncFactor, setSyncFactor] = useState<string>("0%");
  const [communicationWarning, setCommunicationWarning] = useState<string>("");

  useEffect(() => {
    if (isTraining && strategy === 'data_parallel') {
      // Calculate communication overhead based on node count - make it more dramatic
      const healthyNodeCount = nodes.filter(n => n.status === 'healthy').length;
      // More aggressive overhead scale - quadratic growth with node count
      const overhead = Math.min(99, healthyNodeCount * healthyNodeCount * 2.5); 
      setSyncFactor(`${overhead}%`);
      
      // Set warning based on node count
      if (healthyNodeCount > 4) {
        setCommunicationWarning(`High communication overhead with ${healthyNodeCount} nodes!`);
      } else {
        setCommunicationWarning("");
      }
      
      // Trigger gradient sync animation periodically
      const interval = setInterval(() => {
        setTriggerSync(prev => prev + 1);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isTraining, strategy, nodes]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">
          {strategy === 'data_parallel' ? 'Gradient Synchronization' : 'Model Partitioning'}
        </CardTitle>
        <Badge variant={isTraining ? "default" : "outline"}>{isTraining ? "ACTIVE" : "READY"}</Badge>
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
                      node.status === 'failed' ? 'bg-red-400' : 
                      node.status === 'recovering' ? 'bg-yellow-400' : 'bg-primary'
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
              <div className="absolute bottom-0 left-0 right-0 text-xs">
                <div className="bg-secondary p-2 rounded-md mx-4 my-2">
                  <div className="flex justify-between mb-1">
                    <span>Gradients synchronized across nodes</span>
                    <span className="font-medium">Every batch</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Communication overhead</span>
                    <span className={`font-medium ${parseFloat(syncFactor) > 50 ? 'text-red-600' : 'text-amber-600'}`}>
                      {syncFactor}
                    </span>
                  </div>
                  {communicationWarning && (
                    <div className="text-red-600 font-medium mt-1">
                      ⚠️ {communicationWarning}
                    </div>
                  )}
                </div>
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
                    node.status === 'failed' ? 'border-red-400 bg-red-50' : 
                    node.status === 'recovering' ? 'border-yellow-400 bg-yellow-50' : 'border-primary bg-primary/10'
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
              <div className="bg-secondary p-2 rounded-md mx-4 my-2 text-xs">
                <div className="flex justify-between mb-1">
                  <span>Sequential processing through layers</span>
                  <span className="font-medium">Linear path</span>
                </div>
                <div className="flex justify-between">
                  <span>Layer transition overhead</span>
                  <span className="font-medium text-red-600">+{Math.min(95, nodes.length * 20)}% latency</span>
                </div>
                {nodes.length > 2 && (
                  <div className="text-red-600 font-medium mt-1">
                    ⚠️ Sequential bottleneck limits speedup!
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GradientVisualizer;
