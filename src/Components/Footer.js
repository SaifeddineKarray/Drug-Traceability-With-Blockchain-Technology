import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import './CSS/Footer.css';

function Footer() {
  const footerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const footerElement = footerRef.current;
    const options = {
      threshold: 0.2,
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        footerElement.classList.add('animate');
      } else {
        setIsVisible(false);
      }
    }, options);

    observer.observe(footerElement);

    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={footerRef} className={`footer ${isVisible ? 'visible' : ''}`}>
      <div className="container">
        <div className="row">
          <div className="col-lg-4 col-md-6">
            <h3>About Us</h3>
            <p>
            taking on the conception and development of a distributed and decentralized healthcare supply 
            management system focusing specifically on drug traceability, using the Blockchain technology. 
            </p>
          </div>
          <div className="col-lg-2 col-md-6">
            <h3>Links</h3>
            <ul className="list-unstyled">
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#">About</a>
              </li>
              <li>
                <a href="#">Services</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6">
            <h3>Contact Us</h3>
            <p>
              1234 Lorem Ipsum Dolor Sit,<br />
              Amet, AB 12345<br />
              Phone: (123) 456-7890<br />
              Email: info@example.com
            </p>
          </div>
          <div className="col-lg-3 col-md-6">
            <h3>Follow Us</h3>
            <div className="social">
              <a href="#">
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a href="#">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="#">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="#">
                <FontAwesomeIcon icon={faLinkedin} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
