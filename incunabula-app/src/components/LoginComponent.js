import React, { useEffect, useState } from 'react';
import { login as loginService } from '../services/login';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { FiEye, FiEyeOff } from "react-icons/fi";
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import i18 from '../i18n/i18';
import useUser from '../hooks/useUser';
import { useLocation } from 'wouter';

function LoginComponent() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [, navigate] = useLocation();
  const { isLogginLoading, isLogginError, login, isLoggedIn, user } = useUser();

  useEffect(() => {
    if (isLoggedIn) {
     
      // Navegar normalmente a la ruta regular de la primera aplicación
      navigate(`${i18.language === 'es' ? '/es' : '/en'}/editDelete`);
    
    }
  }, [isLoggedIn, navigate, user]);

  // Vaciar el campo de contraseña si hay un error de inicio de sesión
  useEffect(() => {
    if (isLogginError) {
      setPassword('');
    }
  }, [isLogginError]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError(i18.t('login.error'));
    } else {
      setError(''); // Clear previous errors
      login({ email, password });
    }
  };

  return (
    <div>
      {isLogginLoading && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span>{i18.t('login.check')}</span>
          <div>
            <Spinner animation="border" role="status" style={{ marginTop: '10px', color: '#ECB289' }}>
              <span className="visually-hidden">{i18.t('loading')}</span>
            </Spinner>
          </div>
        </div>
      )}
      {!isLogginLoading && (
        <Card className='large-card'>
          <Card.Header className='titleNav bg-color-header'>{i18.t('login.log')}</Card.Header>

          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <FloatingLabel
                controlId="floatingInput"
                label={i18.t('login.email')}
                className="mb-3"
              >
                <Form.Control
                  type="email"
                  placeholder={i18.t('login.email')}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FloatingLabel>

              <FloatingLabel
                controlId="floatingPassword"
                label={i18.t('login.password')}
                className="mb-3"
                style={{ position: 'relative' }}
              >
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder={i18.t('login.password')}
                  value={password}
                  onChange={handlePasswordChange}
                />
                {password && (
                  showPassword ? (
                    <FiEyeOff
                      onClick={togglePasswordVisibility}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: '10px',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        zIndex: 1,
                      }}
                    />
                  ) : (
                    <FiEye
                      onClick={togglePasswordVisibility}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: '10px',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        zIndex: 1,
                      }}
                    />
                  )
                )}
              </FloatingLabel>

              <div className="d-grid gap-2">
                <Button
                  type="submit"
                  fullWidth
                  variant='orange'
                >
                  {i18.t('login.log')}
                </Button>
              </div>
            </Form>
          </Card.Body>

          {isLogginError && <Alert variant="danger">{i18.t('login.logError')}</Alert>}
        </Card>
      )}
    </div>
  );
}

export default LoginComponent;
