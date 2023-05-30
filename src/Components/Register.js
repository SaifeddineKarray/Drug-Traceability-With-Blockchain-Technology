import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { selectedAccount, setname } from '../Web3Client';
import {
  collection,
  getDocs,
  doc,
  setDoc, query, where
} from "firebase/firestore";
import { Form } from 'react-bootstrap';

import { auth,db } from "../firebase-config";
import {
    createUserWithEmailAndPassword,
} from "firebase/auth";
import { Link, useNavigate } from 'react-router-dom';
import './CSS/Register.css'; 
function Register(props) {
  const [formdata, setformdata] = useState({email:'',
                                            password:'',
                                          role:'client',
                                        name:''});
  const [errorMessage, setErrorMessage] = useState(null);
  const [buttonstatus, setbuttonstatus] = useState(true)
  const usersCollectionRef = collection(db, "users");
  
  function handleChange(event){
    setformdata(old => {
        return {
            ...old,
            [event.target.name]: event.target.value
        }
    })
}
  const navigate= useNavigate()
  const handleRegister = async(e) => {
    
        e.preventDefault()
        setbuttonstatus(false)
        const q=query(usersCollectionRef, where("wallet", "==",selectedAccount));
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setErrorMessage("This wallet address is already registered!");
        setbuttonstatus(true);
        return;
      }
        const user = await createUserWithEmailAndPassword(
        auth,
        formdata.email,
        formdata.password
        );
        
         const docRef = doc(db, "users", auth.currentUser.uid );
        setDoc(docRef, {
          useruid : auth.currentUser.uid,
          wallet : selectedAccount,
          role:formdata.role,
          email:formdata.email,
          name:formdata.name
        }).then(() => {
            
            navigate('/');
        })
        .catch(error => {
            console.log(error);
})  
    } catch (error) {
        if(error.message == "Firebase: Error (auth/email-already-in-use).")
        setErrorMessage("Email déjà utilisé !");
    }
    };

  return (
    <div className='register'>
      <h2>Register</h2>
      <Form onSubmit={handleRegister}>
      <Form.Group controlId="formemail">
        <Form.Label>
          Email: </Form.Label>
          <Form.Control placeholder='Enter Email' name='email' type="email" value={formdata.email} onChange={handleChange} required />
       </Form.Group>
        <br />
        <Form.Group controlId="formname">
        <Form.Label>
          Name: </Form.Label>
          <Form.Control placeholder='Enter Name' name='name' type="text" value={formdata.name} onChange={handleChange} required />
       </Form.Group>
        <br />
        <Form.Group controlId="from pswrd">
        <Form.Label>
          Password:</Form.Label>
          <Form.Control placeholder='Enter Password' name='password' type="password" value={formdata.password} onChange={handleChange} required />
        
        </Form.Group>
        <br />
        <Form.Group controlId="from pswrd">
        <Form.Label>
          Choose role: </Form.Label>
          <select class="form-select" name='role' value={formdata.role} onChange={handleChange}>
          <option value="admin">admin</option>
          <option value="distributor">distributor</option>
          <option value="client">client</option>
            <option value="manufacturer">manufacturer</option>
            <option value="pharmacy">pharmacy</option>
            
          </select>
       
        </Form.Group>
        {errorMessage && <p>{errorMessage}</p>}
        <Button variant='dark' disabled={!buttonstatus} type="submit">Register</Button>
      </Form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}

export default Register;
