import SupplyContractBuild from 'contracts/SupplyChain.json';
import Web3 from 'web3';
import ClientContract from 'contracts/Client.json';
import ManufacturerContract from 'contracts/Manufacturer.json'
import PhContract from 'contracts/Pharmacy.json'
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import {
  collection,
  getDocs,
  doc,
  setDoc, query, where
} from "firebase/firestore";
const web3 = new Web3('http://localhost:7545'); 

export let selectedAccount;
let supplyContract;
let clientContract;
let Clientrole;
let isInitialized = false;
let manufacturerContract;
let ManuRole;
let phContract;
let PhRole; 

export const init = async () => {
	let provider = window.ethereum;

	if (typeof provider !== 'undefined') {
		provider
			.request({ method: 'eth_requestAccounts' })
			.then((accounts) => {
				console.log(accounts);
				selectedAccount = accounts[0];
				console.log(`Selected account is ${selectedAccount}`);
			})
			.catch((err) => {
				console.log(err);
				return;
			});

		window.ethereum.on('accountsChanged', function (accounts) {
			selectedAccount = accounts[0];
			console.log(`Selected account changed to ${selectedAccount}`);
		});
	}
	const web3 = new Web3(provider);
	const networkId = await web3.eth.net.getId();
	 supplyContract = new web3.eth.Contract(
	 	SupplyContractBuild.abi,
	 	SupplyContractBuild.networks[networkId].address
	 );
	isInitialized = true;
};

export const isClient = async (Adress) => {
	if (!isInitialized) {
		await init();
	}
	const isClient = await Clientrole.methods.isClient(Adress).call();
	console.log('isClient:', isClient);
}
export const isManu = async () => {
	if (!isInitialized) {
		await init();
	}
	const isManufacturer = await ManuRole.methods.isManufacturer(selectedAccount).call();
	console.log('isManu:', isManufacturer);
}
export const isPharm = async () => {
	if (!isInitialized) {
		await init();
	}
	const isPharm = await PhRole.methods.isPharmacie(selectedAccount).call();
	console.log('isPharm:', isPharm);
}

export const deployClientContract = async () => {
	if (!isInitialized) {
		await init();
	}
	const web3 = new Web3(window.ethereum);
	clientContract = new web3.eth.Contract(
		ClientContract.abi,
		{ from: selectedAccount },
	);
	const deployedContract = await clientContract
		.deploy({
			data: ClientContract.bytecode,
			arguments: [],
		})
		.send({
			from: selectedAccount,
			gas: '5000000',
			gasPrice: web3.utils.toWei('20', 'gwei'),
		});
	console.log(`Contract deployed at ${deployedContract.options.address}`);
	
	Clientrole = new web3.eth.Contract(
		ClientContract.abi,
		deployedContract.options.address
	);
	
};
export const deployManufacturerContract = async () => {
	if (!isInitialized) {
		await init();
	}
	const web3 = new Web3(window.ethereum);
	manufacturerContract = new web3.eth.Contract(
		ManufacturerContract.abi,
		{ from: selectedAccount },
	);
	const deployedContract = await manufacturerContract
		.deploy({
			data: ManufacturerContract.bytecode,
			arguments: [],
		})
		.send({
			from: selectedAccount,
			gas: '5000000',
			gasPrice: web3.utils.toWei('20', 'gwei'),
		});
	console.log(`Contract Manu deployed at ${selectedAccount}`);
	
	ManuRole = new web3.eth.Contract(
		ManufacturerContract.abi,
		deployedContract.options.address
	);
	
	await isManu();
};
export const deployPh = async () => {
	if (!isInitialized) {
		await init();
	}
	const web3 = new Web3(window.ethereum);
	phContract = new web3.eth.Contract(
		PhContract.abi,
		{ from: selectedAccount },
	);
	const deployedContract = await phContract
		.deploy({
			data: PhContract.bytecode,
			arguments: [],
		})
		.send({
			from: selectedAccount,
			gas: '5000000',
			gasPrice: web3.utils.toWei('20', 'gwei'),
		});
	console.log(`Contract Manu deployed at ${selectedAccount}`);
	
	PhRole = new web3.eth.Contract(
		PhContract.abi,
		deployedContract.options.address
	);
	
	await isPharm();
};


// export const isClient = async () => {
// 	if (!isInitialized) {
// 		await init();
// 	}
// 	const web3 = new Web3(window.ethereum);
// 	const networkId = await web3.eth.net.getId();
// 	const rolesInstance = new web3.eth.Contract(
// 		ClientContract.abi,
// 		ClientContract.networks[networkId].address
// 	);

