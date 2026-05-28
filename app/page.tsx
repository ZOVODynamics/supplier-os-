import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Sparkles,
  FileText,
  Users,
  BarChart3,
  Shield,
  Zap,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">Z</span>
            </div>
            <span className="text-xl font-bold text-foreground">ZOVO</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              AI-Powered Supplier Matching
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance">
              The B2B Supplier{" "}
              <span className="text-primary">Execution Platform</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Post supply requests, get matched with verified suppliers through AI,
              and track execution from start to completion. Streamline your supply
              chain operations.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors gap-2"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-background px-8 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Sign In to Dashboard
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Demo: company@demo.com / password123
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Verified Suppliers" },
              { value: "10K+", label: "Requests Fulfilled" },
              { value: "98%", label: "Match Accuracy" },
              { value: "24h", label: "Avg. Response Time" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">
              Everything You Need to Manage Suppliers
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              A complete platform for posting requests, finding suppliers, and
              tracking execution.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: "Request Management",
                description:
                  "Create and manage supply requests with detailed specifications, budgets, and deadlines.",
              },
              {
                icon: Sparkles,
                title: "AI-Powered Matching",
                description:
                  "Our AI analyzes your requirements and matches you with the most suitable suppliers.",
              },
              {
                icon: Users,
                title: "Supplier Marketplace",
                description:
                  "Browse verified suppliers, view ratings, and check their track record.",
              },
              {
                icon: BarChart3,
                title: "Status Tracking",
                description:
                  "Track every request from posting to completion with real-time status updates.",
              },
              {
                icon: Shield,
                title: "Verified Partners",
                description:
                  "All suppliers go through our verification process to ensure quality and reliability.",
              },
              {
                icon: Zap,
                title: "Fast Execution",
                description:
                  "Streamlined workflows help you move from request to fulfillment faster.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our simple four-step process.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Post Request",
                description: "Describe your supply needs with specifications and budget.",
              },
              {
                step: "02",
                title: "AI Matching",
                description: "Our AI analyzes and matches you with suitable suppliers.",
              },
              {
                step: "03",
                title: "Review & Accept",
                description: "Review suggested suppliers and accept the best match.",
              },
              {
                step: "04",
                title: "Track & Complete",
                description: "Track progress and mark complete when fulfilled.",
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-bold text-primary/20">{item.step}</div>
                <h3 className="mt-2 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-border -translate-x-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-primary p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground">
              Ready to Transform Your Supply Chain?
            </h2>
            <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
              Join hundreds of companies already using ZOVO Supplier OS to
              streamline their operations.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-background px-8 text-sm font-medium text-foreground hover:bg-muted transition-colors gap-2"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">Z</span>
              </div>
              <span className="text-lg font-semibold text-foreground">
                ZOVO Supplier OS
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ZOVO. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
