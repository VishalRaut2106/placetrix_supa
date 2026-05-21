import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

export type TestimonialItem = {
  name: string
  role: string
  company: string
  avatar: string
  rating: number
  content: string
}

type TestimonialsComponentProps = {
  testimonials: TestimonialItem[]
}

const TestimonialsComponent = ({ testimonials }: TestimonialsComponentProps) => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <Carousel
        className='mx-auto grid max-w-7xl grid-cols-1 items-center gap-11 px-4 sm:px-6 md:grid-cols-2 lg:px-8'
        opts={{
          align: 'start',
          slidesToScroll: 1
        }}
      >
        {/* Left Content */}
        <div className='space-y-4 md:space-y-16'>
          <div className='space-y-4'>
            <Badge variant='outline' className='h-auto text-sm font-normal'>
              Testimonials
            </Badge>
            <h2 className='text-2xl font-semibold sm:text-3xl lg:text-4xl'>
              Trusted by leaders from various industries
            </h2>
            <p className='text-muted-foreground text-xl'>
              From career changes to dream jobs, here&apos;s how Shadcn Studio helped.
            </p>
          </div>

          <div className='flex items-center gap-5'>
            <CarouselPrevious
              size='icon'
              variant='default'
              className='disabled:bg-primary/10 disabled:text-primary static translate-y-0 disabled:opacity-100'
            />
            <CarouselNext
              size='icon'
              variant='default'
              className='disabled:bg-primary/10 disabled:text-primary static translate-y-0 disabled:opacity-100'
            />
          </div>
        </div>

        {/* Right Testimonial Carousel */}
        <div className='relative'>
          <CarouselContent className='sm:-ml-6'>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className='sm:pl-6'>
                <div className='flex flex-col gap-10'>
                  <div className='space-y-2'>
                    <p className='h-14 text-8xl'>&ldquo;</p>
                    <p className='text-muted-foreground text-xl font-medium sm:text-2xl lg:text-4xl'>
                      {testimonial.content}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Avatar className='size-12 md:size-15'>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className='text-sm'>
                        {testimonial.name
                          .split(' ', 2)
                          .map(n => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className='flex-1'>
                      <h4 className='font-medium md:text-xl'>{testimonial.name}</h4>
                      <p className='text-muted-foreground md:text-xl'>
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
    </section>
  )
}

export default TestimonialsComponent
