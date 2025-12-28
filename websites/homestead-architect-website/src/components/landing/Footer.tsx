import { Sprout } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-card border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Homestead Architect</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Homestead Architect. Building sustainable futures.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;