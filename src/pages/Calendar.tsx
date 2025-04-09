
import React from 'react';
import Layout from '../components/layout/Layout';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { addDays } from "date-fns";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const upcomingEvents = [
    { id: 1, title: "Inventory Check", date: addDays(new Date(), 1), time: "10:00 AM" },
    { id: 2, title: "Staff Meeting", date: addDays(new Date(), 2), time: "2:30 PM" },
    { id: 3, title: "Supplier Meeting", date: addDays(new Date(), 4), time: "11:00 AM" },
    { id: 4, title: "Stock Reorder", date: addDays(new Date(), 5), time: "9:00 AM" },
  ];

  return (
    <Layout title="Calendar">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border shadow"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {event.date.toLocaleDateString()} at {event.time}
                    </p>
                  </div>
                  <div className="bg-pharma-primary/10 text-pharma-primary px-3 py-1 rounded-full text-sm font-medium">
                    {`In ${Math.floor((event.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Calendar;
