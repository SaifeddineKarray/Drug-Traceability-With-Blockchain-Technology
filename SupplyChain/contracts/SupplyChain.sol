// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract SupplyChain {
    enum OrderStatus {Ordered ,Accepted , Declined, Delivering,Completed}
    enum Status {Created ,ListedLot ,Ordered , Delivering,Received , Delivered,Listed, Sold }
    mapping(uint => Drug) public drugs; 
    uint public drugsNumber=0;  
    mapping(uint => Order) public orders; 
    uint public orderNumber=0;   
    struct Drug {
        uint id ;
        string name;
        string description;
        string dosage_information;
        string active_ingredients;
        string adverse_reactions;
        string instruc_foruse;
        address manufacturer;
        address ownerID;
        address pharmacy;
        address distributor;
        int price;
        Status Status;
        int tempC;
        int quantity;
        string expdate;
        string date;

    }
    struct Order{
        uint id ;
        uint drugIndex;
        address pharmacy;
        address distributor;
        OrderStatus Status;
        address manufacturer;
        int quantity;

    }
    constructor(){       

    }
    function getDrugsNumber() public view returns (uint) {
    return drugsNumber;
}   
function getDrug (uint id)public view returns(Drug memory){
    return drugs[id];
}
function getOrder (uint id)public view returns(Order memory){
    return orders[id];
}
function getAllDrug() public view returns (Drug[] memory) {
    Drug[] memory drugsAvailable = new Drug[](drugsNumber);
    uint j=0;
    for (uint i = 0; i < drugsNumber; i++) {    
        if ((drugs[i].Status == Status.ListedLot)&&(drugs[i].price != 0)){
        drugsAvailable[j] = drugs[i];
         j++;}
    }
    return drugsAvailable;
}
function getAllListedDrugs() public view returns (Drug[] memory){
        Drug[] memory drugsListed = new Drug[](drugsNumber);
    uint j=0;
    for (uint i = 0; i < drugsNumber; i++) {    
        if ((drugs[i].Status == Status.Listed)&&(drugs[i].price != 0)&&(drugs[i].quantity != 0)){
        drugsListed[j] = drugs[i];
         j++;}
    }
    return drugsListed;
}

function getAllDeliveredListedDrugs(address ad) public view returns (Drug[] memory){
        Drug[] memory drugsDelivered = new Drug[](drugsNumber);
    uint j=0;
    for (uint i = 0; i < drugsNumber; i++) {    
        if (((drugs[i].Status == Status.Listed)||(drugs[i].Status == Status.Received)||(drugs[i].Status == Status.ListedLot)||(drugs[i].Status == Status.Delivered)||(drugs[i].Status == Status.Created)||(drugs[i].Status == Status.Sold))&&(drugs[i].price != 0)&&(drugs[i].quantity != 0)&&(ad==drugs[i].ownerID)){
        drugsDelivered[j] = drugs[i];
         j++;}
    }
    return drugsDelivered;
}
function getAllOrders(address ad) public view returns (Order[] memory) {
    Order[] memory OrdersAvailable = new Order[](orderNumber);
    uint j=0;
    for (uint i = 0; i < orderNumber; i++ ) {    
        if ((orders[i].Status == OrderStatus.Ordered)&&(orders[i].manufacturer==ad)){
        OrdersAvailable[j] = orders[i];
        j++;}
    }
    return OrdersAvailable;
}

function getAllOrdersAccepted(address ad) public view returns (Order[] memory) {
    Order[] memory OrdersAvailable = new Order[](orderNumber);
    uint j=0;
    for (uint i = 0; i < orderNumber; i++ ) {    
        if (((orders[i].Status == OrderStatus.Accepted)||(orders[i].Status == OrderStatus.Delivering))&&(orders[i].distributor==ad)){
        OrdersAvailable[j] = orders[i];
         j++;}
    }
    return OrdersAvailable;
}
function getAllOrdersAcceptedDeclinedDel(address ad) public view returns (Order[] memory) {
    Order[] memory OrdersAvailable = new Order[](orderNumber);
    uint j=0;
    for (uint i = 0; i < orderNumber; i++ ) {    
        if (((orders[i].Status == OrderStatus.Accepted)||(orders[i].Status == OrderStatus.Ordered)||(orders[i].Status == OrderStatus.Declined)||(orders[i].Status == OrderStatus.Delivering))&&(orders[i].pharmacy==ad)){
        OrdersAvailable[j] = orders[i];
         j++;}
    }
    return OrdersAvailable;
}
function getAllStatus() public view returns (Status[] memory) {
    Status[] memory status = new Status[](orderNumber);
   
    for (uint i = 0; i < orderNumber; i++ ) {    
        
        status[orders[i].id] = drugs[orders[i].id].Status;
        
    }
    return status;
}



    modifier orderCond(uint _index){
        require(drugs[_index].manufacturer != msg.sender ,"erroooooooooooor");
    _;
    }
    modifier DeliveringCond(uint _index){
        require(orders[_index].Status == OrderStatus.Accepted);
    _;
    }
    
    modifier AcceptCond(uint _Index){
        require(orders[_Index].Status == OrderStatus.Ordered);
        _;
    }
    modifier BuyCond(uint _Index){
        require(orders[_Index].Status == OrderStatus.Completed);
        require(drugs[orders[_Index].drugIndex].Status == Status.Delivered);
        _;
    }
    modifier nameDrug(string memory _name1,string memory _description1){
        require(bytes(_name1).length > 0, "String must not be empty");
        require(bytes(_description1).length > 0, "String must not be empty");
        _;
    }
