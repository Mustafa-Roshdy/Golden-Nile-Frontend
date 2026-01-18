import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { paymentApi, bookingApi } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

const PaymentPage = () => {
  const { pathname, state } = useLocation();
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fake booking state
  const isFakeBooking = state?.fromPackage || bookingId === "fake-booking";

  // Try to recover package data from localStorage if state is missing (for refresh)
  const [packageData, setPackageData] = useState<any>(() => {
    if (state?.packageData) return state.packageData;
    // Fallback: This would ideally require searching by ID if we had it in URL
    return null;
  });

  const existingBookingId = state?.existingBookingId;
  const fakeBookingId = existingBookingId || (isFakeBooking ? `PKG-${Math.floor(Math.random() * 10000)}` : null);

  const [bookingAmount, setBookingAmount] = useState<number>(0);
  const [loadingBooking, setLoadingBooking] = useState(true);

  const [method, setMethod] = useState<"visa" | "wallet">("visa");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  const effectiveBookingId = bookingId || fakeBookingId;

  // Initialize amount for fake booking
  useEffect(() => {
    if (isFakeBooking) {
      if (packageData) {
        // Parse price from package data
        const priceString = packageData.price?.replace(/[^0-9.]/g, '') || "0";
        setBookingAmount(parseFloat(priceString));
        setLoadingBooking(false);
      } else {
        // Fallback: If no package data (e.g. refresh), just stop loading to avoid stuck state
        setLoadingBooking(false);
      }
    }
  }, [isFakeBooking, packageData]);

  useEffect(() => {
    // Skip if it's a fake booking
    if (isFakeBooking) return;

    
    if (!bookingId || bookingId === "undefined") {
      console.error("Invalid booking ID:", bookingId);
      return;
    }

    const fetchBooking = async () => {
      try {
        const response = await bookingApi.getBooking(bookingId);
        if (response.booking) {
          setBookingAmount((response.booking as any).totalPrice || 0);
        } else if ((response as any).data) {
          setBookingAmount((response as any).data.totalPrice || 0);
        }
      } catch (error) {
        console.error("Failed to load booking", error);
        toast({ title: "Error", description: "Failed to load booking details", variant: "destructive" });
      } finally {
        setLoadingBooking(false);
      }
    };
    fetchBooking();
  }, [bookingId, isFakeBooking]);

  const handlePay = async (simulateStatus: "paid" | "pending" | "failed") => {
    if (!effectiveBookingId) {
      toast({
        title: "Missing booking",
        description: "No booking selected for payment.",
        variant: "destructive",
      });
      return;
    }

    setProcessingStatus(simulateStatus);

    // Handle Fake Booking Persistence vs API Booking
    if (isFakeBooking) {
      const existing = localStorage.getItem("fakeBookings");
      let bookings = existing ? JSON.parse(existing) : [];
      const isLocalFake = existingBookingId && bookings.some((b: any) => b._id === existingBookingId);

      if (isLocalFake || !existingBookingId) {
        setTimeout(() => {
          setProcessingStatus(null);

          if (simulateStatus === "failed") {
            toast({
              title: "Payment Failed",
              description: "The payment transaction failed (Simulated).",
              variant: "destructive"
            });
            return;
          }

          if (existingBookingId) {
            // Update existing local booking
            bookings = bookings.map((b: any) =>
              b._id === existingBookingId ? { ...b, paymentStatus: simulateStatus, status: simulateStatus === 'paid' ? 'confirmed' : 'pending' } : b
            );
          } else {
            // Create new local booking
            const newBooking = {
              _id: effectiveBookingId,
              place: {
                name: packageData.title,
                type: "Package",
                address: packageData.destination
              },
              destination: packageData.destination,
              totalPrice: bookingAmount,
              status: simulateStatus === 'paid' ? 'confirmed' : 'pending',
              paymentStatus: simulateStatus,
              arrivalDate: new Date().toISOString(),
              leavingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              bookingTime: "12:00",
              bookingType: "fake-package",
              packageDetails: packageData,
              createdAt: new Date().toISOString()
            };
            bookings.push(newBooking);
          }

          localStorage.setItem("fakeBookings", JSON.stringify(bookings));

          // Dispatch event to notify Profile page
          window.dispatchEvent(new Event("bookingCreated"));

          toast({
            title: simulateStatus === "paid" ? "Payment Successful" : "Payment Pending",
            description: "Your package has been booked successfully!",
            className: simulateStatus === "paid" ? "bg-green-500 text-white" : ""
          });

          navigate("/profile");

        }, 1500);
        return;
      }
      // If existingBookingId is NOT local, it's an API booking - fall through
    }

    try {
      const idToPay = existingBookingId || bookingId;
      const response = await paymentApi.fakePay({
        bookingId: idToPay,
        method,
        amount: bookingAmount,
        platform: "web",
        cardNumber,
        expiry,
        simulateStatus
      });

      const result = (response as any).data || response;

      if (result.paymentStatus === "paid" || result.bookingStatus === "confirmed") {
        toast({
          title: "Payment Successful",
          description: "Your booking is confirmed.",
          className: "bg-green-500 text-white"
        });

        // Dispatch event to notify Profile page before navigating
        window.dispatchEvent(new Event("bookingCreated"));

        navigate("/profile");
      } else if (result.paymentStatus === "pending") {
        toast({
          title: "Payment Pending",
          description: "Your payment is being processed.",
        });
        window.dispatchEvent(new Event("bookingCreated"));
        navigate("/profile");
      } else {
        toast({
          title: "Payment Failed",
          description: "The payment transaction failed.",
          variant: "destructive"
        });
      }

    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Unable to process fake payment.",
        variant: "destructive",
      });
    } finally {
      setProcessingStatus(null);
    }
  };

  if (!effectiveBookingId) return <div className="p-10">Invalid Booking ID</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Secure Payment</h1>
            <p className="text-muted-foreground">
              Complete your reservation for {isFakeBooking ? packageData.title : `Booking #${bookingId?.slice(-6)}`}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                defaultValue={method}
                onValueChange={(v) => setMethod(v as "visa" | "wallet")}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="visa"
                  className={`border rounded-xl p-4 cursor-pointer flex items-center gap-3 ${method === "visa" ? "border-primary" : "border-border"
                    }`}
                >
                  <RadioGroupItem value="visa" id="visa" className="mt-1" />
                  <div>
                    <div className="font-semibold">Credit Card</div>
                    <p className="text-sm text-muted-foreground">
                      Visa, Mastercard, etc.
                    </p>
                  </div>
                </Label>

                <Label
                  htmlFor="wallet"
                  className={`border rounded-xl p-4 cursor-pointer flex items-center gap-3 ${method === "wallet" ? "border-primary" : "border-border"
                    }`}
                >
                  <RadioGroupItem value="wallet" id="wallet" className="mt-1" />
                  <div>
                    <div className="font-semibold">Digital Wallet</div>
                    <p className="text-sm text-muted-foreground">
                      Pay with your balance.
                    </p>
                  </div>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>

          {method === "visa" && (
            <Card>
              <CardHeader>
                <CardTitle>Card Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      type="password"
                      onChange={(e) => setCvv(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-2 border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  {loadingBooking ? (
                    <div className="h-8 w-24 bg-muted animate-pulse rounded mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-primary">${bookingAmount.toFixed(2)}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full text-lg h-12"
                  onClick={() => handlePay("paid")}
                  disabled={!!processingStatus || loadingBooking}
                >
                  {processingStatus === "paid" ? "Processing..." : "Confirm Payment"}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Demo Simulation Options
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handlePay("pending")}
                    disabled={!!processingStatus || loadingBooking}
                  >
                    {processingStatus === "pending" ? "Simulating..." : "Simulate Pending"}
                  </Button>
                  <Button
                    variant="destructive"
                    className="bg-red-100 text-red-900 hover:bg-red-200"
                    onClick={() => handlePay("failed")}
                    disabled={!!processingStatus || loadingBooking}
                  >
                    {processingStatus === "failed" ? "Simulating..." : "Simulate Failure"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPage;
