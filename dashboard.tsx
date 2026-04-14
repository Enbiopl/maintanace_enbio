import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Network, Wifi, Activity, GalleryHorizontalEnd, Gauge, ChevronDown } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-[#181E25] border-[#252D37]">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="h-5 w-5 rounded-full border border-[#495563] flex-shrink-0 mt-1"></div>
                  <div className="space-y-4 w-full">
                    <h2 className="text-[#E1E5EA] text-lg font-medium">System Status</h2>
                    <div className="space-y-2 text-sm text-[#FAFBFB]">
                      <div className="flex items-center justify-between">
                        <span>Status</span>
                        <span>Connected</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Connectivity</span>
                        <span>Wi-Fi</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Latency</span>
                        <span>High</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Throughput</span>
                        <span>Reduced</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Packet Loss</span>
                        <span>Increased</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#181E25] border-[#252D37]">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="h-5 w-5 rounded-full border border-[#495563] flex-shrink-0 mt-1"></div>
                  <div className="space-y-4 w-full">
                    <h2 className="text-[#E1E5EA] text-lg font-medium">Network Monitoring</h2>
                    <div className="space-y-3 text-sm text-[#C3CBD5]">
                      <div className="flex items-center space-x-3">
                        <Network className="h-5 w-5 text-[#495563]" />
                        <span>Status: Connected</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Wifi className="h-5 w-5 text-[#495563]" />
                        <span>Connectivity: Wi-Fi</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Gauge className="h-5 w-5 text-[#495563]" />
                        <span>Latency: High</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Activity className="h-5 w-5 text-[#495563]" />
                        <span>Throughput: Reduced</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <GalleryHorizontalEnd className="h-5 w-5 text-[#495563]" />
                        <span>Packet Loss: Increased</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle and Right Columns */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-[#181E25] border-[#252D37]">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[#E1E5EA] text-lg font-medium">Overview</h2>
                  <Badge className="bg-[#0C1217] text-[#E1E5EA] hover:bg-[#181E25]">
                    <span>View Details</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#C3CBD5]">Uptime</span>
                      <span className="text-[#FAFBFB]">99.8%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#C3CBD5]">Response Time</span>
                      <span className="text-[#FAFBFB]">245ms</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#C3CBD5]">Error Rate</span>
                      <span className="text-[#FAFBFB]">0.02%</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#C3CBD5]">CPU Usage</span>
                      <span className="text-[#FAFBFB]">42%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#C3CBD5]">Memory Usage</span>
                      <span className="text-[#FAFBFB]">3.2GB / 8GB</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#C3CBD5]">Disk Space</span>
                      <span className="text-[#FAFBFB]">128GB / 512GB</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#181E25] border-[#252D37]">
                <CardContent className="p-6">
                  <h2 className="text-[#E1E5EA] text-lg font-medium mb-4">Recent Alerts</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <p className="text-[#FAFBFB]">System update completed</p>
                        <p className="text-[#495563] text-xs">Today, 8:06 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        <Activity className="h-4 w-4 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-[#FAFBFB]">High CPU usage detected</p>
                        <p className="text-[#495563] text-xs">Today, 7:45 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        <Network className="h-4 w-4 text-red-500" />
                      </div>
                      <div>
                        <p className="text-[#FAFBFB]">Network connectivity issues</p>
                        <p className="text-[#495563] text-xs">Today, 6:30 PM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#181E25] border-[#252D37]">
                <CardContent className="p-6">
                  <h2 className="text-[#E1E5EA] text-lg font-medium mb-4">System Health</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#C3CBD5]">CPU</span>
                        <span className="text-[#FAFBFB]">42%</span>
                      </div>
                      <div className="w-full bg-[#0C1217] rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "42%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#C3CBD5]">Memory</span>
                        <span className="text-[#FAFBFB]">40%</span>
                      </div>
                      <div className="w-full bg-[#0C1217] rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "40%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#C3CBD5]">Disk</span>
                        <span className="text-[#FAFBFB]">25%</span>
                      </div>
                      <div className="w-full bg-[#0C1217] rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: "25%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#C3CBD5]">Network</span>
                        <span className="text-[#FAFBFB]">68%</span>
                      </div>
                      <div className="w-full bg-[#0C1217] rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "68%" }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
