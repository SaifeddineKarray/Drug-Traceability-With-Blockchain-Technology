import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link,useNavigate } from 'react-router-dom';
import './App.css';
import Sidebar from './Components/Navbar';
import Login from './Components/Login';
import Register from './Components/Register';
import Home from './Components/Home';
import Footer from './Components/Footer';
import CreateDrugForm from './Components/CreateDrugForm';
import OrderDrug from './Components/OrderDrug';
import OrderGrid from './Components/OrderGrid';
import DrugDetails from './Components/DrugDetails';
import OwnedDrugs from './Components/OwnedDrugs';
import Market from './Components/Market';
import OrdersStat from './Components/OrdersStat';
import Roles from './Components/Roles';
import {signOut} from "firebase/auth";
import { auth,db } from "./firebase-config";
import { createDrug , order,accept ,deployClientContract,isClient,deployManufacturerContract,isManu,deployPh,isPharm,DrugNum} from './Web3Client';
import { init } from './Web3Client';
import Unauthorized from "./Components/Unauthorized";
import Notfound from "./Components/Notfound";
import RequireAuth from './Components/RequireAuth';
import {
	getDoc,
	doc
  } from "firebase/firestore";
  import Rolegrid from './Components/Rolegrid';
  import Deleverygrid from './Components/Deleverygrid';
import AssignDistributor from './Components/assignDistributor';
function App() {
	
  const [user, setUser] = useState();
  const [role, setrole] = useState();
  console.log(role);

	useEffect(() => {init();
	  
	  }, []);
    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(async(user) => {
        setUser(user);
		const userRef = doc(db, 'users',auth.currentUser.uid);
    const userSnapshot = await getDoc(userRef);
	const role1 =userSnapshot.get('role');
	setrole(role1);
      });
      return unsubscribe; 
      }, []);
	  useEffect(() => {init();
		
		}, []);
		const navigate= useNavigate()	
   const handleLogout = async () => {
    await signOut(auth);
	setrole(null);
	navigate('/');

    };
	const [orderd, setOrder] = useState(false);
	
	const [orderNum, setOrderNum] = useState('');
	const [Adress, setAd] = useState('');

  const handleAdressChange = (event) => {
    event.preventDefault();
      setAd(event.target.value);
      };
	 const create = () => {
		createDrug()
	 		.then((tx) => {
	 			console.log(tx);
	 		})
	 		.catch((err) => {
	 			console.log(err);
	 		});
	 };

	 const orderr = () => {
		order()
			.then((tx) => {
				console.log(tx);
			})
			.catch((err) => {
				console.log(err);
			});
	};
	const acceptt = () => {
		accept()
			.then((tx) => {
				console.log(tx);
			})
			.catch((err) => {
				console.log(err);
			});
	};
	const Getdrug = () => {
		DrugNum()
			.then((tx) => {
				console.log(tx);
			})
			.catch((err) => {
				console.log(err);
			});
	};

  return (
    <div className="App">
      
	  
        <Sidebar role={role} auth={auth} logout={handleLogout}/>
        <Routes>
          <Route path="/" >


			   {/* public routes */}
		  <Route index element={<Home />} />
          <Route path="login"  element={<Login setrole={setrole}/>} />
          <Route path="register"  element={<Register setrole={setrole}/>} />
		  <Route path="unauthorized" element={<Unauthorized />} />
		  <Route path="roles"  element={<Roles deployClientContract={deployClientContract} Adress={Adress} handleAdressChange={handleAdressChange} isClient={isClient} deployManufacturerContract={deployManufacturerContract}
           isManu={isManu} deployPh={deployPh} isPharm={isPharm} Getdrug ={Getdrug} /> } />
		   <Route path="admin" element={<Rolegrid user={user} setrole={setrole}/>} />
		   <Route path="delevery" element={<Deleverygrid/>} />
		   <Route path="assign" element={<AssignDistributor/>} />
		   <Route path="market" element={<Market/>} />
		   <Route path="owned" element={<OwnedDrugs role={role} auth={auth} />} />
		   <Route path="/drug/:id" element={<DrugDetails />} />


		   {/* ONLY MANUFACTURER */}
		   <Route element={<RequireAuth role={role} allowedRoles={["admin", "manufacturer"]} />}>
		  <Route
            path="create"
            element={<CreateDrugForm/>}
          />
			<Route path="ordergrid"  element={<OrderGrid/>} />
			</Route>
			{/* ONLY PHARMACY */}
			<Route element={<RequireAuth role={role}  allowedRoles={["admin", "pharmacy"]} />}>
			<Route path="order" element={<OrderDrug/>}/>
			<Route path="orderstatus" element={<OrdersStat/>}/>
			</Route>
			{/* ONLY CLIENT */}
			<Route element={<RequireAuth role={role}  allowedRoles={["admin", "client"]} />}>
			<Route path="buy" element={<></> }/>
			</Route>
		  <Route path="*" element={<Notfound />} />
		  </Route>
        </Routes>
		<footer>
	<Footer  />
	</footer>
    </div>
  );
}

export default App;
