import { 
  Loader,
  Navbar,
  MobileMenu,
  FloatButtons,
  KeyVision,
  SloganSection,
  FeatureGrid,
  PresentationSection,
  BubbleDialog,
  VideoSection,
  FunctionCarousel,
  PlanSection,
  TestimonialMarquee,
  CTASection,
  PersonalitySection,
  Footer,
} from './_home';

export default function HomePage() {
  return (
    <>
      {/* Loader */}
      <Loader />
      
      {/* Navigation */}
      <Navbar />
      <MobileMenu />
      <FloatButtons />
      
      {/* Main Content */}
        {/* KeyVision */}
        <KeyVision />
        
        
        {/* Slogan */}
        <SloganSection />
        
        {/* Features */}
        <FeatureGrid />
        
        {/* Presentation */}
        <PresentationSection />
        
        {/* Bubble Dialog */}
        <BubbleDialog />
        
        {/* Videos */}
        <VideoSection />
        
        {/* Functions */}
        <FunctionCarousel />
        
        {/* Plans */}
        <PlanSection />
        
        {/* Testimonials */}
        <TestimonialMarquee />
        
        {/* Call to Action */}
        <CTASection />
        
        {/* Personality Test */}
        <PersonalitySection />
      
      {/* Footer */}
      <Footer />
    </>
  );
}