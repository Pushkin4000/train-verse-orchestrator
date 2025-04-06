
import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParallelismData } from "@/data/simulationData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MetricsGraphProps {
  data: ParallelismData;
  currentStrategy: "data_parallel" | "model_parallel";
  currentEpoch: number;
}

const MetricsGraph: React.FC<MetricsGraphProps> = ({
  data,
  currentStrategy,
  currentEpoch,
}) => {
  const formatData = (dataKey: keyof ParallelismData[keyof ParallelismData]) => {
    const currentData = data[currentStrategy];
    if (!currentData || !currentData[dataKey]) return [];

    return Array.from(
      { length: Math.min(currentEpoch, currentData[dataKey].length) },
      (_, i) => ({
        epoch: i + 1,
        value: currentData[dataKey][i],
      })
    );
  };

  const lossData = formatData("loss");
  const accuracyData = formatData("accuracy");
  const epochTimeData = formatData("epoch_time");

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Training Metrics</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <Tabs defaultValue="loss">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="loss">Loss</TabsTrigger>
            <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
            <TabsTrigger value="epoch-time">Epoch Time</TabsTrigger>
          </TabsList>
          <TabsContent value="loss" className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lossData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="epoch" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  name="Loss"
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="accuracy" className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={accuracyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="epoch" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#82ca9d"
                  name="Accuracy"
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="epoch-time" className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={epochTimeData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="epoch" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ff7300"
                  name="Time (seconds)"
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MetricsGraph;
