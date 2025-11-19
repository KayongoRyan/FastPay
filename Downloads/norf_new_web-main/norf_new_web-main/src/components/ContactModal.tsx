import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactModal = ({ open, onOpenChange }: ContactModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-[500px] bg-brand-light/95 backdrop-blur-sm border-brand-gray/20 p-8"
      >
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 pb-8">
          <SheetTitle className="text-4xl font-display text-brand-dark tracking-wide">
            Contact
          </SheetTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0 hover:bg-transparent"
          >
            <X className="h-6 w-6 text-brand-dark" />
          </Button>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-lg font-display text-brand-dark">
              Name
            </Label>
            <Input
              id="name"
              placeholder="NAME"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-brand-light/50 border-brand-gray/30 text-brand-dark placeholder:text-brand-gray font-display tracking-wider focus:border-brand-dark"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-lg font-display text-brand-dark">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="E-MAIL"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-brand-light/50 border-brand-gray/30 text-brand-dark placeholder:text-brand-gray font-display tracking-wider focus:border-brand-dark"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-lg font-display text-brand-dark">
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="MESSAGE"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="bg-brand-light/50 border-brand-gray/30 text-brand-dark placeholder:text-brand-gray font-display tracking-wider focus:border-brand-dark min-h-[120px] resize-none"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-brand-dark hover:bg-brand-dark/90 text-brand-light font-display text-lg tracking-widest py-6 rounded-lg transition-smooth"
          >
            SEND
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};