import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { listDrug,getAllDeliveredReceivedListedDrugs,priceChanger, unlistDrug, unlistDrugLot,listDrugLot,orderReceived } from '../Web3Client.js';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community";
import '../App.css';
import './CSS/Owneddrugs.css';
import {
  collection,
  getDocs,
  doc,
  setDoc, query, where
} from "firebase/firestore";
import { auth,db } from "../firebase-config";

function OwnedDrug(props) {
  const [drugsDelivered, setDrugsDelivered] = useState([]);
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [quantity, setQuantity] = useState('');
  const [isListed, setIsListed] = useState(false);
  const gridRef = useRef();
  const usersCollectionRef = collection(db, "users")
  useEffect(() => {
    const fetchDrugs = async () => {
      const drugs = await getAllDeliveredReceivedListedDrugs();
      const filteredDrugs = drugs.filter(order => order.manufacturer !== "0x0000000000000000000000000000000000000000");
      const dataa = await getDocs(usersCollectionRef);
      const  users=dataa.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      console.log(filteredDrugs)
      const finaldrugs=filteredDrugs.map(drug => ({
       ...drug,
       manufacturer: users.find(item => item.wallet.toLowerCase() === drug.manufacturer.toLowerCase())?.name || drug.manufacturer,
       pharmacy: users.find(item => item.wallet.toLowerCase() === drug.pharmacy?.toLowerCase())?.name || drug.pharmacy,
      }));
      setDrugsDelivered(finaldrugs);
    };
    fetchDrugs();
  }, []);

  const columnDefs = [
    {
      headerName: 'List',
      width: 120,
      cellRenderer: 'actionsRenderer',
      cellRendererParams: {
        onClick: async (row) => {
          console.log("Accepted order:", row);
          const List = await listDrug(row.id);
          console.log(console.log(row.id));
          console.log(row.id);
          gridRef.current.api.applyTransaction({ remove: [row] });
        }
      },
      hide: !((props.role === "pharmacy"))
    },
    {
      headerName: 'Received',
      width: 120,
      cellRenderer: 'actionsRenderer3',
      cellRendererParams: {
        onClick: async (row) => {
          console.log("Accepted order:", row);
          const List = await orderReceived(row.id);
          console.log(console.log(row.id));
          console.log(row.id);
        
        }
      },
      hide: !((props.role === "pharmacy"))
    },
    {
      headerName: 'ListLot',
      width: 120,
      cellRenderer: 'actionsRenderer2',
      cellRendererParams: {
        onClick2: async (row) => {
          console.log("Accepted order:", row);
          const List = await listDrugLot(row.id);
          console.log(console.log(row.id));
          console.log(row.id);
          gridRef.current.api.applyTransaction({ remove: [row] });
        }
      },
      hide: !((props.role === "admin")||(props.role === "manufacturer"))
    },
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'description', headerName: 'Description', width: 250 },
    { field: 'price', headerName: 'Price', width: 120,editable: true },
    {field:'manufacturer',headerName: 'Manufacturer', width:200},
    {field:'pharmacy',headerName: 'Pharmacy', width:200},
    {field:'quantity',headerName: 'Q', width:90},
    {field:'tempC',headerName: 'T°', width:90,editable: true},
    {field:'date',headerName: 'date', width:200},

  ];
  const onCellValueChanged = (params) => {
    const { node, colDef, newValue } = params;
    if (colDef.field === "price") {
      node.data.price = newValue;
      priceChanger(node.data.id, newValue);
    }
  };
  const actionsRenderer3 = useCallback((props) => {
    return (
        <div style={{ marginBottom:'10px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Button variant="success" size="sm" onClick={() => props.onClick(props.data)}>Received</Button>
    </div>
    );
  }, []);
  const actionsRenderer = useCallback((props) => {  
    
    const handleListClick = () => {
      listDrug(props.data.id);
      setIsListed(true);
      gridRef.current.api.applyTransaction({ update: [props.data] });
    };
    
    const handleUnlistClick = () => {
      unlistDrug(props.data.id);
      setIsListed(false);
      gridRef.current.api.applyTransaction({ update: [props.data] });
    };
    
    return (
      <div style={{ marginBottom:'10px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Button variant="success" size="sm" onClick={handleListClick}>List</Button>
          <Button variant="danger" size="sm" onClick={handleUnlistClick}>Unlist</Button>
      </div>
    );
  }, []);
  const actionsRenderer2 = useCallback((props) => {  
    
    const handleListClick = () => {
      listDrugLot(props.data.id);
      gridRef.current.api.applyTransaction({ update: [props.data] });
    };
    
    const handleUnlistClick = () => {
      unlistDrugLot(props.data.id);
      gridRef.current.api.applyTransaction({ update: [props.data] });
    };
    
    return (
      <div style={{ marginBottom:'10px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Button variant="success" size="sm" onClick={handleListClick}>ListLot</Button>
          <Button variant="danger" size="sm" onClick={handleUnlistClick}>Unlistlot</Button>
      </div>
    );
  }, []);
  
  
  
  const onGridReady = useCallback(params => {
    gridRef.current = params;
    params.api.sizeColumnsToFit();
  }, []);

  return (
    <div>
      <div>
      <div
        className="ag-theme-material"
        style={{margin:'5%', marginTop:'10px',marginBottom:'10px' , height: '500px', width: '90%' }}
      >
        <AgGridReact
          columnDefs={columnDefs}
          rowData={drugsDelivered}
          rowSelection="multiple"
          onCellValueChanged={onCellValueChanged}
          frameworkComponents={{ actionsRenderer,actionsRenderer2 ,actionsRenderer3}}
          onGridReady={onGridReady}
        />
        </div>
      </div>
    </div>
  );
}

export default OwnedDrug;

