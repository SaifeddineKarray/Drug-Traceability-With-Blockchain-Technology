import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { buyDrug,getAllListedDrugs,priceChanger, selectedAccount, subscribeToDrugAdded,getDrug ,Facture} from '../Web3Client.js';
import { AgGridReact } from 'ag-grid-react';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import "ag-grid-community";
import '../App.css';
import QRCode from 'qrcode';
import './CSS/Market.css';
import {
  collection,
  getDocs,
  doc,
  setDoc, query, where
} from "firebase/firestore";
import { auth,db } from "../firebase-config";

function Market() {
  const [drugsListed, setDrugsListed] = useState([]);
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [quantity, setQuantity] = useState('');
  const gridRef = useRef();
  const usersCollectionRef = collection(db, "users")
  useEffect(() => {
    const fetchDrugs = async () => {
      const drugs = await getAllListedDrugs();
      const filteredDrugs = drugs.filter(order => order.manufacturer !== "0x0000000000000000000000000000000000000000");
      const dataa = await getDocs(usersCollectionRef);
     const  users=dataa.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
     console.log(filteredDrugs)
     const finaldrugs=filteredDrugs.map(drug => ({
      ...drug,
      manufacturer: users.find(item => item.wallet.toLowerCase() === drug.manufacturer.toLowerCase())?.name || drug.manufacturer,
      pharmacy: users.find(item => item.wallet.toLowerCase() === drug.pharmacy?.toLowerCase())?.name || drug.pharmacy,
     }));
      setDrugsListed(finaldrugs);
    };
    fetchDrugs();
  }, []);

  const columnDefs = [
    {
      headerName: 'Buy',
      width: 120,
      cellRenderer: 'actionsRenderer',
      cellRendererParams: {
        onClick: async(row) => {
        const drugInfo = await buyDrug(row.id);
        await Facture(row,gridRef,usersCollectionRef) ;
        console.log(drugInfo);}
      }
    },
    {
      headerName: 'Details',
      width: 120,
      cellRenderer: 'actionsRenderer2',
      cellRendererParams: {
        onClick: async(row) => {
        Facture(row,gridRef,usersCollectionRef) ;}
      }
    },
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'description', headerName: 'Description', width: 250 },
    { field: 'price', headerName: 'Price', width: 120,},
    {field:'manufacturer',headerName: 'Manufacturer', width:200},
    {field:'pharmacy',headerName: 'Pharmacy', width:200},
    {field:'quantity',headerName: 'Q', width:90},
    {field:'tempC',headerName: 'T°', width:90,},
    {field:'date',headerName: 'date', width:200},
    

  ];
  const actionsRenderer = useCallback((props) => {
    return (
        <div style={{ marginBottom:'10px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Button variant="success" size="sm" onClick={() => props.onClick(props.data)}>Buy</Button>
    </div>
    );
  }, []);
  const actionsRenderer2 = useCallback((props) => {
    return (
        <div style={{ marginBottom:'10px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Button variant="success" size="sm" onClick={() => props.onClick(props.data)}>Details</Button>
    </div>
    );
  }, []);
;
 
  const onGridReady = useCallback(params => {
    gridRef.current = params;
    params.api.sizeColumnsToFit();
  }, []);

  return (
<div class="all">
<div class="container">
  <h1 class="title">Market</h1>
  <br/>
  <div class="description-container">
    <p class="description">Please note that you need to have a valid Ethereum account and enough funds in your account to be able to buy drugs from this market. If you're not familiar with Ethereum, you may want to read up on it first and learn how to create an account and fund it with Ether.</p>
    <p class="description">When you click the "Buy" button, a PDF invoice will be generated for each drug you buy, which you can print and use for your records. The invoice will contain information such as the drug name, price, manufacturer, pharmacy, and creation date.</p>
  </div>
  </div>
  <div class="ag-theme-material" style={{margin:'5%', marginTop:'10px' , height: '400px', width: '90%' }}>
    <AgGridReact
      columnDefs={columnDefs}
      rowData={drugsListed}
      rowSelection="multiple"
      frameworkComponents={{ actionsRenderer ,actionsRenderer2}}
      onGridReady={onGridReady}
    />
  </div>
</div>


  );
}

export default Market;
