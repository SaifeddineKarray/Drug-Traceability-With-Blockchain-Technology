import React from 'react';
import '../App.css';
import Button from 'react-bootstrap/Button';
function Roles({ deployClientContract, Adress, handleAdressChange, isClient, deployManufacturerContract, isManu, deployPh, isPharm, Getdrug }) {
  return (
    <div>
      <h4>Roles</h4>
      <Button variant='dark' onClick={deployClientContract}>Give client role</Button>
      <div>
        <input type="text" value={Adress} onChange={handleAdressChange} />
        <Button variant='dark' onClick={isClient}>Is he a Client</Button>
      </div>
      <div>
        <Button variant='dark' onClick={deployManufacturerContract}>Manufacturer Deploy</Button>
      </div>
      <div>
        <Button variant='dark' onClick={isManu}>Is he a Manu</Button>
      </div>
      <div>
        <Button variant='dark' onClick={deployPh}>Ph Deploy</Button>
      </div>
      <div>
        <Button variant='dark' onClick={isPharm}>Is he a Ph</Button>
        <div>
          <Button variant='dark' onClick={Getdrug}>Get Drugs Number</Button>
        </div>
      </div>
    </div>
  );
}

export default Roles;
