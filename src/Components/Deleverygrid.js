import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import Button from 'react-bootstrap/Button';
import {  dele , Decline ,orderStatus,subscribeToAcceptOrder, getAllOrdersAcceptedassigned, getAllOrdersAcceptednotassigned, startDeliver, endDeliver} from '../Web3Client';
import {
  collection,
  getDocs,
  doc,
  setDoc, query, where
} from "firebase/firestore";
import { auth,db } from "../firebase-config"; 

function Deleverygrid({}) {
  const [gridOptions, setGridOptions] = useState({
    columnDefs: [
      { headerName: "ID", field: "id", sortable: true, filter: true },
      { headerName: "Drug Index", field: "drugIndex", sortable: true, filter: true },
      { headerName: "Pharmacy", field: "pharmacy", sortable: true, filter: true },
      { headerName: "Distributor", field: "distributor", sortable: true, filter: true },
      { headerName: "Quantity", field: "quantity", sortable: true, filter: true },
      
      {
        headerName: "Actions",
        cellRenderer: "actionsRenderer",
        cellRendererParams: {
          onEnd: async (row) => {
            console.log("delivered order:", row);
            const accept = await endDeliver(row.id);
            console.log(console.log(row.id));
            gridRef.current.api.applyTransaction({ remove: [row] });
          },
        },
      },
    ],
    rowData: [],
  });
  const gridRef = useRef();
  const [ordersAvailable, setOrdersAvailable] = useState([]);

  const usersCollectionRef = collection(db, "users");
  useEffect(() => {
    const fetchOrders = async () => {
      const orders = await getAllOrdersAcceptedassigned();

      const filteredOrders = orders.filter(order => order.pharmacy != "0x0000000000000000000000000000000000000000");
      setOrdersAvailable(filteredOrders);
      const data = await getDocs(usersCollectionRef);
      const users = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      const ordersdata = filteredOrders.map(order => ({
        ...order,
        pharmacy: users.find(item => item.wallet.toLowerCase() === order.pharmacy?.toLowerCase())?.name || order.pharmacy,
        distributor: users.find(item => item.wallet.toLowerCase() === order.distributor?.toLowerCase())?.name || order.distributor,
      }));
      setGridOptions({ ...gridOptions, rowData: ordersdata });
    }
    fetchOrders();
  
  }, []);
  const rowData = ordersAvailable?.map(order => ({
    id: order.id,
    drugIndex: order.drugIndex,
    pharmacy: order.pharmacy,
    distributor: order.distributor,
    status: order.Status,
    
  }));

  const onGridReady = useCallback(params => {
    gridRef.current = params;
    params.api.sizeColumnsToFit();
  }, []);

  const actionsRenderer = useCallback((props) => {
    console.log(props.data)
    return (
    <div style={{ marginBottom:'10px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Button variant="success"  size="sm" onClick={() => {props.onEnd(props.data);}}>end Delivering</Button>
    </div>
    );
  }, []);

  return (
    <div className="ag-theme-material"
    style={{margin:'10%', marginTop:'1px',marginBottom:'10px' , height: '500px', width: '80%' }}>
      <AgGridReact
        columnDefs={gridOptions.columnDefs}
        rowData={gridOptions.rowData}
        onGridReady={onGridReady}
        frameworkComponents={{ actionsRenderer }}
      />
    </div>
  );
}

export default Deleverygrid;
