import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Square, RotateCw, Info } from 'lucide-react';
import { EpochData } from '@/data/simulationData';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface TrainingProgressProps {
  isTraining: boolean;
  onStartTraining: () => void;
  onStopTraining: () => void;
  currentEpoch: number;
  totalEpochs: number;
  epochProgress: number;
  currentData: EpochData | null;
  strategy: 'data_parallel' | 'model_parallel';
  nodeCount: number;
}

const TrainingProgress: React.FC<TrainingProgressProps> = ({
  isTraining,
  onStartTraining,
  onStopTraining,
  currentEpoch,
  totalEpochs,
  epochProgress,
  currentData,
  strategy,
  nodeCount,
}) => {
  const [epochTime, setEpochTime] = useState<number>(0);
  const [speedometerAngle, setSpeedometerAngle] = useState<number>(0);
  const [speedImprovementText, setSpeedImprovementText] = useState<string>("");
  const [speedDifference, setSpeedDifference] = useState<string>("");

  useEffect(() => {
    if (isTraining) {
      // Dramatically different base times for strategies
      let baseTime = 10.0; // Starting time in seconds - much slower default
      let speedFactor = 1;
      
      if (strategy === 'data_parallel') {
        // Data parallel scales much better with node count - almost linear
        speedFactor = Math.min(nodeCount * 0.95, nodeCount); // Nearly linear scaling
      } else {
        // Model parallel has severe diminishing returns
        speedFactor = Math.max(1, Math.log2(nodeCount) * 0.8); // Much worse scaling
      }
      
      // Add minimal randomness to make it feel realistic but keep differences clear
      const randomFactor = 0.95 + Math.random() * 0.1; // Between 0.95 and 1.05
      
      const simulatedTime = (baseTime / speedFactor) * randomFactor;
      setEpochTime(parseFloat(simulatedTime.toFixed(1)));
      
      // Calculate speedometer angle (0-180 degrees)
      const epsilonRate = 1 / simulatedTime; // epochs per second
      const maxRate = 2; // 2 epochs per second is max on our speedometer (adjusted to show bigger difference)
      const angle = Math.min(180, (epsilonRate / maxRate) * 180);
      setSpeedometerAngle(angle);
      
      // Set the speed improvement text - make improvements more dramatic
      if (nodeCount > 1) {
        const improvementFactor = baseTime / simulatedTime;
        const improvementPercent = ((improvementFactor - 1) * 100).toFixed(0);
        
        if (strategy === 'data_parallel') {
          setSpeedImprovementText(`${nodeCount} nodes = ${improvementPercent}% speed boost!`);
        } else {
          // For model parallel, show less dramatic improvements
          setSpeedImprovementText(`${nodeCount} nodes = ${improvementPercent}% improvement`);
        }
      } else {
        setSpeedImprovementText("Add more nodes to increase speed");
      }

      // Add comparison between strategies
      if (nodeCount > 1) {
        const dataParallelTime = baseTime / (nodeCount * 0.95);
        const modelParallelTime = baseTime / (Math.log2(nodeCount) * 0.8);
        
        if (strategy === 'data_parallel') {
          const timesDifference = (modelParallelTime / dataParallelTime).toFixed(1);
          setSpeedDifference(`${timesDifference}x faster than Model Parallelism`);
        } else {
          const timesDifference = (modelParallelTime / dataParallelTime).toFixed(1);
          setSpeedDifference(`${timesDifference}x slower than Data Parallelism`);
        }
      } else {
        setSpeedDifference("");
      }
    }
  }, [isTraining, strategy, nodeCount, currentEpoch]);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">Training Progress</CardTitle>
        <div className="flex space-x-2">
          {!isTraining ? (
            <Button 
              variant="default" 
              size="sm" 
              onClick={onStartTraining}
              className="bg-accent hover:bg-accent/90"
              disabled={nodeCount === 0}
            >
              <Play size={16} className="mr-1" /> Start Training
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onStopTraining}
            >
              <Square size={16} className="mr-1" /> Stop
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Epoch: {currentEpoch}/{totalEpochs}</span>
              <span>Time per epoch: <Badge variant={epochTime < 3 ? "default" : epochTime < 6 ? "outline" : "destructive"}>{epochTime}s</Badge></span>
            </div>
            <Progress value={epochProgress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <div className="flex items-center text-sm font-medium mb-2">
                <span>Training Speed</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                      <Info size={12} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      {strategy === 'data_parallel' 
                        ? "Data Parallelism scales almost linearly with node count, dramatically reducing training time" 
                        : "Model Parallelism has severe communication overhead that greatly limits scaling"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="speedometer relative h-24 w-full">
                <div 
                  className="speedometer-indicator"
                  style={{ transform: `rotate(${speedometerAngle}deg)` }}
                ></div>
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                  <div className="text-sm font-mono">
                    {epochTime ? (1 / epochTime).toFixed(1) : '0'} ep/s
                  </div>
                  <div className="text-xs font-medium mt-1 text-accent">
                    {speedImprovementText}
                  </div>
                  {speedDifference && (
                    <div className={`text-xs font-medium mt-1 ${strategy === 'data_parallel' ? 'text-green-600' : 'text-amber-600'}`}>
                      {speedDifference}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Current Metrics</div>
              <div className="bg-secondary p-3 rounded-md space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Loss:</span>
                  <span className="font-mono">{currentData?.loss?.[currentEpoch - 1]?.toFixed(4) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span className="font-mono">{currentData?.accuracy?.[currentEpoch - 1]?.toFixed(4) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Batch Size:</span>
                  <span className="font-mono">{strategy === 'data_parallel' ? 32 * nodeCount : 32}</span>
                </div>
              </div>
              
              {isTraining && strategy === 'data_parallel' && nodeCount > 1 && (
                <div className="bg-green-50 text-green-700 p-2 rounded-md text-xs">
                  Effective speedup: Nearly {nodeCount}x with {nodeCount} nodes!
                </div>
              )}
              
              {isTraining && strategy === 'model_parallel' && nodeCount > 1 && (
                <div className="bg-yellow-50 text-yellow-700 p-2 rounded-md text-xs">
                  Limited speedup: Only {Math.log2(nodeCount).toFixed(1)}x with {nodeCount} nodes due to communication overhead
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingProgress;
