
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NodeData } from '@/data/simulationData';
import { Skull } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NodeManagementProps {
  nodes: NodeData[];
  onKillNode: (id: number) => void;
  onShowTooltip: (content: string) => void;
  isTraining: boolean;
}

const NodeManagement: React.FC<NodeManagementProps> = ({ 
  nodes, 
  onKillNode,
  onShowTooltip,
  isTraining
}) => {
  const handleKillNode = (id: number) => {
    if (!isTraining) {
      onShowTooltip("Start training before simulating node failure.");
      return;
    }
    onKillNode(id);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">Node Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm">
            Test fault tolerance by killing a node during training to see how the system recovers.
          </div>

          <div className="space-y-2">
            {nodes.map(node => (
              <div 
                key={node.id} 
                className={`flex items-center justify-between p-2 rounded-md ${
                  node.status === 'failed' 
                    ? 'bg-red-100 border border-red-300' 
                    : node.status === 'recovering' 
                    ? 'bg-yellow-100 border border-yellow-300'
                    : 'bg-secondary'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      node.status === 'failed' 
                        ? 'bg-red-500' 
                        : node.status === 'recovering' 
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                  />
                  <span>{node.name}</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 w-7 p-0" 
                      onClick={() => handleKillNode(node.id)}
                      disabled={node.status === 'failed' || node.status === 'recovering'}
                    >
                      <Skull size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Kill node to test fault tolerance</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-sm">
            <p className="font-medium">Recovery Times (Simulated):</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Single node failure: ~20s</li>
              <li>Network partition: ~30s</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NodeManagement;
