import './App.css';
import i18 from './i18n/i18';
import NavBar from './components/NavBar';
import { Route, Redirect } from 'wouter'; // Importar Redirect para redirecciones
import ListBooks from './pages/ListBooks';
import Login from './pages/Login';
import EditDeleteBooks from './pages/EditDeleteBooks';
import EditBooks from './pages/EditBooks';
import AddBook from './pages/AddBook';
import InfoBook from './pages/InfoBook';
import FontTypeInfo from './pages/FontTypeInfo';
import OfficeList from './pages/OfficeList';
import { UserContextProvider } from './context/UserContext';
import InfoOffice from './pages/InfoOffice';
import Footer from "./components/Footer";
import Home from './pages/Home';
import ContactUs from './pages/ContactUs';


function App() {
  const routePrefix = i18.language === 'es' ? '/es' : '/en';

  return (
    <UserContextProvider>
      <div className="App">
        <NavBar />

        {/* Contenedor para las páginas */}
        <div className="page-content">
        
            <Route path="/">
            <Home /> {/* Render the Home component  */}
          </Route>
          
 <Route path={`${routePrefix}/AboutUs`}>
  <ContactUs />
 </Route>



          {/* Redirige cualquier acceso inicial a booksList */}
          <Route path={`${routePrefix}/`}>
            <Redirect to={`${routePrefix}/booksList`} />
          </Route>

          {/* Definición de rutas */}
          <Route path={`${routePrefix}/booksList`}>
            <ListBooks />
          </Route>
          <Route path={`${routePrefix}/add`}>
            <AddBook />
          </Route>
          <Route path={`${routePrefix}/login`}>
            <Login />
          </Route>
          <Route path={`${routePrefix}/editDelete`}>
            <EditDeleteBooks />
          </Route>
          <Route path={`${routePrefix}/edit/:id`}>
            <EditBooks />
          </Route>
          <Route path={`${routePrefix}/:id`}>
            <InfoBook />
          </Route>
          <Route path={`${routePrefix}/fontType/:id`}>
            <FontTypeInfo />
          </Route>
          <Route path={`${routePrefix}/officesList`}>
            <OfficeList />
          </Route>
          <Route path={`${routePrefix}/office/:id`}>
            <InfoOffice />
          </Route>
                {/* Footer Section */}
                <div className="footer-container">
          <Footer />
        </div>
      </div>
      </div>
    </UserContextProvider>
  );
}

export default App;
