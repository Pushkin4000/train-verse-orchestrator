
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Square, RotateCw, Info } from 'lucide-react';
import { EpochData } from '@/data/simulationData';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

  useEffect(() => {
    if (isTraining) {
      // Calculate simulated epoch time based on strategy and node count
      let baseTime = 5.0; // Starting time in seconds
      let speedFactor = 1;
      
      if (strategy === 'data_parallel') {
        // Data parallel scales much better with node count
        speedFactor = Math.min(nodeCount, nodeCount * 0.9); // Almost linear scaling
      } else {
        // Model parallel has diminishing returns
        speedFactor = Math.max(1, Math.log2(nodeCount) * 1.2);
      }
      
      // Add some randomness to make it feel realistic
      const randomFactor = 0.9 + Math.random() * 0.2; // Between 0.9 and 1.1
      
      const simulatedTime = (baseTime / speedFactor) * randomFactor;
      setEpochTime(parseFloat(simulatedTime.toFixed(1)));
      
      // Calculate speedometer angle (0-180 degrees)
      const epsilonRate = 1 / simulatedTime; // epochs per second
      const maxRate = 5; // 5 epochs per second is max on our speedometer
      const angle = Math.min(180, (epsilonRate / maxRate) * 180);
      setSpeedometerAngle(angle);
      
      // Set the speed improvement text
      if (nodeCount > 1) {
        const improvementFactor = baseTime / simulatedTime;
        const improvementPercent = ((improvementFactor - 1) * 100).toFixed(0);
        setSpeedImprovementText(`${nodeCount} nodes = ${improvementPercent}% speed improvement`);
      } else {
        setSpeedImprovementText("Add more nodes to increase speed");
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
              <span>Time per epoch: {epochTime}s</span>
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
                        ? "Data Parallelism scales almost linearly with node count for most workloads" 
                        : "Model Parallelism has communication overhead that limits scaling"}
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
                  <div className="text-xs font-mono">
                    {epochTime ? (1 / epochTime).toFixed(1) : '0'} ep/s
                  </div>
                  <div className="text-xs font-medium mt-1 text-accent">
                    {speedImprovementText}
                  </div>
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
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingProgress;
