
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { NodeData } from '@/data/simulationData';

interface ResourceMonitorProps {
  nodes: NodeData[];
  isTraining: boolean;
}

const ResourceMonitor: React.FC<ResourceMonitorProps> = ({ nodes, isTraining }) => {
  const [gpuUtilization, setGpuUtilization] = useState<number>(0);
  const [cpuUtilization, setCpuUtilization] = useState<number>(0);
  const [networkTraffic, setNetworkTraffic] = useState<number>(0);
  
  useEffect(() => {
    if (isTraining && nodes.length > 0) {
      // Calculate average utilizations
      const avgGpu = nodes.reduce((acc, node) => acc + node.gpu.utilization, 0) / nodes.length;
      const avgCpu = nodes.reduce((acc, node) => acc + node.cpu.utilization, 0) / nodes.length;
      
      // Add some random variations to make it feel alive
      const randomFactor = () => 0.9 + Math.random() * 0.2; // Between 0.9 and 1.1
      
      setGpuUtilization(Math.min(100, avgGpu * randomFactor()));
      setCpuUtilization(Math.min(100, avgCpu * randomFactor()));
      
      // Network traffic is higher during training
      setNetworkTraffic(Math.min(100, 40 + Math.random() * 30));
      
      // Set up interval for periodic updates
      const interval = setInterval(() => {
        setGpuUtilization(prev => {
          const newVal = prev + (Math.random() * 10 - 5); // -5 to +5 change
          return Math.max(60, Math.min(100, newVal));
        });
        
        setCpuUtilization(prev => {
          const newVal = prev + (Math.random() * 8 - 4); // -4 to +4 change
          return Math.max(20, Math.min(90, newVal));
        });
        
        setNetworkTraffic(prev => {
          const newVal = prev + (Math.random() * 20 - 10); // -10 to +10 change
          return Math.max(20, Math.min(95, newVal));
        });
      }, 2000);
      
      return () => clearInterval(interval);
    } else {
      // When not training, set low utilization values
      setGpuUtilization(5);
      setCpuUtilization(10);
      setNetworkTraffic(5);
    }
  }, [isTraining, nodes]);

  // Determine color based on utilization
  const getUtilizationColor = (value: number) => {
    if (value > 90) return 'bg-red-500';
    if (value > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">Resource Monitor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">GPU Utilization</span>
              <span className="text-sm font-mono">
                {Math.round(gpuUtilization)}%
              </span>
            </div>
            <Progress 
              value={gpuUtilization} 
              className="h-2"
              indicatorClassName={getUtilizationColor(gpuUtilization)}
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">CPU Utilization</span>
              <span className="text-sm font-mono">
                {Math.round(cpuUtilization)}%
              </span>
            </div>
            <Progress 
              value={cpuUtilization} 
              className="h-2"
              indicatorClassName={getUtilizationColor(cpuUtilization)}
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Network Traffic</span>
              <span className="text-sm font-mono">
                {Math.round(networkTraffic)}%
              </span>
            </div>
            <Progress 
              value={networkTraffic} 
              className="h-2"
              indicatorClassName={getUtilizationColor(networkTraffic)}
            />
          </div>
          
          {gpuUtilization > 90 && (
            <div className="bg-red-100 text-red-700 p-2 rounded-md text-sm mt-2">
              Warning: High GPU utilization! Consider reducing batch size.
            </div>
          )}
          
          {cpuUtilization < 20 && isTraining && (
            <div className="bg-yellow-100 text-yellow-700 p-2 rounded-md text-sm mt-2">
              Tip: CPU utilization is low. You could assign more preprocessing tasks!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceMonitor;
