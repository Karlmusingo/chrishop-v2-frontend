import Button from "./custom/Button";

export function Hero() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between h-16 px-8 border-b bg-white">
        <div className="flex items-center">
          <span className="text-lg font-bold">Protek</span>
        </div>
        <nav className="flex items-center space-x-4">
          <a href="#" className="text-sm font-medium">
            Home
          </a>
          <a href="#" className="text-sm font-medium">
            Features
          </a>
          <a href="#" className="text-sm font-medium">
            Pricing
          </a>
          <a href="#" className="text-sm font-medium">
            Contact
          </a>
        </nav>
        <div className="flex items-center space-x-2">
          <Button variant="default">Get Started</Button>
          <Button variant="outline">Sign In</Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4 bg-gray-50">
        <h1 className="text-4xl font-bold text-center">
          Enhance Security with Smart Watches for Guards
        </h1>
        <p className="mt-4 text-center text-muted-foreground">
          Our smart watches provide real-time tracking and monitoring for
          security guards, ensuring optimal safety and efficiency.
        </p>
        <div className="mt-6 flex space-x-4">
          <Button variant="default">Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </main>
      <div className="flex-1 bg-gray-200" />
    </div>
  );
}