// 	return rolesInstance.methods.isClient(selectedAccount).call();
// };
export const createDrug = async (name, description, dosageInformation, activeIngredients, adverseReactions, instrucForUse, price, tempC, quantity, expdate, date) => {
	await init();
	const createTx = await supplyContract.methods
	  .drugCreate(name, description, dosageInformation, activeIngredients, adverseReactions, instrucForUse, price, tempC, quantity, expdate, date)
	  .send({
		from: selectedAccount,
		value: web3.utils.toWei('0.01', 'ether')
	  });
	const num = await supplyContract.methods.getDrugsNumber().call();
	const drug = await supplyContract.methods.drugs(num - 1).call();
	return drug;
  };
  
export const buyDrug = async (id) => {
	if (!isInitialized) {
	  await init();
	}

  const drug = await getDrug(id);
  const valueInEther = drug.price/1905;
  const valueInWei = web3.utils.toWei(valueInEther.toFixed(6), 'ether');
	const result = await supplyContract.methods
	  .buyDrug(id)
	  .send({ from: selectedAccount,
	value: valueInWei});
	return result;
  };
//  export const giveClientRole = async () => {
// 	if (!isInitialized) {
// 		 await init();
// 	}
//     return  instance.isClient(selectedAccount).call();

//   };
export const order = async (id,quantity) => {
	if (!isInitialized) {
	  await init();
	}
	const order=await getOrder(id);
	const drug = await getDrug(order.id);
	
	const result = await supplyContract.methods
	  .orderDrug(id,quantity)
	  .send({ from: selectedAccount,
		value: web3.utils.toWei((drug.price*quantity/1905).toString(), 'ether')});
	return result;
  };
  export const assignDistributor = async (id) => {
	if (!isInitialized) {
	  await init();
	}
  
	const result = await supplyContract.methods
	  .setDistributor(id)
	  .send({ from: selectedAccount });
  
	return result;
  };
  export const startDeliver = async (id) => {
	if (!isInitialized) {
	  await init();
	}
  
	const result = await supplyContract.methods
	  .startDeliverdrug(id)
	  .send({ from: selectedAccount });
  
	return result;
  };
  export const priceChanger = async (id,price) => {
	if (!isInitialized) {
	  await init();
	}
  
	const result = await supplyContract.methods
	  .priceChanger(id,price)
	  .send({ from: selectedAccount });
  
	return result;
  };
  export const endDeliver = async (id) => {
	if (!isInitialized) {
	  await init();
	}
  
	const result = await supplyContract.methods
	  .endDelivering(id)
	  .send({ from: selectedAccount });
  
	return result;
  };
  export const orderReceived = async (id) => {
	if (!isInitialized) {
	  await init();
	}
	const drug = await getDrug(id);
	const result = await supplyContract.methods
	  .orderReceived(id)
	  .send({ from: selectedAccount ,
	value : web3.utils.toWei((drug.price*drug.quantity*0.1/1905).toString(), 'ether')});
	return result;
  };
  export const Accept = async (id) => {
	if (!isInitialized) {
		await init();
	}

   const result = await supplyContract.methods
	   .AcceptOrder(id)
		.send({ from: selectedAccount });
	return result;
};
export const listDrug = async (id) => {
	if (!isInitialized) {
		await init();
	}

   const result = await supplyContract.methods
	   .listDrugs(id)
		.send({ from: selectedAccount });
	return result;
};
export const listDrugLot = async (id) => {
	if (!isInitialized) {
		await init();
	}

   const result = await supplyContract.methods
	   .listDrugLot(id)
		.send({ from: selectedAccount });
	return result;
};
export const unlistDrug = async (id) => {
	if (!isInitialized) {
		await init();
	}

   const result = await supplyContract.methods
	   .unlistDrug(id)
		.send({ from: selectedAccount });
	return result;
};
export const unlistDrugLot = async (id) => {
	if (!isInitialized) {
		await init();
	}

   const result = await supplyContract.methods
	   .unlistDrugLot(id)
		.send({ from: selectedAccount });
	return result;
};
export const isListed = async (id) => {
	if (!isInitialized) {
		await init();
	}

   const result = await supplyContract.methods
	   .isListed(id)
		.call();
	return result;
};

