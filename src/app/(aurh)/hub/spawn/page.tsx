"use client";

import {
  ChevronRight,
  Settings,
  Zap,
  Database,
  Brain,
  Code,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Preset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  cpu: string;
  memory: string;
  gpu?: string;
  tags: string[];
}

const presets: Preset[] = [
  {
    id: "python-basic",
    name: "Python Basic",
    description:
      "Standard Python environment with common data science libraries",
    icon: <Code className="h-6 w-6" />,
    image: "jupyter/scipy-notebook:latest",
    cpu: "1 CPU",
    memory: "2GB RAM",
    tags: ["Python", "NumPy", "Pandas", "Matplotlib"],
  },
  {
    id: "python-ml",
    name: "Machine Learning",
    description: "Python environment with machine learning frameworks",
    icon: <Brain className="h-6 w-6" />,
    image: "jupyter/tensorflow-notebook:latest",
    cpu: "2 CPU",
    memory: "4GB RAM",
    gpu: "1 GPU",
    tags: ["Python", "TensorFlow", "PyTorch", "Scikit-learn"],
  },
  {
    id: "r-stats",
    name: "R Statistical",
    description: "R environment for statistical computing and graphics",
    icon: <Database className="h-6 w-6" />,
    image: "jupyter/r-notebook:latest",
    cpu: "1 CPU",
    memory: "2GB RAM",
    tags: ["R", "Statistics", "ggplot2", "dplyr"],
  },
  {
    id: "spark",
    name: "Apache Spark",
    description: "Distributed computing with Apache Spark",
    icon: <Zap className="h-6 w-6" />,
    image: "jupyter/pyspark-notebook:latest",
    cpu: "4 CPU",
    memory: "8GB RAM",
    tags: ["Spark", "Python", "Scala", "Big Data"],
  },
];

export default function SpawnSelection() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Start New Server</h1>
        <p className="text-muted-foreground">
          Choose a preset or create a custom configuration
        </p>
      </div>

      <div className="grid gap-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">Quick Start Presets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presets.map((preset) => (
              <Card
                key={preset.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <Link href={`/hub/spawn/preset/${preset.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {preset.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {preset.name}
                          </CardTitle>
                          <CardDescription>
                            {preset.description}
                          </CardDescription>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{preset.cpu}</span>
                        <span>{preset.memory}</span>
                        {preset.gpu && <span>{preset.gpu}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {preset.tags.map((tag) => (
                          <Badge
                            key={tag}
                            className="text-xs"
                            variant="secondary"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Custom Configuration</h2>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Settings className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>Custom Server</CardTitle>
                    <CardDescription>
                      Configure your own server with custom image and resources
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/hub/spawn/options">
                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Create Custom Configuration
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
