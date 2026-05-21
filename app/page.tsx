import { Header } from "@/components/header";
import { cn } from "@/lib/utils";
import { FullWidthDivider } from "@/components/ui/landing/full-width-divider";
import { ArrowRightIcon, PhoneCallIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DecorIcon } from "@/components/ui/landing/decor-icon";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { GridFiller } from "@/components/ui/landing/grid-filler";
import { GridPattern } from "@/components/ui/landing/grid-pattern";
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { FeatureSection } from "@/components/feature-section";
import TextType from "@/components/TextType";

export function HeroSection() {
  return (
    <section className="mx-auto w-full max-w-5xl overflow-hidden pt-16">
      {/* Shades */}
      <div
        aria-hidden="true"
        className="absolute inset-0 size-full overflow-hidden"
      >
        <div
          className={cn(
            "absolute inset-0 isolate -z-10",
            "bg-[radial-gradient(20%_80%_at_20%_0%,--theme(--color-foreground/.1),transparent)]"
          )}
        />
      </div>
      <div className="relative z-10 flex max-w-2xl flex-col gap-5 px-4">
        <a
          className={cn(
            "group flex w-fit items-center gap-3 rounded-sm border bg-card p-1 shadow-xs",
            "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards transition-all delay-500 duration-500 ease-out"
          )}
          href="#link"
        >
          <div className="rounded-sm px-1 py-0.5 shadow-sm">
          </div>
          {/* <span className="text-xs">1,000+ mock tests attempted</span> */}
          <span className="text-xs">
            <TextType
              text={[
                "1,000+ mock tests attempted",
                "500+ active users"
              ]}
              typingSpeed={15}
              pauseDuration={1500}
              showCursor
              cursorCharacter="|"
              deletingSpeed={45}
              cursorBlinkDuration={0.7}
            />
          </span>
          <div className="rounded-sm px-1 py-0.5 shadow-sm">
          </div>
        </a>

        <h1
          className={cn(
            "text-balance font-medium text-4xl text-foreground leading-tight md:text-5xl",
            "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards delay-100 duration-500 ease-out"
          )}
        >
          Building Digital Experiences That Drive Growth
        </h1>

        <p
          className={cn(
            "text-muted-foreground text-sm tracking-wider sm:text-lg md:text-xl",
            "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards delay-200 duration-500 ease-out"
          )}
        >
          We help brands scale faster through design, development <br /> and
          strategic execution.
        </p>

        <div className="fade-in slide-in-from-bottom-10 flex w-fit animate-in items-center justify-center gap-3 fill-mode-backwards pt-2 delay-300 duration-500 ease-out">
          <Button variant="outline">
            <PhoneCallIcon data-icon="inline-start" />{" "}
            Book a Call
          </Button>
          <Button>
            Get started{" "}
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>
      <div className="relative">
        <div
          className={cn(
            "absolute -inset-x-20 inset-y-0 -translate-y-1/3 scale-120 rounded-full",
            "bg-[radial-gradient(ellipse_at_center,theme(--color-foreground/.1),transparent,transparent)]",
            "blur-[50px]"
          )}
        />
        <div
          className={cn(
            "mask-b-from-60% relative mt-8 -mr-56 overflow-hidden px-2 sm:mt-12 sm:mr-0 md:mt-20",
            "fade-in slide-in-from-bottom-5 animate-in fill-mode-backwards delay-100 duration-1000 ease-out"
          )}
        >
          <div className="relative inset-shadow-2xs inset-shadow-foreground/10 mx-auto max-w-5xl overflow-hidden rounded-lg border bg-background p-2 shadow-xl ring-1 ring-card dark:inset-shadow-foreground/20 dark:inset-shadow-xs">
            <img
              alt="app screen"
              className="z-2 aspect-video rounded-lg border dark:hidden"
              height="1080"
              src="https://storage.efferd.com/screen/dashboard-light.webp"
              width="1920"
            />
            <img
              alt="app screen"
              className="hidden aspect-video rounded-lg bg-background dark:block"
              height="1080"
              src="https://storage.efferd.com/screen/dashboard-dark.webp"
              width="1920"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 pt-8 pb-0 sm:space-y-8 sm:pt-6 md:pt-14">
      <div className="flex flex-col gap-1.5 px-4 sm:gap-2 md:px-6">
        <h1 className="text-balance text-center font-semibold text-2xl tracking-wide sm:text-3xl md:text-4xl xl:font-bold">
          Real Students, Real Results
        </h1>
        <p className="text-muted-foreground text-center text-sm md:text-base lg:text-lg">
          Trusted by students and educators across India to prepare for
          competitive exams with confidence.
        </p>
      </div>
      <div className="relative grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        <FullWidthDivider position="top" />
        {testimonials.map((testimonial) => (
          <TestimonialsCard key={testimonial.name} testimonial={testimonial} />
        ))}
        <GridFiller
          className="bg-background"
          lgColumns={3}
          smColumns={2}
          totalItems={testimonials.length}
        />
        <FullWidthDivider position="bottom" />
      </div>
    </div>
  );
}

