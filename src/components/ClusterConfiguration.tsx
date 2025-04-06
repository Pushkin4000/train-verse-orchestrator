
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, PlusCircle, MinusCircle, Info as InfoIcon } from 'lucide-react';
import { NodeData } from '@/data/simulationData';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ClusterConfigurationProps {
  nodes: NodeData[];
  onAddNode: () => void;
  onRemoveNode: (id: number) => void;
  maxNodes: number;
}

const ClusterConfiguration: React.FC<ClusterConfigurationProps> = ({ 
  nodes, 
  onAddNode, 
  onRemoveNode,
  maxNodes
}) => {
  const [draggedNodeId, setDraggedNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: number) => {
    setDraggedNodeId(id);
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', id.toString());
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragEnd = () => {
    setDraggedNodeId(null);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">Cluster Configuration</CardTitle>
        <div className="flex items-center space-x-2">
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <InfoIcon size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Add GPU nodes to build your training cluster. More nodes can increase training speed but watch out for communication overhead!</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">GPU Nodes: {nodes.length}/{maxNodes}</div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onAddNode}
                disabled={nodes.length >= maxNodes}
              >
                <PlusCircle size={16} className="mr-1" />
                Add Node
              </Button>
            </div>
          </div>
          
          <div
            ref={containerRef}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-secondary rounded-md min-h-[200px]"
          >
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`node tooltip-trigger ${node.status === 'failed' ? 'failed' : ''} ${node.status === 'healthy' ? 'pulse' : ''}`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, node.id)}
                onDragEnd={handleDragEnd}
              >
                <div className="font-medium text-sm mb-1">{node.name}</div>
                <div className="text-xs text-muted-foreground">{node.gpu.type}</div>
                <div className="absolute bottom-2 right-2">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6" 
                    onClick={() => onRemoveNode(node.id)}
                  >
                    <MinusCircle size={14} />
                  </Button>
                </div>
                <div className="tooltip">
                  <div className="mb-1 font-medium">{node.name}</div>
                  <div className="text-xs mb-1">
                    GPU Utilization: {node.gpu.utilization}% | Memory: {node.gpu.memory.used}/{node.gpu.memory.total}GB
                  </div>
                  <div className="text-xs mb-1">
                    CPU Utilization: {node.cpu.utilization}% | Cores: {node.cpu.cores}
                  </div>
                  <div className="text-xs">
                    Network: {node.network.bandwidth}Gbps | Latency: {node.network.latency}ms
                  </div>
                </div>
              </div>
            ))}
            {Array(Math.max(0, 8 - nodes.length)).fill(0).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="border border-dashed border-border rounded-lg h-20 flex items-center justify-center bg-secondary"
              >
                <span className="text-xs text-muted-foreground">Empty Slot</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClusterConfiguration;
