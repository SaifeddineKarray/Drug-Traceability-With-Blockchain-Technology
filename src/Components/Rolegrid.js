import React from 'react'
import { useState,useEffect,useCallback,useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import { doc, updateDoc } from "firebase/firestore";
import { db } from '../firebase-config';
import {
    collection,
    getDocs,
    
     query
  } from "firebase/firestore";


export default function Rolegrid(props) {
    const cellEditorSelector = () => {
        
          return {
            component: 'agRichSelectCellEditor',
            params: {
              values: ['admin','distributor', "manufacturer","pharmacy","client"],
            },
            popup: true,
          };
      };
      const gridRef = useRef();
    const [gridOptions, setGridOptions] = useState({
        columnDefs: [
          
          { headerName: "Name", field: "name", sortable: true, filter: true },
          { headerName: "Email", field: "email", sortable: true, filter: true },
          { headerName: "Role", field: "role", sortable: true, filter: true ,editable: true,
          cellEditorSelector:cellEditorSelector,
        },
          { headerName: "Wallet", field: "wallet", sortable: true, filter: true }
        ],
        rowData: []
      });
      useEffect(() => {
        const fetchRoles = async () => {
            const data=[];
            const usersCollectionRef = collection(db, "users");
            const q=query(usersCollectionRef);
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const row={useruid:doc.data.useruid,
                    email:doc.data.email}
                data.push(doc.data());
              });
          
              setGridOptions({ ...gridOptions, rowData: data });
        }
        fetchRoles();
      }, []);
      const onCellEditingStopped = useCallback(async(event) => {
        const userRef = doc(db, 'users',event.data.useruid);
        await updateDoc(userRef, {
            role: event.value
          });
          if (event.data.useruid==props.user?.uid){
            props.setrole(event.value)
          }
        
      }, []);
      const onGridReady = useCallback(params => {
        gridRef.current = params;
        params.api.sizeColumnsToFit();
      }, []);
  return (
    <div className="ag-theme-alpine" style={{margin:'5%', marginTop:'10px' , height: '400px', width: '90%' }}>
    <AgGridReact
      columnDefs={gridOptions.columnDefs}
      rowData={gridOptions.rowData}
      onCellEditingStopped={onCellEditingStopped}
      onGridReady={onGridReady}
    />
  </div>
  )
}
