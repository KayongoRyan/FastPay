export const ServicesListSection = () => {
  return (
    <section className="py-32 border-t border-brand-light/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-12 gap-8">
          {/* Left - Title */}
          <div className="col-span-12 lg:col-span-3">
            <h2 className="text-xl font-light text-brand-light">Our Services</h2>
          </div>

          {/* Center - Description */}
          <div className="col-span-12 lg:col-span-6">
            <p className="text-lg lg:text-xl text-brand-light leading-relaxed">
              Elevate your brand with our expert motion design services. From captivating identities to cinematic productions, we create visual experiences that drive results and captivate audiences.
            </p>
          </div>

          {/* Right - Empty for balance */}
          <div className="col-span-12 lg:col-span-3">
          </div>
        </div>
      </div>
    </section>
  );
};
