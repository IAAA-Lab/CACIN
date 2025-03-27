import React from 'react';
import LoginComponent from '../components/LoginComponent';
import { Helmet } from 'react-helmet';
import i18 from '../i18n/i18';
import '../App.css';

function Login() {

  return (
    <div>
      <Helmet>
        <title>{i18.t('login.log')}</title>
      </Helmet>

      <style type="text/css">
        {`
            .btn-orange {
              background-color: #ECB289;
              color: black;
              border: 1px solid;
              border-radius: 5px;
            }

          `}
      </style>
      <div className="background-login" />
      <div className="min-vh-80 d-flex align-items-center justify-content-center">
        <LoginComponent />
      </div>
    </div>
  );
}

export default Login;