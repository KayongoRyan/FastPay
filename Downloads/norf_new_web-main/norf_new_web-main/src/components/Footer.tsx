import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Three columns layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Menu Column */}
          <div>
            <h3 className="text-brand-gray text-sm font-display mb-4 tracking-wider">
              Menu
            </h3>
            <div className="space-y-3">
              <Link
                to="#work"
                className="block text-brand-light hover:text-brand-gray transition-smooth text-base font-display"
              >
                Work
              </Link>
              <Link
                to="#gallery"
                className="block text-brand-light hover:text-brand-gray transition-smooth text-base font-display"
              >
                Gallery
              </Link>
              <Link
                to="#services"
                className="block text-brand-light hover:text-brand-gray transition-smooth text-base font-display"
              >
                Services
              </Link>
            </div>
          </div>

          {/* Social Column */}
          <div>
            <h3 className="text-brand-gray text-sm font-display mb-4 tracking-wider">
              Social
            </h3>
            <div className="space-y-3">
              <a
                href="https://www.instagram.com/norfcre8ions/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-brand-light hover:text-brand-gray transition-smooth text-base font-display"
              >
                Instagram
              </a>
              <a
                href="https://rw.linkedin.com/company/norf-cre8ions"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-brand-light hover:text-brand-gray transition-smooth text-base font-display"
              >
                LinkedIn
              </a>

              {/* <a
                href="https://vimeo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-brand-light hover:text-brand-gray transition-smooth text-base font-display"
              >
                Vimeo
              </a> */}
              
            </div>
          </div>

          {/* Business enquiries Column */}
          <div>
            <h3 className="text-brand-gray text-sm font-display mb-4 tracking-wider">
              Business enquiries
            </h3>
            <div className="space-y-3">
              <a
                href="mailto:info@norfcre8ions.com"
                className="block text-brand-light hover:text-brand-gray transition-smooth text-base font-display"
              >
                info@norfcre8ions.com
              </a>


              {/* <div className="mt-6">
                <p className="text-brand-gray text-sm font-display mb-2 tracking-wider">
                  Collaborations
                </p>
                <a
                  href="mailto:collab@mitchellmullins.com"
                  className="block text-brand-light hover:text-brand-gray transition-smooth text-base font-display"
                >
                  collab@mitchellmullins.com
                </a>
              </div> */}


            </div>
          </div>
        </div>

        {/* Large Logo */}
        <div className="text-center">
          <h1 className="text-[6rem] md:text-[9rem] lg:text-[13rem] font-display text-brand-light tracking-tighter leading-none">
            Norf Cre8ions
          </h1>
        </div>
      </div>
    </footer>
  );
};