type Testimonial = {
  name: string;
  role: string;
  image: string;
  company?: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "Placetrix’s structured aptitude and technical tests were vital to my prep. Consistent practice boosted my confidence and helped me clear the Infosys aptitude round. I highly recommend it!",
    image: "https://api.dicebear.com/9.x/glass/svg?seed=Pranjal Haral",
    name: "Pranjal Haral",
    role: "Software Engineer",
    company: "Infosys",
  },
  {
    quote:
      "Regular practice with Placetrix improved my fundamentals and helped me crack the Infosys aptitude round. I appreciate the effort and recommend it to all aspirants.",
    image: "https://api.dicebear.com/9.x/glass/svg?seed=Janhavi Patil",
    name: "Janhavi Patil",
    role: "Software Engineer",
    company: "Infosys",
  },
  {
    quote:
      "Placetrix was essential to my success. The app’s quizzes and mock tests significantly improved my speed and accuracy, leaving me well-prepared for the placement process. Truly thankful!",
    image: "https://api.dicebear.com/9.x/glass/svg?seed=Pinal Lagdhir",
    name: "Pinal Lagdhir",
    role: "Software Engineer",
    company: "Infosys",
  },
  {
    quote:
      "Placetrix helped me approach placements in a structured way. The consistent practice strengthened my problem-solving skills and boosted my confidence. A must-use for aspirants!",
    image: "https://api.dicebear.com/9.x/glass/svg?seed=Chaitali Bonde",
    name: "Chaitali Bonde",
    role: "Software Engineer",
    company: "Infosys",
  },
];

function TestimonialsCard({
  testimonial,
  className,
  ...props
}: React.ComponentProps<"figure"> & {
  testimonial: Testimonial;
}) {
  const { quote, company, image, name, role } = testimonial;
  return (
    <figure
      className={cn(
        "relative grid grid-cols-[auto_1fr] gap-x-3 overflow-hidden bg-background p-3 sm:p-4",
        className,
      )}
      {...props}
    >
      <div className="mask-[radial-gradient(farthest-side_at_top,white,transparent)] pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 size-full">
        <GridPattern
          className="absolute inset-0 size-full stroke-border"
          height={25}
          width={25}
          x={-12}
          y={4}
        />
      </div>

      <Avatar className="size-8 rounded-full">
        <AvatarImage
          alt={`${name}'s profile picture`}
          src={image}
          className="object-cover"
        />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <figcaption className="-mt-0.5 -space-y-0.5">
          <cite className="text-sm not-italic md:text-base">{name}</cite>
          <span className="block font-light text-[11px] text-muted-foreground tracking-tight">
            {role}
            {company && `, ${company}`}
          </span>
        </figcaption>
        <blockquote className="mt-2 sm:mt-3">
          <p className="text-foreground/80 text-sm tracking-wide leading-relaxed">
            {quote}
          </p>
        </blockquote>
      </div>
    </figure>
  );
}

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
      <Header />
      <HeroSection />
      <FeatureSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}
