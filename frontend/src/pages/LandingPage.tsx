import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Leaf,
  Droplets,
  Sun,
  Brain,
  Bell,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import landingHero from "@/assets/landing-hero.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const features = [
  {
    icon: Leaf,
    title: "Plant Library",
    description:
      "Browse your personalised garden with detailed care guides for every plant.",
  },
  {
    icon: Brain,
    title: "AI Plant Doctor",
    description:
      "Chat with our AI assistant for instant diagnosis and care advice.",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Never miss a watering or feeding schedule again.",
  },
  {
    icon: Droplets,
    title: "Care Tracking",
    description:
      "Log watering, feeding, and repotting to keep your plants thriving.",
  },
  {
    icon: Sun,
    title: "Health Monitoring",
    description:
      "Track each plant's health status at a glance with visual indicators.",
  },
  {
    icon: BookOpen,
    title: "Garden Booklet",
    description:
      "A beautiful digital booklet of your entire garden collection.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-semibold text-foreground">
              Shagari
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild className="pill-button text-sm px-4 py-2">
              <Link to="/login?view=signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" animate="visible" className="space-y-6">
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                AI-powered plant care
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-display text-4xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight"
            >
              Your garden,
              <br />
              <span className="text-primary">beautifully managed.</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg text-muted-foreground max-w-md leading-relaxed"
            >
              Shagari helps you track, nurture, and understand
              every plant in your collection — with smart reminders and
              AI-powered advice.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row gap-3 pt-2"
            >
              <Button size="lg" asChild className="pill-button gap-2 text-base w-full sm:w-auto">
                <Link to="/login?view=signup">
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="pill-button text-base w-full sm:w-auto"
              >
                <Link to="/login">Sign in</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden garden-shadow-lg aspect-[4/3]">
              <img
                src={landingHero}
                alt="Beautiful collection of houseplants and succulents"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-4 garden-shadow flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  12 plants thriving
                </p>
                <p className="text-xs text-muted-foreground">
                  All healthy today
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28 bg-secondary/40">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="font-display text-3xl md:text-4xl font-bold text-foreground"
            >
              Everything your garden needs
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mt-4 text-muted-foreground text-lg max-w-lg mx-auto"
            >
              From daily care reminders to AI diagnostics, Shagari Garden
              Management is your personal plant companion.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={i}
                className="card-botanical p-6 hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto px-6 text-center"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="font-display text-3xl md:text-5xl font-bold text-foreground"
          >
            Ready to grow?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="mt-4 text-lg text-muted-foreground max-w-md mx-auto"
          >
            Join Shagari and give your plants the care they
            deserve.
          </motion.p>
          <motion.div variants={fadeUp} custom={2} className="mt-8">
            <Button
              size="lg"
              asChild
              className="pill-button gap-2 text-base px-8"
            >
              <Link to="/login?view=signup">
                Create your garden
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Leaf className="h-4 w-4" />
            <span>© 2026 Shagari</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Made with care for plant lovers.
          </p>
        </div>
      </footer>
    </div>
  );
}