event DrugAdded(uint indexed id, string name, string description, address indexed manufacturer, int price);

function drugCreate(string memory name,string memory description,string memory dosageInformation,string memory activeIngredients,string memory adverseReactions,string memory instrucForUse,int price,int tempC,int quantity,string memory expdate,
    string memory date) public payable nameDrug(name, description) returns (Drug memory) {
    Drug memory drug = Drug({
        id: drugsNumber,
        name: name,
        description: description,
        dosage_information: dosageInformation,
        active_ingredients: activeIngredients,
        adverse_reactions: adverseReactions,
        instruc_foruse: instrucForUse,
        manufacturer: msg.sender,
        ownerID: msg.sender,
        pharmacy: 0x0000000000000000000000000000000000000000,
        distributor: 0x0000000000000000000000000000000000000000,
        price: price,
        Status: Status.Created,
        tempC: tempC,
        quantity: quantity,
        expdate: expdate,
        date: date
    });

    drugs[drugsNumber] = drug;
    drugsNumber++;
    emit DrugAdded(drug.id, drug.name, drug.description, drug.manufacturer, drug.price);
    return drug;
}


event OrderAdded(
  uint id,
  uint drugIndex,
  address pharmacy,
  address distributor);

    function orderDrug(uint index , int quantity) public  payable returns(Order memory) {
        Order memory order = Order({
            id : orderNumber ,
            drugIndex : index,
            pharmacy : msg.sender,
            distributor: 0x0000000000000000000000000000000000000000,
            Status : OrderStatus.Ordered,
            manufacturer : drugs[index].manufacturer,
            quantity: quantity
        });
        orders[orderNumber]= order;
        orderNumber++;
        drugs[index].Status = Status.Ordered;
        orders[orderNumber].Status = OrderStatus.Ordered;
        address payable owner = payable(drugs[index].manufacturer);
        owner.transfer(msg.value);
        emit OrderAdded(order.id, order.drugIndex, order.pharmacy, order.distributor);
        return order;
    }
    function priceChanger(uint index , int price) public {
        drugs[index].price = price;
    }
    event OrderAccepted(uint id);
    function AcceptOrder(uint orderIndex) public AcceptCond(orderIndex) {
        int n = drugs[orders[orderIndex].drugIndex].quantity-orders[orderIndex].quantity;
        if (n>0){
            drugs[orders[orderIndex].drugIndex].quantity-=orders[orderIndex].quantity;
            drugs[orders[orderIndex].drugIndex].Status=Status.ListedLot;
            Drug memory drug2 = drugCreate(
                drugs[orders[orderIndex].drugIndex].name,
                drugs[orders[orderIndex].drugIndex].description,
                drugs[orders[orderIndex].drugIndex].dosage_information,
                drugs[orders[orderIndex].drugIndex].active_ingredients,
                drugs[orders[orderIndex].drugIndex].adverse_reactions,
                drugs[orders[orderIndex].drugIndex].instruc_foruse,
                drugs[orders[orderIndex].drugIndex].price,
                drugs[orders[orderIndex].drugIndex].tempC,
                orders[orderIndex].quantity,
                drugs[orders[orderIndex].drugIndex].expdate,
                drugs[orders[orderIndex].drugIndex].date
            );
            drug2.manufacturer=drugs[orders[orderIndex].drugIndex].manufacturer;
            drug2.Status=Status.Ordered;
            drugs[drug2.id]=drug2;
            orders[orderIndex].drugIndex=drug2.id; 
            drugs[drug2.id].quantity=orders[orderIndex].quantity;            
            orders[orderIndex].Status=OrderStatus.Accepted;
            drugs[drug2.id].ownerID= orders[orderIndex].pharmacy;
            drugs[drug2.id].pharmacy= orders[orderIndex].pharmacy;
            orders[orderIndex].manufacturer = drugs[orders[orderIndex].drugIndex].manufacturer;
        }
        else if(n==0){
            orders[orderIndex].Status = OrderStatus.Accepted;
            drugs[orders[orderIndex].drugIndex].pharmacy= orders[orderIndex].pharmacy;
        }
        else {
            drugs[orders[orderIndex].drugIndex].Status=Status.ListedLot;
            orders[orderIndex].Status = OrderStatus.Declined;
        }
        emit OrderAccepted(orderIndex);
    }
    function DeclineOrder(uint orderIndex) public payable AcceptCond(orderIndex) {
    drugs[orders[orderIndex].drugIndex].Status=Status.ListedLot;
    orders[orderIndex].Status = OrderStatus.Declined;
    address payable owner = payable(orders[orderIndex].pharmacy);
    owner.transfer(msg.value);
    }
    function startDeliverdrug(uint orderIndex) public DeliveringCond(orderIndex) {
        orders[orderIndex].distributor = msg.sender;
        uint index = orders[orderIndex].drugIndex;
        drugs[index].Status = Status.Delivering;
        drugs[index].distributor = orders[orderIndex].distributor;
        orders[orderIndex].Status=OrderStatus.Delivering;


    }
    modifier orderReceivedCond(uint _Index){
        require(drugs[_Index].Status == Status.Delivered);
        _;
    }
    function orderReceived(uint Index) payable public orderReceivedCond(Index){
        drugs[Index].Status=Status.Received;
        address payable owner = payable(drugs[Index].distributor);
        owner.transfer(msg.value);
    }

    function endDelivering(uint orderIndex)  public{
        uint index = orders[orderIndex].drugIndex;
        orders[orderIndex].Status = OrderStatus.Completed;
        drugs[index].Status = Status.Delivered;
        drugs[index].ownerID = orders[orderIndex].pharmacy;
        orders[orderIndex].Status = OrderStatus.Declined;
    }

    function buyDrug(uint index) public payable{
        drugs[index].quantity = drugs[index].quantity-1 ;
        Drug memory drug2 = drugCreate(
            drugs[index].name,
            drugs[index].description,
            drugs[index].dosage_information,
            drugs[index].active_ingredients,
            drugs[index].adverse_reactions,
            drugs[index].instruc_foruse,
            drugs[index].price,
            drugs[index].tempC,
            drugs[index].quantity,
            drugs[index].date,
            drugs[index].expdate

        );
        drugs[drug2.id].Status = Status.Sold;
        drugs[drug2.id].quantity = 1;
        address payable owner = payable(drugs[drug2.id].pharmacy);
        owner.transfer((uint256)(msg.value));
        if(drugs[index].quantity==0){
        drugs[index].Status = Status.Sold;
        }
        drugs[drug2.id].ownerID = msg.sender;
    }
    modifier listCond(uint _Index){
    require(drugs[_Index].Status == Status.Received);
     _;
    }
    function listDrugs(uint index) public listCond(index){
        drugs[index].Status = Status.Listed;
    }
    function listDrugLot(uint index) public{
        drugs[index].Status = Status.ListedLot;
    }
    modifier unlistCond(uint _Index){
    require(drugs[_Index].Status == Status.Listed);
     _;
    }
    modifier unlistLotCond(uint _Index){
    require(drugs[_Index].Status == Status.ListedLot);
     _;
    }

    function unlistDrug(uint index) unlistCond(index) public{
        drugs[index].Status = Status.Received;
    }
    function unlistDrugLot(uint index) unlistLotCond(index) public{
        drugs[index].Status = Status.Created;
    }
    function isListed(uint index) public view returns(bool){
        if (drugs[index].Status == Status.Listed){
            return true;
        }
        return false;
    }
    function isOrderAccepted(uint index) public view returns(bool){
        if (orders[index].Status == OrderStatus.Accepted){
            return true;
        }
        return false;
    }
    function isOrderOrdered(uint index) public view returns(bool){
        if (orders[index].Status == OrderStatus.Ordered){
            return true;
        }
        return false;
    }
    function isOrderDeclined(uint index) public view returns(bool){
        if (orders[index].Status == OrderStatus.Declined){
            return true;
        }
        return false;
    }
    function isOrderDelivering(uint index) public view returns(bool){
        if (orders[index].Status == OrderStatus.Delivering){
            return true;
        }
        return false;
    }
    
function setDistributor(uint orderId) public  {
    require(orders[orderId].Status == OrderStatus.Accepted, "Order has not been placed yet");
    orders[orderId].distributor = msg.sender;
}

}