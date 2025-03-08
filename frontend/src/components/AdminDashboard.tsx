import { useState, useEffect } from "react";
import { Search, Calendar as CalendarIcon, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend } from "recharts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
];

export default function ParkingDashboard() {
  const [parkingData, setParkingData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCars, setFilteredCars] = useState([]);
  const [date, setDate] = useState<Date | undefined>();
  const [_thisWeekOccupancy, setThisWeekOccupancy] = useState(0);
  const [_todayOccupancy, setTodayOccupancy] = useState({
    occupied: 0,
    vacant: 0,
  });

  const [parkingDurationData, _setParkingDurationData] = useState([
    { name: " 10 AM", value: 20 },
    { name: " 11 AM", value: 35 },
    { name: " 12 PM", value: 25 },
    { name: " 1 PM", value: 40 },
    { name: " 2 PM", value: 30 },
  ]);
  
  
  const totalSpots = 500;

  useEffect(() => {
    async function fetchParkingData() {
      try {
        const response = await fetch("http://localhost:5000/api/parkingData");
        const data = await response.json();
        setParkingData(data);
        setFilteredCars(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch parking data:", error);
        setIsLoading(false);
      }
    }

    async function fetchOccupancyData() {
      try {
        const response = await fetch("http://localhost:5000/api/occupancy");
        const data = await response.json();
        setOccupancyData(data);

        // Calculate today's occupancy and this week's average occupancy
        calculateTodayOccupancy(data);
        calculateThisWeekOccupancy(data);
      } catch (error) {
        console.error("Failed to fetch occupancy data:", error);
      }
    }

    fetchParkingData();
    fetchOccupancyData();
  }, []);

  const handleSearch = () => {
    const filtered = parkingData.filter((car: any) =>
      car.noPlate.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCars(filtered);
  };

  const calculateTodayOccupancy = (data: any[]) => {
    // Get today's date (in MM/DD format)
    const today = new Date();
    const todayString = `${today.getMonth() + 1}/${today.getDate()}`;

    // Filter data for today
    const todayData = data.filter((entry: any) => entry.time === todayString);

    // Calculate total occupied for today
    const occupied = todayData.reduce((acc, entry) => acc + entry.value, 0);

    // Calculate vacant spaces
    const vacant = totalSpots - occupied;

    // Set the state with the calculated values
    setTodayOccupancy({ occupied, vacant });
  };

  const calculateThisWeekOccupancy = (data: any[]) => {
    // Get the current date
    const today = new Date();

    // Get the start of the week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday of this week

    // Get the end of the week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday of this week

    // Convert startOfWeek and endOfWeek to MM/DD format strings
    const startOfWeekString = `${
      startOfWeek.getMonth() + 1
    }/${startOfWeek.getDate()}`;
    const endOfWeekString = `${
      endOfWeek.getMonth() + 1
    }/${endOfWeek.getDate()}`;

    // Filter data for this week
    const weekData = data.filter((entry: any) => {
      const entryDate = entry.time; // Assuming entry.time is in MM/DD format
      return entryDate >= startOfWeekString && entryDate <= endOfWeekString;
    });

    // Calculate total occupied for the week
    const totalOccupied = weekData.reduce((acc, entry) => acc + entry.value, 0);

    // Calculate the average occupied for this week (avoid division by 0)
    const averageOccupied =
      weekData.length > 0 ? totalOccupied / weekData.length : 0;

    // Set the state with the calculated values for this week
    setThisWeekOccupancy(averageOccupied);
  };

  return (
    <div className="h-screen w-full overflow-auto p-4 bg-gray-100">
      <div className="mx-auto w-full p-4 space-y-4 bg-white border border-gray-300 rounded-lg shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                placeholder="Search by Number Plate"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-2 w-full"
              />
            </div>
          </div>
          <Button onClick={handleSearch}>Search</Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? date.toDateString() : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              className="[&_button:not(:disabled)]:text-[#ffffff]"
            />
          </PopoverContent>
        </Popover>
        <Button variant="outline">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Sort
        </Button>
      </div>

        <Card className="w-full">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>No Plate</TableHead>
                  <TableHead>Time-In</TableHead>
                  <TableHead>Time-Out</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>BlockID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7}>Loading...</TableCell>
                  </TableRow>
                ) : (
                  filteredCars.map((car: any, index) => (
                    <TableRow key={car._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{car.type}</TableCell>
                      <TableCell>{car.noPlate}</TableCell>
                      <TableCell>{car.timeIn}</TableCell>
                      <TableCell>{car.timeOut}</TableCell>
                      <TableCell>{car.duration}</TableCell>
                      <TableCell>{car.blockId}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Parking Space Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-red-500 text-2xl font-bold">
                    Occupied: 388
                  </span>
                </div>
                <div>
                  <span className="text-green-500 text-2xl font-bold">
                    Vacant: 112
                  </span>
                </div>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-red-500 h-2.5 rounded-full"
                  style={{
                    width: `${(388 / 500) * 100}%`,
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">No of Cars in Campus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">388</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Avg No of Cars This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  246.2
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-10">
              <CardTitle>Occupancy</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={occupancyData}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Bar dataKey="value" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-10">
              <CardTitle>Parking Duration Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={267}>
                <PieChart>
                  <Pie
                    data={parkingDurationData}
                    cx="40%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={130}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {parkingDurationData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <PieTooltip />
                  <PieLegend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    wrapperStyle={{
                      paddingLeft: 10,
                      paddingRight: 10,
                      right: 0
                    }}
                    payload={parkingDurationData.map((item, index) => ({
                      id: item.name,
                      type: 'circle',
                      value: item.name,
                      color: COLORS[index % COLORS.length]
                    }))}
                    content={({ payload = [] }) => (
                      <ul style={{ 
                        listStyle: 'none', 
                        padding: 0, 
                        paddingRight: 100,
                        marginTop: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '28px'
                      }}>
                        {payload.map((entry, index) => (
                          <li key={`legend-item-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                            <svg width="12" height="12" style={{ marginRight: 5 }}>
                              <circle cx="6" cy="6" r="6" fill={entry.color} />
                            </svg>
                            <span style={{ fontSize: '1rem' }}>{entry.value}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}