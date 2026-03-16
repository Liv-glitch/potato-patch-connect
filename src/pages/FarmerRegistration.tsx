import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { KENYA_COUNTIES, POTATO_VARIETIES } from "@/data/kenyaLocations";

const FarmerRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    county: "",
    ward: "",
    specific_location: "",
    potato_variety: "",
    acreage_planted: "",
    planting_date: "",
  });

  const wards = form.county ? KENYA_COUNTIES[form.county] || [] : [];
  const acreage = parseFloat(form.acreage_planted) || 0;
  const registrationFee = acreage * 2000;

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "county") setForm((prev) => ({ ...prev, county: value, ward: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.phone_number || !form.county || !form.ward || !form.specific_location || !form.potato_variety || !form.acreage_planted || !form.planting_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (showPayment) {
      setLoading(true);
      const { error } = await supabase.from("farmers").insert({
        full_name: form.full_name,
        phone_number: form.phone_number,
        email: form.email || null,
        county: form.county,
        ward: form.ward,
        specific_location: form.specific_location,
        potato_variety: form.potato_variety,
        acreage_planted: acreage,
        planting_date: form.planting_date,
      });
      setLoading(false);

      if (error) {
        toast.error("Registration failed. Please try again.");
        console.error(error);
        return;
      }
      toast.success("Registration submitted! Your listing is pending approval.");
      navigate("/");
    } else {
      setShowPayment(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-2xl py-12">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Register as a Farmer</CardTitle>
            <CardDescription>Fill in your farm details to list on the marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input value={form.full_name} onChange={(e) => handleChange("full_name", e.target.value)} placeholder="John Kamau" required />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <Input value={form.phone_number} onChange={(e) => handleChange("phone_number", e.target.value)} placeholder="0712345678" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email (Optional)</Label>
                <Input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="farmer@email.com" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>County *</Label>
                  <Select value={form.county} onValueChange={(v) => handleChange("county", v)}>
                    <SelectTrigger><SelectValue placeholder="Select County" /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(KENYA_COUNTIES).map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ward *</Label>
                  <Select value={form.ward} onValueChange={(v) => handleChange("ward", v)} disabled={!form.county}>
                    <SelectTrigger><SelectValue placeholder="Select Ward" /></SelectTrigger>
                    <SelectContent>
                      {wards.map((w) => (
                        <SelectItem key={w} value={w}>{w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Specific Location / Village *</Label>
                <Input value={form.specific_location} onChange={(e) => handleChange("specific_location", e.target.value)} placeholder="e.g., Kinamba Village" required />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Potato Variety *</Label>
                  <Select value={form.potato_variety} onValueChange={(v) => handleChange("potato_variety", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {POTATO_VARIETIES.map((v) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Acreage Planted *</Label>
                  <Input type="number" min="0.5" step="0.5" value={form.acreage_planted} onChange={(e) => handleChange("acreage_planted", e.target.value)} placeholder="e.g., 5" required />
                </div>
                <div className="space-y-2">
                  <Label>Planting Date *</Label>
                  <Input type="date" value={form.planting_date} onChange={(e) => handleChange("planting_date", e.target.value)} required />
                </div>
              </div>

              {acreage > 0 && (
                <div className="rounded-lg border bg-secondary/50 p-4">
                  <p className="text-sm text-muted-foreground">Registration Fee:</p>
                  <p className="font-display text-2xl font-bold text-primary">
                    Ksh {registrationFee.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{acreage} acre(s) × Ksh 2,000</p>
                </div>
              )}

              {showPayment && (
                <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-6 space-y-3">
                  <h3 className="font-display text-lg font-semibold text-foreground">Payment Instructions</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Paybill:</span> 542542</p>
                    <p><span className="font-medium">Account Number:</span> 324567</p>
                    <p><span className="font-medium">Amount:</span> Ksh {registrationFee.toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Complete the M-Pesa payment, then click "Submit Registration" below.
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Submitting..." : showPayment ? "Submit Registration" : "Proceed"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FarmerRegistration;
