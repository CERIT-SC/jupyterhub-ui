"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SidebarNavigation } from "@/components/layout/sidebar-navigation";
import { NotebookCard } from "@/components/hub/notebook-card";
import { NotebooksGrid } from "@/components/hub/notebooks-grid";
import { ServerNameInputBare } from "@/components/hub/ServerNameInputBare";
import {
  SelectionCard,
  SelectionCardGrid,
} from "@/components/hub/settings/cardSelection";
import { mockUIShowcaseData } from "@/mocks/ui-showcase/showcase-data";
import { ServerStatus } from "@/services/client/jupyterHub";
import {
  mockServers,
  mockServersRecords,
} from "@/mocks/ui-showcase/notebook-mocks";

export default function UIShowcasePage() {
  const [serverName, setServerName] = useState("");
  const [switchStates, setSwitchStates] = useState({
    notifications: true,
    darkMode: false,
    autoSave: true,
  });

  // Ensure mockServers is treated as an array
  const serversArray = mockServers;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">UI Component Showcase</h1>
        <p className="text-muted-foreground">
          A comprehensive display of all UI components in the JupyterHub
          interface
        </p>
      </div>

      {/* Basic UI Components */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons & Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button>Default Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Badges & Indicators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Error</Badge>
            <Badge variant="outline">Outline</Badge>
            {mockUIShowcaseData.statuses.map((status, index) => (
              <Badge key={index} variant={status.variant as any}>
                {status.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress & Loading</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Progress Bar</Label>
            <Progress className="w-full" value={33} />
            <Progress className="w-full" value={66} />
            <Progress className="w-full" value={100} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tooltips</CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="flex gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover me</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is a tooltip</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button>Another tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>More information here</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Form Components */}
      <Card>
        <CardHeader>
          <CardTitle>Form Inputs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Enter your email" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder="Enter password"
                type="password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="select">Select Option</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Option 1</SelectItem>
                  <SelectItem value="option2">Option 2</SelectItem>
                  <SelectItem value="option3">Option 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="disabled">Disabled Input</Label>
              <Input disabled id="disabled" placeholder="Disabled input" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="textarea">Textarea</Label>
            <Textarea id="textarea" placeholder="Enter your message here..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Switches & Toggles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {Object.entries(switchStates).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Switch
                  checked={value}
                  id={key}
                  onCheckedChange={(checked) =>
                    setSwitchStates((prev) => ({ ...prev, [key]: checked }))
                  }
                />
                <Label className="capitalize" htmlFor={key}>
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Layout Components */}
      <Card>
        <CardHeader>
          <CardTitle>Card Layouts</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockUIShowcaseData.cardExamples.map((card, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{card.content}</p>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Separators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>Section 1</div>
          <Separator />
          <div>Section 2</div>
          <Separator />
          <div>Section 3</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sidebar Navigation (Preview)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 max-w-xs">
            <SidebarNavigation />
          </div>
        </CardContent>
      </Card>

      {/* Notebook Components */}
      <Card>
        <CardHeader>
          <CardTitle>Notebook Cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serversArray
              .slice(0, 3)
              .map((server: ServerStatus, index: number) => (
                <NotebookCard
                  key={`notebook-${index}`}
                  name={server.name}
                  server={server}
                  onRemove={() => console.log("Remove notebook", server.name)}
                  onStop={() => console.log("Stop notebook", server.name)}
                />
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notebooks Grid</CardTitle>
        </CardHeader>
        <CardContent>
          <NotebooksGrid
            notebooks={mockServersRecords}
            onRemove={(id: string) => console.log("Remove notebook", id)}
            onStart={(id: string) => console.log("Start notebook", id)}
            onStop={(id: string) => console.log("Stop notebook", id)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Selection Card Grid</CardTitle>
        </CardHeader>
        <CardContent>
          <SelectionCardGrid
            cards={[
              <SelectionCard key="card1" selected={false}>
                <div className="p-6">
                  <div className="text-lg font-semibold mb-2">Option 1</div>
                  <div className="text-sm text-muted-foreground mb-4">
                    Standard configuration with 2GB RAM and 1 CPU core
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Resources:</span>
                    <span>2GB RAM, 1 CPU</span>
                  </div>
                </div>
              </SelectionCard>,
              <SelectionCard key="card2" selected={true}>
                <div className="p-6">
                  <div className="text-lg font-semibold mb-2">Option 2</div>
                  <div className="text-sm text-muted-foreground mb-4">
                    Enhanced configuration with 4GB RAM and 2 CPU cores
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Resources:</span>
                    <span>4GB RAM, 2 CPU</span>
                  </div>
                </div>
              </SelectionCard>,
              <SelectionCard key="card3" selected={false}>
                <div className="p-6">
                  <div className="text-lg font-semibold mb-2">Option 3</div>
                  <div className="text-sm text-muted-foreground mb-4">
                    High-performance configuration with 8GB RAM and 4 CPU cores
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Resources:</span>
                    <span>8GB RAM, 4 CPU</span>
                  </div>
                </div>
              </SelectionCard>,
              <SelectionCard key="card4" selected={false}>
                <div className="p-6">
                  <div className="text-lg font-semibold mb-2">Option 4</div>
                  <div className="text-sm text-muted-foreground mb-4">
                    GPU-enabled configuration with 16GB RAM and GPU support
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Resources:</span>
                    <span>16GB RAM, GPU</span>
                  </div>
                </div>
              </SelectionCard>,
              <SelectionCard key="card5" selected={false}>
                <div className="p-6">
                  <div className="text-lg font-semibold mb-2">Option 5</div>
                  <div className="text-sm text-muted-foreground mb-4">
                    Custom configuration for specialized workloads
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Resources:</span>
                    <span>Custom</span>
                  </div>
                </div>
              </SelectionCard>,
            ]}
            customCard={
              <SelectionCard key="custom" selected={false}>
                <div className="p-6 border-2 border-dashed border-infra-primary/50">
                  <div className="text-lg font-semibold mb-2 text-infra-primary">
                    Custom Option
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    Create your own custom configuration
                  </div>
                  <div className="flex items-center justify-center">
                    <Button size="sm" variant="outline">
                      Configure
                    </Button>
                  </div>
                </div>
              </SelectionCard>
            }
            isCardSelected={false}
          />
        </CardContent>
      </Card>

      {/* Hub Components */}
      <Card>
        <CardHeader>
          <CardTitle>Server Name Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Server Name Input (Bare)</Label>
            <ServerNameInputBare
              value={serverName}
              onNameChangeAction={setServerName}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
