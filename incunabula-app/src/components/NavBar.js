import React from 'react';
import logo from '../assets/logo.png';
import i18 from '../i18n/i18';
import { NavBarLinks, NavBarLinksExpert } from "../lib/constants";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { GrLanguage } from "react-icons/gr";

import useUser from '../hooks/useUser';
import { useLocation } from 'wouter';

import '../App.css';

function NavBar() {
  const { isLoggedIn, logout } = useUser();
  const [location, navigate] = useLocation();

  const handleClick = (e) => {
    e.preventDefault();
    logout();
    navigate(`${i18.language === 'es' ? '/es' : '/en'}/`);
  }

  const handleLanguageChange = (lang) => {
    if (lang === i18.language) return;  // Evitar cambiar si ya es el idioma seleccionado

    i18.changeLanguage(lang);  // Cambiar el idioma

    const currentPath = location; // Ruta actual
    const newPath = currentPath.replace(/^\/(en|es)/, `/${lang}`); // Reemplazar el idioma

    navigate(newPath);  // Redirigir a la nueva URL con el idioma seleccionado

    window.location.reload();  // Recargar la página para que los textos cambien
  };

  const languageTitle = i18.language === 'es' ? 'ES' : 'EN';
  

  return (
    <Navbar collapseOnSelect expand="lg" className="p-1">
      <Container fluid>
        <Navbar.Brand className="app-logo" href={`${i18.language === 'es' ? '/es' : '/en'}`}>
          <img
            src={logo}
            className="image mb-2 d-inline-block align-center"
          />
          <span className="titleNav">{i18.t('titulo')}</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto">
            <NavDropdown className='mt-1' title={<><GrLanguage className='mb-1' /> {languageTitle}</>}  id="basic-nav-dropdown">
              <NavDropdown.Item
                onClick={() => handleLanguageChange('es')}
                disabled={i18.language === 'es'}
              >
                Español
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => handleLanguageChange('en')}
                disabled={i18.language === 'en'}
              >
                English
              </NavDropdown.Item>
            </NavDropdown>
            {isLoggedIn ?
              NavBarLinksExpert.map((link, index) => (
                <Nav.Link
                  className="fs-5"
                  key={index}
                  href={`${i18.language === 'es' ? '/es' : '/en'}${link.link}`}
                >
                  {i18.t(link.name)}
                </Nav.Link>
              ))
              :
              NavBarLinks.map((link, index) => (
                <Nav.Link
                  className="fs-5"
                  key={index}
                  href={`${i18.language === 'es' ? '/es' : '/en'}${link.link}`}
                >
                  {i18.t(link.name)}
                </Nav.Link>
              ))
            }
          </Nav>
<Nav.Link
  className="fs-5"
  href={`${i18.language === 'es' ? '/es/AboutUs' : '/en/AboutUs'}`}
>
  {i18.t('NavBar.contactUs')}
</Nav.Link>


          <Nav className='p-3'>
            {isLoggedIn ?
              <Button
                variant='dark'
                onClick={handleClick}
                className="m-auto text-center"
              >
                {i18.t('login.logout')}
              </Button>
              :
              <Button
                variant='dark'
                href={`${i18.language === 'es' ? '/es' : '/en'}/login`}
                className="m-auto text-center"
              >
                {i18.t('login.log')}
              </Button>
            }
          </Nav>

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