export const isOrderAccepted = async (id) => {
	if (!isInitialized) {
		await init();
	}

   const result = await supplyContract.methods
	   .isOrderAccepted(id)
		.call();
	return result;
};
export const isOrderDeclined = async (id) => {
	if (!isInitialized) {
		await init();
	}

   const result = await supplyContract.methods
	   .isOrderDeclined(id)
		.call();
	return result;
};
export const isOrderDelivering = async (id) => {
	if (!isInitialized) {
		await init();
	}

   const result = await supplyContract.methods
	   .isOrderDelivering(id)
		.call();
	return result;
};
export const isOrderOrdered = async (id) => {
	if (!isInitialized) {
		await init();
	}

   const result = await supplyContract.methods
	   .isOrderOrdered(id)
		.call();
	return result;
};
export const orderStatus = async (id) => {
	if (!isInitialized) {
		await init();
	}

   const result = await supplyContract.methods
	   .getOrderStatus(id)
		.call();
	return result;
};
export const Decline = async (id) => {
	if (!isInitialized) {
		await init();
	}
const order = getOrder(id);
const drug = getDrug(order.drugIndex);
   const result = await supplyContract.methods
	   .DeclineOrder(id)
		.send({ from: selectedAccount ,
			value: web3.utils.toWei((drug.price*order.quantity/1905).toString(), 'ether')});
	return result;
};




export const DrugNum = async () => {
	if (!isInitialized) {
		await init();
	}

   return supplyContract.methods
	   .getDrugsNumber()
		.call();
};
export const getDrugsAvailable = async () => {
    if (!isInitialized) {
        await init();
    }

    const drugsAvailable = await supplyContract.methods.getAllDrug().call();
    const drugsAvailableObj = drugsAvailable.map((drug) => ({
        id: drug.id,
        name: drug.name,
        description: drug.description,
        price: drug.price ,
		manufacturer: drug.manufacturer ,
		tempC : drug.tempC,
		quantity : drug.quantity,
		date: drug.date

	  }));
    return drugsAvailableObj;
};


export function subscribeToDrugAdded(callback) {
	if (supplyContract) {
	  supplyContract.events.DrugAdded()
		.on('data', callback)
		.on('error', console.error);
	}
  }
  export const getDrug = async (id) => {
	if (!isInitialized) {
		await init();
	}

   return supplyContract.methods
	   .getDrug(id)
		.call();
};
export const getOrdersAvailable = async () => {
    if (!isInitialized) {
        await init();
    }

    const OrdersAvailable = await supplyContract.methods.getAllOrders(selectedAccount).call();
    const OrdersAvailableObj = OrdersAvailable.map((order) => ({
        id: order.id,
        drugIndex: order.drugIndex,
        pharmacy: order.pharmacy,
		quantity:order.quantity
		

	  }));
    return OrdersAvailableObj;
};

export function subscribeToOrderAdded(callback) {
	if (supplyContract) {
	  supplyContract.events.OrderAdded()
		.on('data', callback)
		.on('error', console.error);
	}
  }
  export const getOrder = async (id) => {
	if (!isInitialized) {
		await init();
	}

   return supplyContract.methods
	   .getOrder(id)
		.call();
};

  

  export const getAllOrdersOrdred = async () => {
    if (!isInitialized) {
        await init();
    }

    const ordersAvailable = await supplyContract.methods.getAllOrdersOrdred(selectedAccount).call();
    const orderssAvailableObj = ordersAvailable.map((order) => ({
		id: order.id ,
		drugIndex:order.drugIndex,
		pharmacy:order.pharmacy,
		distributor:order.distributor,
		Status:order.Status,
		quantity:order.quantity
	  }));
    return orderssAvailableObj;
};


export const getAllOrdersAcceptednotassigned = async () => {
    if (!isInitialized) {
        await init();
    }

    const ordersAvailable = await supplyContract.methods.getAllOrdersAccepted("0x0000000000000000000000000000000000000000").call();
    const orderssAvailableObj = ordersAvailable.map((order) => ({
		id: order.id ,
		drugIndex:order.drugIndex,
		pharmacy:order.pharmacy,
		distributor:order.distributor,
		quantity: order.quantity,
		manufacturer:order.manufacturer
	  }));
    return orderssAvailableObj;
};
export const getAllOrdersAcceptedassigned = async () => {
    if (!isInitialized) {
        await init();
    }

    const ordersAvailable = await supplyContract.methods.getAllOrdersAccepted(selectedAccount).call();
    const orderssAvailableObj = ordersAvailable.map((order) => ({
		...order
	  }));
    return orderssAvailableObj;
};
export const getAllOrdersAcceptedDeclinedDel = async () => {
    if (!isInitialized) {
        await init();
    }

    const ordersAvailable = await supplyContract.methods.getAllOrdersAcceptedDeclinedDel(selectedAccount).call();
    const orderssAvailableObj = ordersAvailable.map((order) => ({
		...order
	  }));
    return orderssAvailableObj;
};
export function subscribeToAcceptOrder(callback) {
	if (supplyContract) {
	  supplyContract.events.OrderAccepted()
		.on('data', callback)
		.on('error', console.error);
	}
  }
  export const accept = async (id) => {
	if (!isInitialized) {
		await init();
	}

   return supplyContract.methods
	   .getAccepted(id)
		.call();
};

