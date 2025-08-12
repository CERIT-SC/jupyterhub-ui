"use client";

import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";

export default function DevPage() {
  // Get all development items including those in non-development sections
  const allDevLinks = siteConfig.navigation.flatMap((section) =>
    section.items
      .filter((item) => item.development && !item.disabled)
      .map((item) => ({
        ...item,
        section: section.section,
      })),
  );

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Development Tools</h1>
        <p className="text-muted-foreground">
          Development and testing utilities for {siteConfig.name}
        </p>
      </div>

      {/* Development Links Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Development Pages
            <Badge variant="secondary">{allDevLinks.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allDevLinks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allDevLinks.map((item, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-primary">
                        {item.icon &&
                        typeof item.icon === "object" &&
                        "type" in item.icon
                          ? item.icon
                          : null}
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.section}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={item.path}>
                        <Button className="flex-1" size="sm">
                          Open
                        </Button>
                      </Link>

                      {item.external && (
                        <Badge className="text-xs" variant="outline">
                          External
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No development pages configured
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Navigation Sections */}
      <Card>
        <CardHeader>
          <CardTitle>All Navigation Sections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {siteConfig.navigation.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold">{section.section}</h3>
                {section.development && (
                  <Badge variant="secondary">Development</Badge>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {section.items.map((item, itemIndex) => (
                  <Card
                    key={itemIndex}
                    className={`hover:shadow-sm transition-shadow ${item.disabled ? "opacity-50" : ""}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-primary text-sm">
                          {item.icon &&
                          typeof item.icon === "object" &&
                          "type" in item.icon
                            ? item.icon
                            : null}
                        </div>
                        <span className="font-medium text-sm">{item.name}</span>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {item.development && (
                          <Badge className="text-xs" variant="outline">
                            Dev
                          </Badge>
                        )}
                        {item.disabled && (
                          <Badge className="text-xs" variant="destructive">
                            Disabled
                          </Badge>
                        )}
                        {item.external && (
                          <Badge className="text-xs" variant="secondary">
                            External
                          </Badge>
                        )}
                      </div>
                      {!item.disabled && (
                        <Button
                          asChild
                          className="w-full mt-2"
                          size="sm"
                          variant="outline"
                        >
                          <Link href={item.path}>Visit</Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Development Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/dev/ui">UI Components</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/hub/dashboard">Hub Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/hub/notebooks">Notebooks</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/hub/spawn">Create Notebook</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Site Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Site Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Site Name:</strong> {siteConfig.name}
            </div>
            <div>
              <strong>Description:</strong> {siteConfig.description}
            </div>
            <div>
              <strong>Navigation Sections:</strong>{" "}
              {siteConfig.navigation.length}
            </div>
            <div>
              <strong>Total Navigation Items:</strong>{" "}
              {siteConfig.navigation.reduce(
                (total, section) => total + section.items.length,
                0,
              )}
            </div>
            <div>
              <strong>Development Items:</strong> {allDevLinks.length}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
