// src/components/Footer.js
import React from "react";
import logo from "../assets/logo-gobierno-aragon.jpg"; // Replace with the actual path to your logo
import "../App.css"; // Import a CSS file for styling (optional)
import i18 from '../i18n/i18';


const Footer = () => {
  return (
    <footer className="footer">
      <div className="subfooter">
        <img src={logo} alt="Project Logo" className="subfooter-logo" />
        <p className="subfooter-reference">
          {i18.t('footer.projectReference')}
        </p>
      </div>
      <div className="footer-main">
        &copy; {new Date().getFullYear()} {i18.t('footer.universityName')}.
      </div>
    </footer>
  );
};

export default Footer;
