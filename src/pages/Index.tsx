
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClusterConfiguration from '@/components/ClusterConfiguration';
import ParallelismStrategy from '@/components/ParallelismStrategy';
import TrainingProgress from '@/components/TrainingProgress';
import MetricsGraph from '@/components/MetricsGraph';
import NodeManagement from '@/components/NodeManagement';
import ResourceMonitor from '@/components/ResourceMonitor';
import GradientVisualizer from '@/components/GradientVisualizer';
import TutorialOverlay from '@/components/TutorialOverlay';
import ConceptInfoModal from '@/components/ConceptInfoModal';
import Notification from '@/components/Notification';
import { defaultNodes, epochProgress, NodeData, conceptInfo } from '@/data/simulationData';
import { Info, HelpCircle, Terminal } from 'lucide-react';

const MAX_NODES = 16;
const TOTAL_EPOCHS = 10;

const Index = () => {
  // State for cluster configuration
  const [nodes, setNodes] = useState<NodeData[]>(defaultNodes.slice(0, 4));
  const [nextNodeId, setNextNodeId] = useState(5);
  
  // State for training
  const [parallelismStrategy, setParallelismStrategy] = useState<'data_parallel' | 'model_parallel'>('data_parallel');
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [epochProgressPercent, setEpochProgressPercent] = useState(0);
  
  // State for UI components
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(1);
  const [conceptModalOpen, setConceptModalOpen] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<keyof typeof conceptInfo | null>(null);
  const [notification, setNotification] = useState<{message: string; type: 'default' | 'success' | 'error' | 'warning'} | null>(null);
  const [recoveryInProgress, setRecoveryInProgress] = useState(false);
  
  // Add a new node to the cluster
  const handleAddNode = () => {
    if (nodes.length >= MAX_NODES) return;
    
    const newNode: NodeData = {
      id: nextNodeId,
      name: `Node ${nextNodeId}`,
      gpu: {
        utilization: 80 + Math.floor(Math.random() * 10),
        memory: {
          used: 10 + Math.floor(Math.random() * 6),
          total: 16
        },
        type: "NVIDIA A100"
      },
      cpu: {
        utilization: 35 + Math.floor(Math.random() * 20),
        cores: 16
      },
      network: {
        bandwidth: 10,
        latency: 5 + Math.floor(Math.random() * 5)
      },
      status: "healthy"
    };
    
    setNodes([...nodes, newNode]);
    setNextNodeId(nextNodeId + 1);
    
    showNotification(`Added ${newNode.name} to the cluster`, 'success');
  };
  
  // Remove a node from the cluster
  const handleRemoveNode = (id: number) => {
    if (isTraining) {
      showNotification("Cannot remove nodes during training", 'error');
      return;
    }
    
    setNodes(nodes.filter(node => node.id !== id));
    showNotification(`Removed Node ${id} from the cluster`, 'default');
  };
  
  // Kill a node during training to simulate failure
  const handleKillNode = (id: number) => {
    const updatedNodes = nodes.map(node => 
      node.id === id ? { ...node, status: 'failed' } : node
    );
    
    setNodes(updatedNodes);
    showNotification(`Node ${id} has failed! System will attempt recovery...`, 'error');
    
    // Simulate recovery process
    setRecoveryInProgress(true);
    setTimeout(() => {
      setIsTraining(false);
      showNotification(`Training paused. Restoring from checkpoint...`, 'warning');
      
      // After a delay, restore training
      setTimeout(() => {
        // Update the node status to recovering
        setNodes(prevNodes => 
          prevNodes.map(node => 
            node.id === id ? { ...node, status: 'recovering' } : node
          )
        );
        
        // Simulate checkpoint recovery by going back 2 epochs
        const recoveryEpoch = Math.max(1, currentEpoch - 2);
        setCurrentEpoch(recoveryEpoch);
        showNotification(`Resumed training from epoch ${recoveryEpoch}/${TOTAL_EPOCHS}`, 'success');
        
        // Resume training
        setIsTraining(true);
        setRecoveryInProgress(false);
        
        // After more time, restore the node
        setTimeout(() => {
          setNodes(prevNodes => 
            prevNodes.map(node => 
              node.id === id ? { ...node, status: 'healthy' } : node
            )
          );
          showNotification(`Node ${id} recovered and rejoined the cluster`, 'success');
        }, 10000);
      }, 3000);
    }, 2000);
  };
  
  // Start the training process
  const handleStartTraining = () => {
    if (nodes.length === 0) {
      showNotification("Add at least one node to start training", 'error');
      return;
    }
    
    setIsTraining(true);
    setCurrentEpoch(0);
    setEpochProgressPercent(0);
    showNotification("Initializing distributed training...", 'default');
  };
  
  // Stop the training process
  const handleStopTraining = () => {
    setIsTraining(false);
    showNotification("Training stopped", 'warning');
  };
  
  // Change the parallelism strategy
  const handleStrategyChange = (strategy: 'data_parallel' | 'model_parallel') => {
    if (isTraining) {
      showNotification("Cannot change strategy during training", 'error');
      return;
    }
    
    setParallelismStrategy(strategy);
    showNotification(`Switched to ${strategy === 'data_parallel' ? 'Data Parallelism' : 'Model Parallelism'}`, 'default');
  };
  
  // Show a notification
  const showNotification = (message: string, type: 'default' | 'success' | 'error' | 'warning' = 'default') => {
    setNotification({ message, type });
  };
  
  // Handle the tutorial
  const handleNextStep = () => {
    if (tutorialStep < Object.keys(conceptInfo).length) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
    }
  };
  
  const handlePrevStep = () => {
    if (tutorialStep > 1) {
      setTutorialStep(tutorialStep - 1);
    }
  };
  
  // Show a concept modal
  const handleShowConcept = (concept: keyof typeof conceptInfo) => {
    setSelectedConcept(concept);
    setConceptModalOpen(true);
  };
  
  // Training simulation loop
  useEffect(() => {
    if (isTraining && !recoveryInProgress) {
      const progressInterval = setInterval(() => {
        setEpochProgressPercent(prev => {
          if (prev >= 100) {
            // Move to the next epoch
            setCurrentEpoch(currentEpoch => {
              const nextEpoch = currentEpoch + 1;
              if (nextEpoch > TOTAL_EPOCHS) {
                clearInterval(progressInterval);
                setIsTraining(false);
                showNotification("Training completed successfully!", 'success');
                return currentEpoch;
              }
              return nextEpoch;
            });
            return 0;
          }
          return prev + 5; // Increment progress by 5%
        });
      }, 200);
      
      return () => clearInterval(progressInterval);
    }
  }, [isTraining, currentEpoch, recoveryInProgress]);
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Distributed Training Orchestrator</h1>
          <p className="text-muted-foreground">
            Simulate and visualize distributed training workflows
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowTutorial(true)}>
            <HelpCircle size={16} className="mr-1" /> Tutorial
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleShowConcept('dataParallelism')}
          >
            <Info size={16} className="mr-1" /> Concepts
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <ClusterConfiguration 
          nodes={nodes} 
          onAddNode={handleAddNode} 
          onRemoveNode={handleRemoveNode}
          maxNodes={MAX_NODES}
        />
        <TrainingProgress 
          isTraining={isTraining}
          onStartTraining={handleStartTraining}
          onStopTraining={handleStopTraining}
          currentEpoch={currentEpoch}
          totalEpochs={TOTAL_EPOCHS}
          epochProgress={epochProgressPercent}
          currentData={currentEpoch > 0 ? epochProgress[parallelismStrategy] : null}
          strategy={parallelismStrategy}
          nodeCount={nodes.filter(n => n.status === 'healthy').length}
        />
        <ParallelismStrategy 
          strategy={parallelismStrategy} 
          onStrategyChange={handleStrategyChange}
          nodeCount={nodes.filter(n => n.status === 'healthy').length}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <MetricsGraph 
          data={epochProgress} 
          currentStrategy={parallelismStrategy}
          currentEpoch={currentEpoch}
        />
        <GradientVisualizer 
          nodes={nodes}
          isTraining={isTraining}
          strategy={parallelismStrategy}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NodeManagement 
          nodes={nodes}
          onKillNode={handleKillNode}
          onShowTooltip={showNotification}
          isTraining={isTraining}
        />
        <ResourceMonitor 
          nodes={nodes}
          isTraining={isTraining}
        />
      </div>
      
      {/* Overlays and Notifications */}
      <TutorialOverlay 
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        step={tutorialStep}
        onNextStep={handleNextStep}
        onPrevStep={handlePrevStep}
        totalSteps={tutorials.length}
      />
      
      <ConceptInfoModal 
        isOpen={conceptModalOpen}
        onClose={() => setConceptModalOpen(false)}
        concept={selectedConcept}
      />
      
      <Notification 
        message={notification?.message || null}
        type={notification?.type}
        onComplete={() => setNotification(null)}
      />
    </div>
  );
};

export default Index;
