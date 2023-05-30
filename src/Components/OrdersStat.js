import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import Button from 'react-bootstrap/Button';
import { getAllOrdersAcceptedDeclinedDel, isOrderDelivering,isOrderDeclined,isOrderAccepted ,isOrderOrdered} from '../Web3Client';
import { collection, getDocs, doc, setDoc, query, where } from "firebase/firestore";
import { auth, db } from "../firebase-config";

function OrdersStat({}) {
  const [gridOptions, setGridOptions] = useState({
    columnDefs: [
      { headerName: "ID", field: "id", sortable: true, filter: true },
      { headerName: "Quantity", field: "quantity", sortable: true, filter: true },
      { headerName: "Drug Index", field: "drugIndex", sortable: true, filter: true },
      { headerName: "Manufacturer", field: "manufacturer", sortable: true, filter: true },
      { headerName: "Distributor", field: "distributor", sortable: true, filter: true },
      { headerName: "Status", field: "status", sortable: true, filter: true },
    ],
    rowData: [],
  });

  const gridRef = useRef();
  const [ordersAvailable, setOrdersAvailable] = useState([]);
  const usersCollectionRef = collection(db, "users");
  
  useEffect(() => {
    const fetchOrders = async () => {
      const orders = await getAllOrdersAcceptedDeclinedDel();
      const filteredOrders = orders.filter(order => order.pharmacy !== "0x0000000000000000000000000000000000000000");
      setOrdersAvailable(filteredOrders);
      const data = await getDocs(usersCollectionRef);
      const users = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      const orderdata = await Promise.all(filteredOrders.map(async order => {
        const status = await (async () => {
          if (await isOrderDelivering(order.id)) {
            return "Delivering";
          } else if (await isOrderDeclined(order.id)) {
            return "Declined";
          } else if (await isOrderAccepted(order.id)) {
            return "Accepted";
          } else if (await isOrderOrdered(order.id)){
            return "Ordered";
          } else {
            return "Completed"
          }
        })();
        return {
          ...order,
          manufacturer: users.find(item => item.wallet.toLowerCase() === order.manufacturer?.toLowerCase())?.name || order.manufacturer,
          distributor: users.find(item => item.wallet.toLowerCase() === order.distributor?.toLowerCase())?.name || order.distributor,
          status: status,
        };
      }));
      setGridOptions({ ...gridOptions, rowData: orderdata });
    };
    fetchOrders();
  }, []);
  

  const rowData = useMemo(() => {
    return ordersAvailable?.map(order => ({
      id: order.id,
      drugIndex: order.drugIndex,
      pharmacy: order.pharmacy,
      distributor: order.distributor,
      status: order.status, 
      quantity: order.quantity,
    }));
  }, [ordersAvailable]);

  const onGridReady = useCallback(params => {
    gridRef.current = params;
    params.api.sizeColumnsToFit();
  }, []);

  return (
    <div className="ag-theme-material"
    style={{margin:'5%', marginTop:'10px',marginBottom:'10px' , height: '500px', width: '90%' }}>
      <AgGridReact
        columnDefs={gridOptions.columnDefs}
        rowData={gridOptions.rowData}
        onGridReady={onGridReady}
      />
    </div>
  );
}

export default OrdersStat;
