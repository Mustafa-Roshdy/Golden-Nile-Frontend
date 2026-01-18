import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Package } from "./PackageCard";
import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";

interface FakePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    pkg: Package;
}

/**
 * FakePaymentModal: A reusable modal to simulate a payment process for a package booking.
 */
const FakePaymentModal: React.FC<FakePaymentModalProps> = ({ isOpen, onClose, pkg }) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Handle the fake payment simulation
    const handlePayment = async () => {
        setIsProcessing(true);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Create a fake booking in localStorage to show up in the profile
        const fakeBooking = {
            _id: `FAKE-${Math.floor(Math.random() * 100000)}`,
            place: {
                name: pkg.title,
                address: pkg.destination,
                type: "Package"
            },
            status: "confirmed",
            paymentStatus: "paid",
            totalPrice: pkg.price ? parseFloat(pkg.price.replace(/[^0-9.]/g, '')) : 0,
            createdAt: new Date().toISOString(),
            arrivalDate: new Date().toISOString(),
            bookingType: "package"
        };

        const existingBookings = JSON.parse(localStorage.getItem("fakeBookings") || "[]");
        localStorage.setItem("fakeBookings", JSON.stringify([fakeBooking, ...existingBookings]));

        // Notify other components (like Profile) that a new booking exists
        window.dispatchEvent(new Event("bookingCreated"));

        setIsProcessing(false);
        setIsSuccess(true);

        toast({
            title: "Payment Successful!",
            description: `You have successfully booked the ${pkg.title} package.`,
        });

        // Automatically navigate to "My Booking" (Profile page) after a short delay
        setTimeout(() => {
            onClose();
            navigate("/profile", { state: { activeTab: "bookings" } });
        }, 1500);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                {!isSuccess ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" />
                                Book Now: {pkg.title}
                            </DialogTitle>
                            <DialogDescription>
                                Complete your payment for the {pkg.duration} trip to {pkg.destination}.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                <span className="text-sm font-medium">Total Amount</span>
                                <span className="text-lg font-bold text-primary">{pkg.price || "Free"}</span>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cardNumber">Card Number</Label>
                                <Input id="cardNumber" placeholder="0000 0000 0000 0000" disabled={isProcessing} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expiry">Expiry</Label>
                                    <Input id="expiry" placeholder="MM/YY" disabled={isProcessing} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cvv">CVV</Label>
                                    <Input id="cvv" placeholder="123" type="password" disabled={isProcessing} />
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                                Cancel
                            </Button>
                            <Button onClick={handlePayment} disabled={isProcessing} className="min-w-[120px]">
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing
                                    </>
                                ) : (
                                    "Confirm Payment"
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-foreground">Payment Received!</h3>
                            <p className="text-muted-foreground">Redirecting to your bookings...</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default FakePaymentModal;
