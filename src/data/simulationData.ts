
export interface EpochData {
  epoch_time: number[];
  loss: number[];
  accuracy?: number[];
}

export interface ParallelismData {
  data_parallel: EpochData;
  model_parallel: EpochData;
}

export interface NodeData {
  id: number;
  name: string;
  gpu: {
    utilization: number;
    memory: {
      used: number;
      total: number;
    };
    type: string;
  };
  cpu: {
    utilization: number;
    cores: number;
  };
  network: {
    bandwidth: number;
    latency: number;
  };
  status: 'healthy' | 'failed' | 'recovering';
}

export const epochProgress: ParallelismData = {
  data_parallel: {
    epoch_time: [5.0, 2.5, 1.2, 0.8, 0.5, 0.4, 0.35, 0.33, 0.32, 0.31], // Much faster reduction
    loss: [2.1, 1.3, 0.7, 0.5, 0.4, 0.35, 0.3, 0.28, 0.26, 0.25],
    accuracy: [0.45, 0.65, 0.78, 0.82, 0.85, 0.87, 0.89, 0.9, 0.91, 0.92]
  },
  model_parallel: {
    epoch_time: [5.0, 3.2, 2.4, 1.8, 1.5, 1.3, 1.2, 1.1, 1.05, 1.0], // Slower reduction
    loss: [2.1, 1.5, 0.9, 0.7, 0.6, 0.55, 0.5, 0.48, 0.46, 0.45],
    accuracy: [0.4, 0.6, 0.72, 0.77, 0.81, 0.84, 0.86, 0.87, 0.88, 0.89]
  }
};

export const defaultNodes: NodeData[] = [
  {
    id: 1,
    name: "Node 1",
    gpu: {
      utilization: 85,
      memory: {
        used: 12,
        total: 16
      },
      type: "NVIDIA A100"
    },
    cpu: {
      utilization: 45,
      cores: 16
    },
    network: {
      bandwidth: 10,
      latency: 5
    },
    status: "healthy"
  },
  {
    id: 2,
    name: "Node 2",
    gpu: {
      utilization: 82,
      memory: {
        used: 11,
        total: 16
      },
      type: "NVIDIA A100"
    },
    cpu: {
      utilization: 40,
      cores: 16
    },
    network: {
      bandwidth: 10,
      latency: 7
    },
    status: "healthy"
  },
  {
    id: 3,
    name: "Node 3",
    gpu: {
      utilization: 87,
      memory: {
        used: 13,
        total: 16
      },
      type: "NVIDIA A100"
    },
    cpu: {
      utilization: 50,
      cores: 16
    },
    network: {
      bandwidth: 10,
      latency: 6
    },
    status: "healthy"
  },
  {
    id: 4,
    name: "Node 4",
    gpu: {
      utilization: 80,
      memory: {
        used: 10,
        total: 16
      },
      type: "NVIDIA A100"
    },
    cpu: {
      utilization: 35,
      cores: 16
    },
    network: {
      bandwidth: 10,
      latency: 8
    },
    status: "healthy"
  }
];

export const recoveryTimes = {
  singleNodeFailure: 20,
  networkPartition: 30
};

export const tutorials = [
  {
    title: "Build Your Cluster",
    content: "Drag and drop GPU nodes to build your training cluster. More nodes can increase training speed, but watch out for diminishing returns and increased costs!"
  },
  {
    title: "Choose Parallelism Strategy",
    content: "Data Parallelism splits data across nodes and is best for smaller models. Model Parallelism splits the model itself and works better for very large models that don't fit on a single GPU."
  },
  {
    title: "Start Training",
    content: "Click 'Start Training' to begin the simulation. Watch as your model trains across the cluster and metrics update in real-time."
  },
  {
    title: "Test Fault Tolerance",
    content: "Try killing a node to see how the system recovers. Training will pause, restore from a checkpoint, and continue with the remaining nodes."
  }
];

export const conceptInfo = {
  dataParallelism: {
    title: "Data Parallelism",
    description: "Splits batches of data across multiple nodes. Each node has a full copy of the model and processes different data samples. Gradients are synchronized between nodes to update the model."
  },
  modelParallelism: {
    title: "Model Parallelism",
    description: "Splits the model itself across multiple nodes. Each node holds a portion of the model architecture and processes the same data. Useful for very large models that don't fit in a single GPU's memory."
  },
  checkpointing: {
    title: "Checkpointing",
    description: "Periodically saves model weights and optimizer state during training. If a node fails, training can resume from the last checkpoint rather than starting over."
  },
  gradientSync: {
    title: "Gradient Synchronization",
    description: "In data parallelism, each node computes gradients on its portion of data. These gradients must be averaged across all nodes to update the model consistently."
  }
};
