import { api, LightningElement, wire } from 'lwc';
import {
  subscribe,
  unsubscribe,
  APPLICATION_SCOPE,
  MessageContext
} from 'lightning/messageService';
import BoatMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { getRecord } from 'lightning/uiRecordApi';
const LONGITUDE_FIELD='Boat__c.Geolocation__Longitude__s';
const LATITUDE_FIELD='Boat__c.Geolocation__Latitude__s';
const BOAT_FIELDS=[LONGITUDE_FIELD, LATITUDE_FIELD];

export default class BoatMap extends LightningElement {
  // private
  subscription = null;
  @api boatId;

  @api get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute('boatId', value);
    this.boatId = value;
  }

  error = undefined;
  mapMarkers = [];

  @wire(MessageContext)
  messageContext;

  // Getting record's location to construct map markers using recordId
  // Wire the getRecord method using ('$boatId')
  @wire (getRecord,{recordId:'$boatId', fields:BOAT_FIELDS})
  wiredRecord({ error, data }) {
    // Error handling
    if (data) {
      this.error = undefined;
      const longitude = data.fields.Geolocation__Longitude__s.value;
      const latitude = data.fields.Geolocation__Latitude__s.value;
      this.updateMap(longitude, latitude);
    } else if (error) {
      console.log('error==>',JSON.stringify(error));
      this.error = error;
      this.boatId = undefined;
      this.mapMarkers = [];
    }
  }

  // Subscribes to the message channel
  subscribeMC() {
    // recordId is populated on Record Pages, and this component
    // should not update when this component is on a record page.
    console.log('Inside subscribe');

    if (this.subscription || this.recordId) {
      return;
    }
    if(!this.subscription){
    this.subscription=subscribe(this.messageContext,BoatMC,(message)=>{console.log('message inside subscription boatId=>',message.recordId);
    this.boatId=message.recordId},
     { scope: APPLICATION_SCOPE });
    }

    // Subscribe to the message channel to retrieve the recordId and explicitly assign it to boatId.
  }

  // Calls subscribeMC()
  connectedCallback() {
    console.log('this.mapMarkers.length',this.mapMarkers.length);
    this.subscribeMC();
  }

  disconnectedCallback() {
    this.unsubscribeToMessageChannel();
  }

  unsubscribeToMessageChannel() {   
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  // Creates the map markers array with the current boat's location for the map.
  updateMap(Longitude, Latitude) {
    console.log('inside updateMap=>',Longitude+' '+Latitude);
    this.mapMarkers = [
      {
          location: {
              Latitude: Latitude,
              Longitude: Longitude,
          }
      }
  ];

  }

  // Getter method for displaying the map component, or a helper method.
  get showMap() {
    return this.mapMarkers.length > 0;
  }
}