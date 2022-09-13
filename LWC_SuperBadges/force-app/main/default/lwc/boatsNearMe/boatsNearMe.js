import { LightningElement, api, wire } from "lwc";
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
export default class BoatsNearMe extends LightningElement {
  @api boatTypeId;
  mapMarkers = [];
  isLoading = true;
  isRendered;
  latitude;
  longitude;
  

  connectedCallback(){
    console.log('boatTypeId in nearme connectedCallback=>',this.boatTypeId);
  }

  @wire(getBoatsByLocation, {latitude: '$latitude', longitude: '$longitude', boatTypeId: '$boatTypeId'})
    wiredBoatsJSON({error, data}) {
        if (data) {
            this.createMapMarkers(data);
        } else if (error) {
            const toast = new ShowToastEvent({
                title: ERROR_TITLE,
                message: error.message,
                variant: ERROR_VARIANT,
            });
            this.dispatchEvent(toast);
        }
        this.isLoading = false;
    }
  
  // Controls the isRendered property
  // Calls getLocationFromBrowser()
  renderedCallback() { 
    if(!this.isRendered){
        this.getLocationFromBrowser();
    }
    this.isRendered=true;
    console.log('boatTypeId in nearme=>',this.boatTypeId);

    console.log('isrender=>',this.isRendered);
  }
  
  // Gets the location from the Browser
  // position => {latitude and longitude}
  getLocationFromBrowser() {
    console.log('inside location fetching');
        navigator.geolocation.getCurrentPosition(position=>{
            this.latitude= position.coords.latitude;
            this.longitude=position.coords.longitude;
            console.log('lat-log'+this.latitude+' '+this.longitude);
        });
  
   }
  
  // Creates the map markers
  createMapMarkers(boatData) {
    
  const newMarkers = boatData.map(boat => {
    console.log('boatt=>>',boat);
    return{
      location: {
          Latitude: boat.Geolocation__Latitude__s,
          Longitude: boat.Geolocation__Longitude__s
        },
      title: boat.Name
    }
  });

 newMarkers.unshift({
      location: {
        Latitude: this.latitude,
        Longitude: this.longitude
      },
      title:LABEL_YOU_ARE_HERE,
      icon:ICON_STANDARD_USER
  });

  console.log('after unshift newMarkers=>',newMarkers);
  this.mapMarkers=newMarkers;
  }
}