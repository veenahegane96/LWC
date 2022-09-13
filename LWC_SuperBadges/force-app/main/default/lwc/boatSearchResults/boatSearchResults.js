import { LightningElement, wire, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { publish, MessageContext } from 'lightning/messageService';
import BoatMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';
export default class BoatSearchResults extends LightningElement {
  selectedBoatId;
  columns = [];
  @api boatTypeId = '';
  boats;
  isLoading = false;
  error;

  columns = [
    { label: 'Name', fieldName: 'Name', editable: true },
    { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true },
    { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
    { label: 'Description', fieldName: 'Description__c', type: 'textarea', editable: true }
];
  // wired message context
  @wire(MessageContext)
  messageContext;
  

  // wired getBoats method 
  @wire(getBoats, {boatTypeId: '$boatTypeId'})
    wiredBoats({data, error}) {
        if (data) {
            this.boats = data;
            this.isLoading = false;
            this.notifyLoading(this.isLoading);
        } else if (error) {
            console.log('data.error')
            console.log(error);
            this.isLoading = false;
            this.notifyLoading(this.isLoading);
        }
    }
  
  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) { 
    this.isLoading=true;
    this.notifyLoading(this.isLoading);
    this.boatTypeId=boatTypeId;
    console.log('got the boatTypeId=>',this.boatTypeId);
  }
  
  
  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  async refresh() {
    this.notifyLoading(true);
    refreshApex(this.boats);
    this.notifyLoading(false);

   }
  
  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) { 
    this.selectedBoatId=event.detail.boatId;
    console.log('new boatId=>',this.selectedBoatId);
    this.sendMessageService(this.selectedBoatId);
  }
  
  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) { 
    const message = {
      recordId:boatId
    };
    publish(this.messageContext, BoatMC, message);
    console.log('selected boat published');


    // explicitly pass boatId to the parameter recordId
  }
  
  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    // notify loading
    this.notifyLoading(true);
    const updatedFields = event.detail.draftValues;
    console.log('changed values from data table=>',updatedFields);
    console.log('changed values from data table=>',JSON.stringify(updatedFields));

    // Update the records via Apex
    updateBoatList({data: updatedFields})
    .then((result) => {
      console.log('updated result=>',result);
      this.dispatchEvent(
        new ShowToastEvent({
            title: SUCCESS_TITLE,
            message: MESSAGE_SHIP_IT,
            variant: SUCCESS_VARIANT
        })
  );
    })
    .catch(error => {
      this.dispatchEvent(
        new ShowToastEvent({
            title: ERROR_TITLE,
            message: error.body.message,
            variant: ERROR_VARIANT
        })
  );
    })
    .finally(() => {
      this.notifyLoading(false);
      this.draftValues = [];
      this.refresh();
    });
  }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) { 
    if (isLoading) {
      this.dispatchEvent(new CustomEvent('loading'));
    } else {
      this.dispatchEvent(CustomEvent('doneloading'));
    }

  }
}