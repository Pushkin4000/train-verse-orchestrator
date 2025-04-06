
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { conceptInfo } from '@/data/simulationData';
import { Badge } from "@/components/ui/badge";

interface ParallelismStrategyProps {
  strategy: 'data_parallel' | 'model_parallel';
  onStrategyChange: (strategy: 'data_parallel' | 'model_parallel') => void;
  nodeCount: number;
}

const ParallelismStrategy: React.FC<ParallelismStrategyProps> = ({ 
  strategy, 
  onStrategyChange,
  nodeCount
}) => {
  const handleToggle = () => {
    onStrategyChange(strategy === 'data_parallel' ? 'model_parallel' : 'data_parallel');
  };

  // Calculate speed improvement and efficiency factors for both strategies
  const dataParallelSpeedup = Math.min(nodeCount, nodeCount * 0.9).toFixed(1); // Almost linear
  const modelParallelSpeedup = Math.max(1, Math.log2(nodeCount) * 1.2).toFixed(1); // Logarithmic
  
  // Calculate efficiency (speedup/nodes)
  const dataParallelEfficiency = ((parseFloat(dataParallelSpeedup) / nodeCount) * 100).toFixed(0);
  const modelParallelEfficiency = ((parseFloat(modelParallelSpeedup) / nodeCount) * 100).toFixed(0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">Parallelism Strategy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Label htmlFor="parallelism-toggle" className="font-medium">
                {strategy === 'data_parallel' ? 'Data Parallelism' : 'Model Parallelism'}
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    {strategy === 'data_parallel' 
                      ? conceptInfo.dataParallelism.description 
                      : conceptInfo.modelParallelism.description}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch 
              id="parallelism-toggle" 
              checked={strategy === 'model_parallel'}
              onCheckedChange={handleToggle}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg space-y-2 border ${strategy === 'data_parallel' ? 'border-primary bg-primary/5' : 'border-muted bg-secondary/50'}`}>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Data Parallelism</h4>
                {strategy === 'data_parallel' && <Badge variant="default">Active</Badge>}
              </div>
              <ul className="space-y-1 text-xs">
                <li className="flex justify-between">
                  <span>Speed boost:</span>
                  <span className="font-medium">{dataParallelSpeedup}x faster</span>
                </li>
                <li className="flex justify-between">
                  <span>Scaling efficiency:</span>
                  <span className="font-medium">{dataParallelEfficiency}%</span>
                </li>
                <li>• Splits data across nodes</li>
                <li>• Gradient sync after each batch</li>
                <li>• Best for small models</li>
              </ul>
            </div>

            <div className={`p-3 rounded-lg space-y-2 border ${strategy === 'model_parallel' ? 'border-primary bg-primary/5' : 'border-muted bg-secondary/50'}`}>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Model Parallelism</h4>
                {strategy === 'model_parallel' && <Badge variant="default">Active</Badge>}
              </div>
              <ul className="space-y-1 text-xs">
                <li className="flex justify-between">
                  <span>Speed boost:</span>
                  <span className="font-medium">{modelParallelSpeedup}x faster</span>
                </li>
                <li className="flex justify-between">
                  <span>Scaling efficiency:</span>
                  <span className="font-medium">{modelParallelEfficiency}%</span>
                </li>
                <li>• Splits model layers across nodes</li>
                <li>• Higher communication overhead</li>
                <li>• Best for very large models</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 text-blue-700 p-3 rounded-md space-y-1 text-sm">
            <h4 className="font-medium">Key Insight:</h4>
            <p className="text-xs">
              {nodeCount > 1
                ? `With ${nodeCount} nodes, Data Parallelism is ${(parseFloat(dataParallelSpeedup) / parseFloat(modelParallelSpeedup)).toFixed(1)}x faster than Model Parallelism for small models`
                : "Add more nodes to see performance comparisons between strategies"}
            </p>
            <p className="text-xs">
              {strategy === 'data_parallel' 
                ? "Each additional node in Data Parallelism adds almost linear speedup until communication bottlenecks occur"
                : "Model Parallelism improves with more nodes but has diminishing returns due to layer dependencies"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParallelismStrategy;
