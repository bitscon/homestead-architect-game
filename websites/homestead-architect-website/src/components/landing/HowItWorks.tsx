const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple Planning Process
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From blank canvas to detailed homestead plan in just a few steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-soft">
              1
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Define Your Property</h3>
            <p className="text-muted-foreground">
              Set your property boundaries, dimensions, and basic topography.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-soft">
              2
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Add Elements</h3>
            <p className="text-muted-foreground">
              Place buildings, gardens, water features, and infrastructure exactly where you want them.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-soft">
              3
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Refine & Share</h3>
            <p className="text-muted-foreground">
              Adjust your design, get feedback, and export your plan for implementation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;