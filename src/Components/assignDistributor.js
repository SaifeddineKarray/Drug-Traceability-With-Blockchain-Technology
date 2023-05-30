import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import Button from 'react-bootstrap/Button';
import {  startDeliver , Decline ,orderStatus,subscribeToAcceptOrder, getAllOrdersAcceptedassigned, getAllOrdersAcceptednotassigned, assignDistributor} from '../Web3Client';
import {
  collection,
  getDocs,
  doc,
  setDoc, query, where
} from "firebase/firestore";
import { auth,db } from "../firebase-config";

function AssignDistributor({}) {
  const [gridOptions, setGridOptions] = useState({
    columnDefs: [
      { headerName: "ID", field: "id", sortable: true, filter: true },
      { headerName: "Drug Index", field: "drugIndex", sortable: true, filter: true },
      { headerName: "Quantity", field: "quantity", sortable: true, filter: true },
      { headerName: "Pharmacy", field: "pharmacy", sortable: true, filter: true },
      { headerName: "manufacturer", field: "manufacturer", sortable: true, filter: true },
      {
        headerName: "Actions",
        cellRenderer: "actionsRenderer",
        cellRendererParams: {
          onAssign: async (row) => {
            console.log("assign:", row);
            // const accept = await assignDistributor(row.id);
            const d = await startDeliver(row.id)
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
      const orders = await getAllOrdersAcceptednotassigned();
      const filteredOrders = orders.filter(order => order.pharmacy != "0x0000000000000000000000000000000000000000");
      setOrdersAvailable(filteredOrders);
      const data = await getDocs(usersCollectionRef);
      const users = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      const orderdata = filteredOrders.map(order => ({
        ...order,
        manufacturer: users.find(item => item.wallet.toLowerCase() === order.manufacturer.toLowerCase())?.name || order.manufacturer,
        pharmacy: users.find(item => item.wallet.toLowerCase() === order.pharmacy.toLowerCase())?.name || order.pharmacy,
      }));
    
      setGridOptions({ ...gridOptions, rowData: orderdata });
    }
    fetchOrders();
  }, []);
  const rowData = ordersAvailable?.map(order => ({
    id: order.id,
    drugIndex: order.drugIndex,
    pharmacy: order.pharmacy,
    distributor: order.distributor,
    quantity: order.quantity,
    manufacturer: order.manufacturer
  }));

  const onGridReady = useCallback(params => {
    gridRef.current = params;
    params.api.sizeColumnsToFit();
  }, []);

  const actionsRenderer = useCallback((props) => {
    return (
    <div style={{ marginBottom:'10px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Button variant="success" size="sm" onClick={() => props.onAssign(props.data)}>Assign</Button>
    </div>
    );
  }, []);

  return (
    <div className="ag-theme-material"
    style={{margin:'5%', marginTop:'10px' , height: '400px', width: '90%' }}>
      <AgGridReact
        columnDefs={gridOptions.columnDefs}
        rowData={gridOptions.rowData}
        onGridReady={onGridReady}
        frameworkComponents={{ actionsRenderer }}
      />
    </div>
  );
}

export default AssignDistributor;
