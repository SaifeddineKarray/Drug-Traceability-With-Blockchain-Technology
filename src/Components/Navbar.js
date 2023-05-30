import { Button } from 'bootstrap';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './CSS/Navbar.css';
import logo from './Images/logo.png'
const Sidebar = (props) => {

  return (
    <Navbar expand="lg" className="navbar-dark bg-ligth">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="logo"><img src={logo} alt="logo"/></Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="navbar-nav me-auto mb-2 mb-lg-0">
            <Nav.Link as={Link} to="/market">Market</Nav.Link>
            <Nav.Link as={Link} to="/owned">Owned Drugs</Nav.Link>
            {(props.role === "manufacturer" || props.role === "admin") &&
              <>
                <Nav.Link as={Link} to="/create">Create Drug</Nav.Link>
                <Nav.Link as={Link} to="/ordergrid">Orders Grid</Nav.Link>
              </>
            }
            {(props.role === "pharmacy" || props.role === "admin") &&
            <>
              <Nav.Link as={Link} to="/order">Order Drug</Nav.Link>
              <Nav.Link as={Link} to="/orderstatus">Orders Status</Nav.Link>
              </>
            }
            {(props.role === "distributor" || props.role === "admin") &&
              <>
                <Nav.Link as={Link} to="/assign">Assign Orders To Delivery</Nav.Link>
                <Nav.Link as={Link} to="/delevery">Deliver Orders</Nav.Link>
              </>
            }
            {(props.role === "admin") &&
              <>
              <Nav.Link as={Link} to="/admin">Edit Users Roles</Nav.Link>
              </>
            }
          </Nav>
          <Nav className="navbar-nav ms-auto mb-2 mb-lg-0">
            {props.auth.currentUser ?
              <>
                <Nav.Link onClick={props.logout} className="logout-btn">Logout</Nav.Link>
              </>
              :
              <>
                <Nav.Link as={Link} to="/login" className="login-btn">Login</Nav.Link>
                <Nav.Link as={Link} to="/register" className="register-btn">Register</Nav.Link>
              </>
            }
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Sidebar;
