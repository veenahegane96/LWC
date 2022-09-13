import { LightningElement,api,wire } from 'lwc';
import {
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE,
    MessageContext
  } from 'lightning/messageService';
import BoatMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelDetails from '@salesforce/label/c.Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import { getRecord } from 'lightning/uiRecordApi';
import { getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import Boat__c from '@salesforce/schema/Boat__c';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];
export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
  boatId;
  wiredRecord;
  label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat,
  };

  @wire(MessageContext)
  messageContext;
  
  @wire (getRecord,{recordId:'$boatId', fields:BOAT_FIELDS})  
  wiredRecord(result) {
      this.wiredRecord=result;
      console.log('boatDetailsRecord wiredRecord=>',this.wiredRecord);
      if(result.error) {
        console.log('error==>',JSON.stringify(result.error));
        this.boatId = undefined;
      }
    } 
  

  get detailsTabIconName() { 
    return this.wiredRecord.data ? 'utility:anchor' : null;
  }
  
  get boatName() { 
    return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
  }
  
  // Private
  subscription = null;
  
  subscribeMC() {

    if (this.subscription) {
      return;
  }
  // Subscribe to the message channel to retrieve the recordId and explicitly assign it to boatId.
  this.subscription = subscribe(
      this.messageContext,
      BOATMC,
      (message) => { this.boatId = message.recordId },
      { scope: APPLICATION_SCOPE }
  );
  }
  
  connectedCallback() {
    this.subscribeMC();
   }
  
  navigateToRecordViewPage() {
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
          recordId: this.boatId,
          actionName: 'view'
      }
  });
     
   }
  
  handleReviewCreated() { 
    console.log('handled createreview');
    this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
    this.template.querySelector('c-boat-reviews').refresh();
  }
}
