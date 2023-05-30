import React from 'react';
import './CSS/Home.css';
import supplyChainDiagram from './Images/Illustration_Supply-Chain-Management.png';
import { Link } from 'react-router-dom';
function Home() {
return (
<div className="home-container">
<h1 className="title">Secure Drug Traceability Platform</h1>
<p className="description">
Our platform helps participants in the drug supply chain track and manage the movement of drugs from manufacturers to pharmacies. By ensuring authenticity and safety, we improve patient outcomes and promote transparency.
</p>
<img className="diagram" src={supplyChainDiagram} alt="Drug supply chain diagram" />
<Link to="/market">
        <button className="cta-button">Get started now</button>
</Link>
</div>
);
}

export default Home;