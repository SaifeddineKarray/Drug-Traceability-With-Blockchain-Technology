import React, { useCallback,  useRef, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { Form } from 'react-bootstrap';
import { order,getDrugsAvailable, subscribeToDrugAdded ,Facture} from '../Web3Client.js';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community";
import '../App.css';
import {
  collection,getDocs,
} from "firebase/firestore";
import { auth,db } from "../firebase-config";


function OrderDrug({ orderr, acceptt, orderd }) {
  const [drugsAvailable, setDrugsAvailable] = useState([]);
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [quantity, setQuantity] = useState('');
  const gridRef = useRef();
  const usersCollectionRef = collection(db, "users");
  useEffect(() => {
    const fetchDrugs = async () => {
      const drugs = await getDrugsAvailable();
      const filteredDrugs = drugs.filter(order => order.manufacturer !== "0x0000000000000000000000000000000000000000");
    
      const data = await getDocs(usersCollectionRef);
      const users = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      
      const Drugsfinal = filteredDrugs.map((drug) => {

        const user = users.find((u) => {
          console.log(u.wallet);
          console.log(drug.manufacturer);
          return(u.wallet.toLowerCase() === drug.manufacturer.toLowerCase());});
        console.log(user);
        return { ...drug, manufacturer: user ? user.name : drug.manufacturer };
      });
      
      setDrugsAvailable(Drugsfinal);
    };
   

    fetchDrugs();

    const unsubscribe = subscribeToDrugAdded(() => {
      fetchDrugs();
    });

    return unsubscribe;
  }, []);

  const columnDefs = [
    {
      headerName: "",
      field: "checkbox",
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: true,
      width: 50
    },
    {
      headerName: 'Details',
      width: 120,
      cellRenderer: 'actionsRenderer',
      cellRendererParams: {
        onClick: async(row) => {
        Facture(row,gridRef,usersCollectionRef) ;}
      }
    },
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'description', headerName: 'Description', width: 250 },
    { field: 'price', headerName: 'Price', width: 120 },
    {field:'manufacturer',headerName: 'Manufacturer', width:200},
    {field:'quantity',headerName: 'Q', width:90},
    {field:'tempC',headerName: 'T°', width:90},
    {field:'date',headerName: 'date', width:200}

  ];

  // const rowData = drugsAvailable?.map(drug => ({
  //   id: drug.id,
  //   name: drug.name,
  //   description: drug.description,
  //   price: drug.price,
  //   manufacturer: drug.manufacturer,
  //   quantity : drug.quantity,
  //   tempC: drug.tempC,
  //   date: drug.date
  // }));

  const onSelectionChanged = useCallback(() => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    const selectedRowsElement = document.querySelector('#selectedRows');
    console.log(selectedRows);
    console.log(quantity);
        if (selectedRowsElement) {
      selectedRowsElement.innerHTML =
        selectedRows.length === 1 ? selectedRows[0].athlete : '';
    }
  },);
  const actionsRenderer = useCallback((props) => {
    return (
        <div style={{ marginBottom:'10px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Button variant="success" size="sm" onClick={() => props.onClick(props.data)}>Details</Button>
    </div>
    );
  }, []);
  const handleButtonClick = async () => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    const selectedIds = selectedRows.map(row => row.id);
    //console.log(selectedIds);
    //console.log(quantity);
    for (let id in selectedIds){
      console.log(selectedRows[id].quantity);
      console.log(quantity);
      if (parseInt(quantity)<=selectedRows[id].quantity){
      let ord = await order(selectedRows[id].id, quantity);
      let drugIndex = ord.drugIndex;
      gridRef.current.api.applyTransaction({ remove: selectedRows });
      }
      else {
        console.log("not enought");
      }
    }
  
  }
  
  
  const onGridReady = useCallback(params => {
    gridRef.current = params;
    params.api.sizeColumnsToFit();
  }, []);

  return (
    <div >
      <div
        className="ag-theme-material"
        style={{margin:'5%', marginTop:'10px',marginBottom:'10px' , height: '300px', width: '90%' }}
      >
        <AgGridReact
          columnDefs={columnDefs}
          rowData={drugsAvailable}
          rowSelection="multiple"
          onSelectionChanged={onSelectionChanged}
          frameworkComponents={{ actionsRenderer }}

          onGridReady={onGridReady}
        />
       
           
        
      </div>
      <br />
      <div>

      <Form.Group >
               
               <Form.Control
                 type='number' 
                 placeholder='Quantity' 
                 value={quantity} 
                 onChange={(e) => setQuantity(e.target.value)}
               />
             </Form.Group>
        <Button variant='dark' onClick={handleButtonClick}>Order Selected Drugs</Button>
      </div>
    </div>
  );
}

export default OrderDrug;

