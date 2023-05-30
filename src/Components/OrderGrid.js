import React, { useCallback,  useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import Button from 'react-bootstrap/Button';
import { getOrdersAvailable, Accept , Decline ,orderStatus,subscribeToAcceptOrder} from '../Web3Client';
import {collection,getDocs,doc,setDoc, query, where} from "firebase/firestore";
import { auth,db } from "../firebase-config";

function OrderGrid({}) {
  const [gridOptions, setGridOptions] = useState({
    columnDefs: [
      { headerName: "ID", field: "id", sortable: true, filter: true },
      { headerName: "Quantity", field: "quantity", sortable: true, filter: true },
      { headerName: "Drug Index", field: "drugIndex", sortable: true, filter: true },
      { headerName: "Pharmacy", field: "pharmacy", sortable: true, filter: true },
      {
        headerName: "Actions",
        cellRenderer: "actionsRenderer",
        cellRendererParams: {
          onAccept: async (row) => {
            console.log("Accepted order:", row);
            const accept = await Accept(row.id);
            console.log(console.log(row.id));
            gridRef.current.api.applyTransaction({ remove: [row] });
          },
          onDecline: async (row) => {
            console.log("Declined order:", row);
            const accept = await Decline(row.id);
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
      const orders = await getOrdersAvailable();
      const filteredOrders = orders.filter(order => order.pharmacy != "0x0000000000000000000000000000000000000000");
      setOrdersAvailable(filteredOrders);
      const data = await getDocs(usersCollectionRef);
      const users = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      console.log(filteredOrders)
      const orderdata = filteredOrders.map(order => ({
        ...order,
        pharmacy: users.find(item => item.wallet.toLowerCase() === order.pharmacy?.toLowerCase())?.name || order.pharmacy,

      }));
      setGridOptions({ ...gridOptions, rowData: orderdata });
    }
    fetchOrders();
    const unsubscribe = subscribeToAcceptOrder(() => {
      fetchOrders();
    });

    return unsubscribe;
  }, []);
  const rowData = ordersAvailable?.map(order => ({
    id: order.id,
    drugIndex: order.drugIndex,
    pharmacy: order.pharmacy,
    distributor: order.distributor,
    Status: order.Status,
    quantity:order.quantity,
  }));

  const onGridReady = useCallback(params => {
    gridRef.current = params;
    params.api.sizeColumnsToFit();
  }, []);

  const actionsRenderer = useCallback((props) => {
    return (
    <div style={{ marginBottom:'10px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Button variant="success" size="sm" onClick={() => props.onAccept(props.data)}>Accept</Button>
      <Button variant="danger" size="sm" onClick={() => props.onDecline(props.data)}>Decline</Button>
    </div>
    );
  }, []);

  return (
    <div className="ag-theme-material"
    style={{margin:'5%', marginTop:'10px',marginBottom:'10px' , height: '500px', width: '90%' }}>
      <AgGridReact
        columnDefs={gridOptions.columnDefs}
        rowData={gridOptions.rowData}
        onGridReady={onGridReady}
        frameworkComponents={{ actionsRenderer }}
      />
    </div>
  );
}

export default OrderGrid;