export const getAllListedDrugs = async () => {
    if (!isInitialized) {
        await init();
    }

    const drugsAvailable = await supplyContract.methods.getAllListedDrugs().call();
    const drugsAvailableObj = drugsAvailable.map((drug) => ({
        id: drug.id,
        name: drug.name,
        description: drug.description,
        price: drug.price ,
		manufacturer: drug.manufacturer ,
		pharmacy : drug.pharmacy,
		ownerId: drug.ownerId,
		tempC : drug.tempC,
		quantity : drug.quantity,
		date: drug.date

	  }));
    return drugsAvailableObj;
};

export const getAllDeliveredDrugs = async () => {
    if (!isInitialized) {
        await init();
    }

    const drugsAvailable = await supplyContract.methods.getAllDeliveredDrugs(selectedAccount).call();
    const drugsAvailableObj = drugsAvailable.map((drug) => ({
        id: drug.id,
        name: drug.name,
        description: drug.description,	
        price: drug.price ,
		manufacturer: drug.manufacturer ,
		ownerId: drug.ownerId,
		pharmacy :drug.pharmacy,
		distributor :drug.distributor,
		tempC : drug.tempC,
		quantity : drug.quantity,
		date: drug.date,


	  }));
    return drugsAvailableObj;
};

export const Facture = async (row,gridRef,usersCollectionRef) => {
	console.log("Accepted order:", row);
	const Drug = await getDrug(row.id)
	console.log(row.id);     
	const pdfDoc = await PDFDocument.create();
	const page = pdfDoc.addPage();
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica, { subset: true });
	font.encodeText('UTF-8');
	const dataa = await getDocs(usersCollectionRef);
	const  users=dataa.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
	const ManuName = users.find(item => item.wallet.toLowerCase() === Drug.manufacturer.toLowerCase())?.name || Drug.manufacturer;
	const PharmName= users.find(item => item.wallet.toLowerCase() === Drug.pharmacy?.toLowerCase())?.name || Drug.pharmacy;
	const DistributorName= users.find(item => item.wallet.toLowerCase() === Drug.distributor?.toLowerCase())?.name || Drug.distributor;
	const fontSize = 12;
	const headerText = `Drug Invoice for Order ID: ${row.id}`;
	const headerTextWidth = font.widthOfTextAtSize(headerText, fontSize);
	const headerTextHeight = font.heightAtSize(fontSize);
	const drugText = `Drug Name: ${Drug.name} Price: ${Drug.price}`;
	const drugText1 = `Manufacturer: ${ManuName}`;
	const drugText11 = `Manufacturer public key: ${Drug.manufacturer}`;

	const drugText2=`Pharmacy: ${PharmName}`;
	const drugText22=`Pharmacy public key: ${Drug.pharmacy}`;

	const qrCodeDataUrl = await QRCode.toDataURL('localhost3000/'+Drug.id);
	const pngImage = await pdfDoc.embedPng(qrCodeDataUrl);
	const drugText3 = `Creation Date: ${Drug.date}` ;
	const drugText9=`Distributor: ${DistributorName}`;
	const drugText99=`Distributor public key: ${Drug.distributor}`;


	const drugText4=`Dosage Information: ${Drug.dosage_information.replace(/(.{100})/g, '$1\n')}}`;
	const drugText5=`Active Ingredients: ${Drug.active_ingredients.replace(/(	.{100})/g, '$1\n')}\n`;
	const drugText6=`\nInstruc For Use: ${Drug.instruc_foruse.replace(/(.{60})/g, '$1\n')}`;
	const drugText7=`\nAdverse Reactions: ${Drug.adverse_reactions.replace(/(.{60})/g, '$1\n')}\n`;
	const drugText8=`\nExpiration date: ${Drug.expdate}`;
	const drugTextLines = drugText.split('\n');
	const drugTextWidth = font.widthOfTextAtSize(drugText, fontSize);
	const drugTextHeight = font.heightAtSize(fontSize);
	page.drawText(headerText, {
	  x: page.getWidth() / 2 - headerTextWidth / 2,
	  y: page.getHeight() - 50,
	  size: fontSize,
	  font: font,
	  color: rgb(0, 0, 0),
	});
	page.drawText(drugText, {
	  x: drugTextWidth / 2,
	  y: page.getHeight()-255 - drugTextHeight / 2+20,
	  size: fontSize,
	  font: font,
	  color: rgb(0, 0, 0),
	});
	page.drawText(drugText1, {
	  x:  drugTextWidth / 2,
	  y:  page.getHeight()-255 - drugTextHeight / 2-10,
	  size: fontSize,
	  font: font,
	  color: rgb(0, 0, 0),
	});
	page.drawText(drugText11, {
		x:  drugTextWidth / 2,
		y:  page.getHeight()-255 - drugTextHeight / 2-25,
		size: fontSize,
		font: font,
		color: rgb(0, 0, 0),
	  });
	page.drawText(drugText2, {
	  x:  drugTextWidth / 2,
	  y:  page.getHeight()-255 - drugTextHeight / 2 -40,
	  size: fontSize,
	  font: font,
	  color: rgb(0, 0, 0),
	});
	page.drawText(drugText22, {
		x:  drugTextWidth / 2,
		y:  page.getHeight()-255 - drugTextHeight / 2 -55,
		size: fontSize,
		font: font,
		color: rgb(0, 0, 0),
	  });
	page.drawText(drugText3, {
	  x:  drugTextWidth / 2,
	  y:  page.getHeight()-255 - drugTextHeight / 2-100,
	  size: fontSize,
	  font: font,
	  color: rgb(0, 0, 0),
	});
	page.drawText(drugText9, {
		x:  drugTextWidth / 2,
		y:  page.getHeight()-255 - drugTextHeight / 2-70,
		size: fontSize,
		font: font,
		color: rgb(0, 0, 0),
	  });
	  page.drawText(drugText99, {
		x:  drugTextWidth / 2,
		y:  page.getHeight()-255 - drugTextHeight / 2-85,
		size: fontSize,
		font: font,
		color: rgb(0, 0, 0),
	  });
	page.drawText(drugText4, {
	  x:  drugTextWidth / 2,
	  y:  page.getHeight()-255 - drugTextHeight / 2-130,
	  size: fontSize,
	  font: font,
	  color: rgb(0, 0, 0),
	});
	page.drawText(drugText5, {
		x:  drugTextWidth / 2,
		y:  page.getHeight()-255 - drugTextHeight / 2-160,
		size: fontSize,
		font: font,
		color: rgb(0, 0, 0),
	  });
	  page.drawText(drugText6, {
		x:  drugTextWidth / 2,
		y:  page.getHeight()-255 - drugTextHeight / 2-190,
		size: fontSize,
		font: font,
		color: rgb(0, 0, 0),
	  });
	  page.drawText(drugText7, {
		x:  drugTextWidth / 2,
		y:  page.getHeight()-255 - drugTextHeight / 2-230,
		size: fontSize,
		font: font,
		color: rgb(0, 0, 0),
	  });
	  page.drawText(drugText8, {
		x:  drugTextWidth / 2,
		y:  page.getHeight()-255 - drugTextHeight / 2-270,
		size: fontSize,
		font: font,
		color: rgb(0, 0, 0),
	  });
	const qrCodeDims = pngImage.scale(0.5);
	page.drawImage(pngImage, {
	x: 500,
	y:  page.getHeight()-255 - drugTextHeight / 2-390,
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
	gridRef.current.api.refreshCells({ rowNodes: [row] });
  }
export const getAllDeliveredReceivedListedDrugs = async () => {
    if (!isInitialized) {
        await init();
    }

    const drugsAvailable = await supplyContract.methods.getAllDeliveredListedDrugs(selectedAccount).call();
    const drugsAvailableObj = drugsAvailable.map((drug) => ({
        id: drug.id,
        name: drug.name,
        description: drug.description,	
        price: drug.price ,
		manufacturer: drug.manufacturer ,
		ownerId: drug.ownerId,
		pharmacy :drug.pharmacy,
		distributor :drug.distributor,
		tempC : drug.tempC,
		quantity : drug.quantity,
		date: drug.date

	  }));
    return drugsAvailableObj;
};
