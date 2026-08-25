import { Mail, Phone, MapPin, CalendarHeart, Send } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";

const ContactPage = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Contact Our Event Team
        </h1>

        <p className="mt-4 text-muted-foreground">
          Planning a wedding, corporate event, or special celebration? Our
          expert team is ready to make your event unforgettable.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contact Info */}
        <div className="space-y-5">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Phone className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Call Us</p>

                <p className="font-semibold">+880 1700 000000</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Mail className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Email</p>

                <p className="font-semibold">hello@eventpro.com</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <MapPin className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Location</p>

                <p className="font-semibold">Dhaka, Bangladesh</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <CalendarHeart className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Events</p>

                <p className="font-semibold">Wedding • Corporate • Birthday</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Send Us A Message</CardTitle>
          </CardHeader>

          <CardContent>
            <form className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>

                  <Input placeholder="Your name" />
                </div>

                <div className="space-y-2">
                  <Label>Email Address</Label>

                  <Input type="email" placeholder="example@gmail.com" />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Phone Number</Label>

                  <Input placeholder="+880 1XXXXXXXXX" />
                </div>

                <div className="space-y-2">
                  <Label>Event Type</Label>

                  <Input placeholder="Wedding / Corporate" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Message</Label>

                <Textarea rows={6} placeholder="Tell us about your event..." />
              </div>

              <Button className="w-full md:w-auto">
                Send Message
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ContactPage;
