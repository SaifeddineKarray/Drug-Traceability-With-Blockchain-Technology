import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import "ag-grid-community";
import '../App.css';
import {getDrug } from '../Web3Client.js';
import QRCode from 'qrcode';
import './CSS/Market.css';
import { useParams } from 'react-router-dom';
import {
  collection,
  getDocs,
  doc,
  setDoc, query, where
} from "firebase/firestore";
import { auth,db } from "../firebase-config";

function DrugDetails() {
    const { id } = useParams();
    const printPDF = async() => {
        const Drug = await getDrug(id);
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage();
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica, { subset: true });
          font.encodeText('UTF-8');
          const usersCollectionRef = collection(db, "users")
          const dataa = await getDocs(usersCollectionRef);
          const  users=dataa.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
          const ManuName = users.find(item => item.wallet.toLowerCase() === Drug.manufacturer.toLowerCase())?.name || Drug.manufacturer;
          const PharmName= users.find(item => item.wallet.toLowerCase() === Drug.pharmacy?.toLowerCase())?.name || Drug.pharmacy;
          const DistributorName= users.find(item => item.wallet.toLowerCase() === Drug.distributor?.toLowerCase())?.name || Drug.distributor;
          const fontSize = 12;
          const headerText = `Drug Invoice for Order ID: ${id}`;
          const headerTextWidth = font.widthOfTextAtSize(headerText, fontSize);
          const headerTextHeight = font.heightAtSize(fontSize);
          const drugText = `Drug Name: ${Drug.name} Price: ${Drug.price}`;
          const drugText1 = `Manufacturer: ${ManuName}`;
          const drugText2=`Pharmacy: ${PharmName}`;
          const qrCodeDataUrl = await QRCode.toDataURL('localhost:3000/drug/'+Drug.id);
          const pngImage = await pdfDoc.embedPng(qrCodeDataUrl);
          const drugText3 = `Creation Date: ${Drug.date}` ;
          const drugText4=`Distributor: ${DistributorName}`;
          const drugTextLines = drugText.split('\n');
          const drugTextWidth = font.widthOfTextAtSize(drugText, fontSize);
          const drugTextHeight = font.heightAtSize(fontSize);
          const borderColor = rgb(0.2, 0.2, 0.2);
          const backgroundColor = rgb(0.9, 0.9, 0.9);
          const borderPadding = 10;
          const borderHeight = drugTextHeight * 5 + borderPadding * 2;
          const borderWidth = drugTextWidth + borderPadding * 2;
          page.drawRectangle({
            x: page.getWidth()  - borderWidth / 2,
            y: page.getHeight()  - borderHeight / 2,
            width: borderWidth,
            height: borderHeight,
            borderWidth: 2,
            borderColor: borderColor,
            backgroundColor: backgroundColor,
          });
          page.drawText(headerText, {
            x: page.getWidth() / 2 - headerTextWidth / 2,
            y: page.getHeight() - 50,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          page.drawText(drugText, {
            x: drugTextWidth / 2,
            y: page.getHeight() / 2 - drugTextHeight / 2,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          page.drawText(drugText1, {
            x:  drugTextWidth / 2,
            y: page.getHeight() / 2 - drugTextHeight / 2-10,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          page.drawText(drugText2, {
            x:  drugTextWidth / 2,
            y: page.getHeight() / 2 - drugTextHeight / 2 -20,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          page.drawText(drugText3, {
            x:  drugTextWidth / 2,
            y: page.getHeight() / 2 - drugTextHeight / 2-30,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          page.drawText(drugText4, {
            x:  drugTextWidth / 2,
            y: page.getHeight() / 2 - drugTextHeight / 2-40,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          const qrCodeDims = pngImage.scale(0.5);
          page.drawImage(pngImage, {
          x: 200,
          y: 400,
          width: qrCodeDims.width,
          height: qrCodeDims.height,
        });       
          const pdfBytes = await pdfDoc.save();
          const pdfUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
          const printWindow = window.open(pdfUrl);
          printWindow.onload = () => {
            printWindow.print();
            URL.revokeObjectURL(pdfUrl);
          };
        }
         useEffect(() => {
            printPDF();
          }, []);
          return (
            <div>
                
            </div>
          )
    
}

export default DrugDetails;