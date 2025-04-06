
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { conceptInfo } from '@/data/simulationData';

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
          
          <div className="bg-secondary p-4 rounded-md space-y-2">
            <h4 className="text-sm font-medium">Expected Outcomes:</h4>
            {strategy === 'data_parallel' ? (
              <>
                <p className="text-sm">Training speed: {nodeCount} nodes → ~{Math.min(nodeCount, 4)}x faster (simulated)</p>
                <p className="text-sm">Communication overhead: Gradient sync after each batch</p>
                <p className="text-sm">Best for: Small to medium-sized models</p>
              </>
            ) : (
              <>
                <p className="text-sm">Training speed: {nodeCount} nodes → ~{Math.max(1, Math.floor(nodeCount/2))}x faster (simulated)</p>
                <p className="text-sm">Communication overhead: +50% latency (simulated)</p>
                <p className="text-sm">Best for: Very large models that don't fit on a single GPU</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParallelismStrategy;
